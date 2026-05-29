import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

import type {
  ContinueLearningPlaylist,
  ContinueLearningPlaylistDocument,
  CreateContinueLearningPlaylistInput,
  UpdateContinueLearningPlaylistInput,
} from '../../store/content/types/continueLearningPlaylists.types';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { syncFirestoreAuthSession } from '../../utils/firebase/firestoreSessionSync';
import { FIRESTORE_COLLECTIONS } from './constants';

function isTimestamp(
  value: unknown,
): value is FirebaseFirestoreTypes.Timestamp {
  return (
    value != null &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as FirebaseFirestoreTypes.Timestamp).toDate === 'function'
  );
}

function playlistsCollection() {
  return firestore().collection(FIRESTORE_COLLECTIONS.continueLearningPlaylists);
}

function mapPlaylist(
  id: string,
  data: Partial<ContinueLearningPlaylistDocument> | undefined,
): ContinueLearningPlaylist {
  return {
    id,
    title: data?.title?.trim() ?? '',
    subtitle: data?.subtitle?.trim() ?? '',
    imageUri: data?.imageUri?.trim() ?? '',
    playlistUrl: data?.playlistUrl?.trim() ?? '',
    sortOrder: typeof data?.sortOrder === 'number' ? data.sortOrder : 0,
    isPublished: data?.isPublished === true,
    createdAt: isTimestamp(data?.createdAt) ? data?.createdAt : null,
    updatedAt: isTimestamp(data?.updatedAt) ? data?.updatedAt : null,
  };
}

function sortPlaylists(
  playlists: ContinueLearningPlaylist[],
): ContinueLearningPlaylist[] {
  return [...playlists].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function subscribeContinueLearningPlaylists(
  listener: (playlists: ContinueLearningPlaylist[]) => void,
  options?: { includeUnpublished?: boolean },
  onError?: (error: unknown) => void,
): () => void {
  const includeUnpublished = options?.includeUnpublished === true;

  return playlistsCollection()
    .orderBy('sortOrder', 'asc')
    .onSnapshot(
      snapshot => {
        const playlists = snapshot.docs.map(doc =>
          mapPlaylist(
            doc.id,
            doc.data() as Partial<ContinueLearningPlaylistDocument> | undefined,
          ),
        );

        const filtered = includeUnpublished
          ? playlists
          : playlists.filter(item => item.isPublished);

        listener(sortPlaylists(filtered));
      },
      error => onError?.(error),
    );
}

async function getNextSortOrder(): Promise<number> {
  const snapshot = await playlistsCollection()
    .orderBy('sortOrder', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return 0;
  }

  const top = snapshot.docs[0].data() as Partial<ContinueLearningPlaylistDocument>;
  return (typeof top.sortOrder === 'number' ? top.sortOrder : 0) + 1;
}

export async function createContinueLearningPlaylist(
  input: CreateContinueLearningPlaylistInput,
  options?: { playlistId?: string },
): Promise<ContinueLearningPlaylist> {
  try {
    await syncFirestoreAuthSession();
    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = options?.playlistId
      ? playlistsCollection().doc(options.playlistId)
      : playlistsCollection().doc();

    const payload: ContinueLearningPlaylistDocument = {
      title: input.title.trim(),
      subtitle: input.subtitle.trim(),
      imageUri: input.imageUri.trim(),
      playlistUrl: input.playlistUrl.trim(),
      sortOrder,
      isPublished: input.isPublished ?? true,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await ref.set(payload);

    return mapPlaylist(ref.id, {
      ...payload,
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
    } as unknown as ContinueLearningPlaylistDocument);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to create playlist.',
    );
  }
}

export async function updateContinueLearningPlaylist(
  playlistId: string,
  input: UpdateContinueLearningPlaylistInput,
): Promise<void> {
  try {
    await syncFirestoreAuthSession();
    const updates: Record<string, unknown> = {
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    if (input.title !== undefined) {
      updates.title = input.title.trim();
    }
    if (input.subtitle !== undefined) {
      updates.subtitle = input.subtitle.trim();
    }
    if (input.imageUri !== undefined) {
      updates.imageUri = input.imageUri.trim();
    }
    if (input.playlistUrl !== undefined) {
      updates.playlistUrl = input.playlistUrl.trim();
    }
    if (input.sortOrder !== undefined) {
      updates.sortOrder = input.sortOrder;
    }
    if (input.isPublished !== undefined) {
      updates.isPublished = input.isPublished;
    }

    await playlistsCollection().doc(playlistId).update(updates);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update playlist.',
    );
  }
}

export async function deleteContinueLearningPlaylist(
  playlistId: string,
): Promise<void> {
  try {
    await playlistsCollection().doc(playlistId).delete();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to delete playlist.',
    );
  }
}

export async function reorderContinueLearningPlaylists(
  orderedIds: string[],
): Promise<void> {
  if (orderedIds.length === 0) {
    return;
  }

  try {
    const batch = firestore().batch();

    orderedIds.forEach((id, index) => {
      batch.update(playlistsCollection().doc(id), {
        sortOrder: Math.trunc(index),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to reorder playlists.',
    );
  }
}

export async function moveContinueLearningPlaylist(
  playlistId: string,
  direction: 'up' | 'down',
  currentPlaylists: ContinueLearningPlaylist[],
): Promise<void> {
  const ids = currentPlaylists.map(item => item.id);
  const index = ids.indexOf(playlistId);
  if (index < 0) {
    return;
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= ids.length) {
    return;
  }

  const nextIds = [...ids];
  const [removed] = nextIds.splice(index, 1);
  nextIds.splice(targetIndex, 0, removed);
  await reorderContinueLearningPlaylists(nextIds);
}

export function extractYouTubePlaylistId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized.replace(/^\/\//, '')}`;
  }

  // Common formats:
  // - https://www.youtube.com/playlist?list=PLxxxx
  // - https://youtube.com/playlist?list=PLxxxx&si=...
  // - https://www.youtube.com/watch?v=...&list=PLxxxx
  const match = normalized.match(/[?&]list=([^&#]+)/i);
  if (match?.[1]) {
    return decodeURIComponent(match[1]);
  }

  return null;
}

/** Picks a playlist URL from form fields (handles paste in title by mistake). */
export function resolveYouTubePlaylistUrl(fields: {
  playlistUrl: string;
  title?: string;
  subtitle?: string;
}): string {
  const candidates = [
    fields.playlistUrl,
    fields.title ?? '',
    fields.subtitle ?? '',
  ];

  for (const candidate of candidates) {
    const id = extractYouTubePlaylistId(candidate);
    if (id) {
      return `https://www.youtube.com/playlist?list=${id}`;
    }
  }

  return fields.playlistUrl.trim();
}

export function isValidYouTubePlaylistUrl(url: string): boolean {
  return extractYouTubePlaylistId(url) != null;
}

