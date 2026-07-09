import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import type {
  ContinueLearningPlaylist,
  ContinueLearningPlaylistDocument,
  CreateContinueLearningPlaylistInput,
  UpdateContinueLearningPlaylistInput,
} from '../../store/content/types/continueLearningPlaylists.types';
import { isCourseTrack } from '../../store/content/types/courses.types';
import type { CourseTrack } from '../../store/content/types/courses.types';
import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import {
  applyLearnerContentFilters,
  buildSchoolAudienceWriteFields,
  mapSchoolAudienceFields,
} from './schoolAudienceFirestore';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { syncFirestoreAuthSession } from '../../utils/firebase/firestoreSessionSync';
import { FIRESTORE_COLLECTIONS } from './constants';
import {
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from './firestoreClient';

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
  return collection(db, FIRESTORE_COLLECTIONS.continueLearningPlaylists);
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
    videoCount:
      typeof data?.videoCount === 'number' && data.videoCount > 0
        ? Math.trunc(data.videoCount)
        : 1,
    sortOrder: typeof data?.sortOrder === 'number' ? data.sortOrder : 0,
    track: data && isCourseTrack(data.track) ? data.track : null,
    isPublished: data?.isPublished === true,
    createdAt: data && isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: data && isTimestamp(data.updatedAt) ? data.updatedAt : null,
    ...mapSchoolAudienceFields(data),
  };
}

function sortPlaylists(
  playlists: ContinueLearningPlaylist[],
): ContinueLearningPlaylist[] {
  return [...playlists].sort((a, b) => a.sortOrder - b.sortOrder);
}

export type ContinueLearningPlaylistSubscribeOptions = ContentSubscribeOptions & {
  viewerTrack?: CourseTrack;
};

export function subscribeContinueLearningPlaylists(
  listener: (playlists: ContinueLearningPlaylist[]) => void,
  options?: ContinueLearningPlaylistSubscribeOptions,
  onError?: (error: unknown) => void,
): () => void {
  const viewerTrack = options?.viewerTrack;
  const playlistsQuery = query(
    playlistsCollection(),
    orderBy('sortOrder', 'asc'),
  );

  return onSnapshot(
    playlistsQuery,
    snapshot => {
      const playlists = snapshot.docs.map(playlistDoc =>
        mapPlaylist(
          playlistDoc.id,
          playlistDoc.data() as Partial<ContinueLearningPlaylistDocument> | undefined,
        ),
      );

      let filtered = applyLearnerContentFilters(playlists, options);

      if (viewerTrack) {
        filtered = filtered.filter(
          item => item.track === viewerTrack || item.track == null,
        );
      }

      listener(sortPlaylists(filtered));
    },
    error => onError?.(error),
  );
}

async function getNextSortOrder(): Promise<number> {
  const snapshot = await getDocs(
    query(playlistsCollection(), orderBy('sortOrder', 'desc'), limit(1)),
  );

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
    if (!isCourseTrack(input.track)) {
      throw wrapFirebaseError(
        new Error('Playlist track is required.'),
        'VALIDATION_ERROR',
        'Select whether this playlist is for kids or professionals.',
      );
    }
    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = options?.playlistId
      ? doc(playlistsCollection(), options.playlistId)
      : doc(playlistsCollection());

    const payload: ContinueLearningPlaylistDocument = {
      title: input.title.trim(),
      subtitle: input.subtitle.trim(),
      imageUri: input.imageUri.trim(),
      playlistUrl: input.playlistUrl.trim(),
      videoCount: Math.max(1, Math.trunc(input.videoCount)),
      sortOrder,
      track: input.track,
      isPublished: input.isPublished ?? true,
      ...buildSchoolAudienceWriteFields(
        input.track === 'kids'
          ? input
          : { audience: 'all', schoolIds: [], schoolGradeIds: {} },
      ),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);

    return mapPlaylist(ref.id, {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
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
      updatedAt: serverTimestamp(),
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
    if (input.videoCount !== undefined) {
      updates.videoCount = Math.max(1, Math.trunc(input.videoCount));
    }
    if (input.sortOrder !== undefined) {
      updates.sortOrder = input.sortOrder;
    }
    if (input.isPublished !== undefined) {
      updates.isPublished = input.isPublished;
    }
    if (input.track !== undefined) {
      if (!isCourseTrack(input.track)) {
        throw wrapFirebaseError(
          new Error('Playlist track is required.'),
          'VALIDATION_ERROR',
          'Select whether this playlist is for kids or professionals.',
        );
      }
      updates.track = input.track;
    }
    if (
      input.audience !== undefined ||
      input.schoolIds !== undefined ||
      input.schoolGradeIds !== undefined ||
      input.track === 'professionals'
    ) {
      Object.assign(
        updates,
        buildSchoolAudienceWriteFields(
          input.track === 'professionals'
            ? { audience: 'all', schoolIds: [], schoolGradeIds: {} }
            : input,
        ),
      );
    }

    await updateDoc(doc(playlistsCollection(), playlistId), updates as UpdateData<DocumentData>);
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
    await deleteDoc(doc(playlistsCollection(), playlistId));
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
    const batch = writeBatch(db);

    orderedIds.forEach((id, index) => {
      batch.update(doc(playlistsCollection(), id), {
        sortOrder: Math.trunc(index),
        updatedAt: serverTimestamp(),
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
