import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import { DEFAULT_PROJECTS_SECTION } from '../../constants/projectsDefaults';
import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import type {
  CreateProjectInput,
  Project,
  ProjectDocument,
  ProjectsSection,
  ProjectsSectionDocument,
  UpdateProjectInput,
  UpdateProjectsSectionInput,
} from '../../store/content/types/projects.types';
import {
  applyLearnerContentFilters,
  buildTrackAwareSchoolAudienceWriteFields,
  mapContentTrack,
  mapSchoolAudienceFields,
  shouldApplyTrackAwareSchoolAudienceUpdate,
} from './schoolAudienceFirestore';
import { isCourseTrack } from '../../store/content/types/courses.types';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { APP_CONTENT_DOCS, FIRESTORE_COLLECTIONS } from './constants';
import { buildSortedContentListQuery } from './contentListQuery';
import {
  collection,
  db,
  deleteDoc,
  doc,
  getDoc,
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

function sectionDocRef() {
  return doc(
    db,
    FIRESTORE_COLLECTIONS.appContent,
    APP_CONTENT_DOCS.projectsSection,
  );
}

function projectsCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.projects);
}

function mapSection(
  data: ProjectsSectionDocument | undefined,
): ProjectsSection {
  if (!data) {
    return DEFAULT_PROJECTS_SECTION;
  }

  return {
    sectionTitle:
      data.sectionTitle?.trim() || DEFAULT_PROJECTS_SECTION.sectionTitle,
    sectionSubtitle:
      data.sectionSubtitle?.trim() ?? DEFAULT_PROJECTS_SECTION.sectionSubtitle,
    actionLabel:
      data.actionLabel?.trim() ?? DEFAULT_PROJECTS_SECTION.actionLabel,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
  };
}

function mapProject(id: string, data: ProjectDocument): Project {
  return {
    id,
    title: data.title?.trim() ?? '',
    subtitle: data.subtitle?.trim() ?? '',
    description: data.description?.trim() ?? '',
    imageUri: data.imageUri?.trim() ?? '',
    track: mapContentTrack(data),
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    isPublished: data.isPublished === true,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
    ...mapSchoolAudienceFields(data),
  };
}

function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function subscribeProjectsSection(
  listener: (section: ProjectsSection) => void,
  onError?: (error: unknown) => void,
): () => void {
  return onSnapshot(
    sectionDocRef(),
    snapshot => {
      const data = snapshot.data() as ProjectsSectionDocument | undefined;
      listener(mapSection(data));
    },
    error => onError?.(error),
  );
}

export function subscribeProjects(
  listener: (projects: Project[]) => void,
  options?: ContentSubscribeOptions,
  onError?: (error: unknown) => void,
): () => void {
  const projectsQuery = buildSortedContentListQuery(projectsCollection(), options);

  return onSnapshot(
    projectsQuery,
    snapshot => {
      const projects = snapshot.docs.map(projectDoc =>
        mapProject(projectDoc.id, projectDoc.data() as ProjectDocument),
      );
      listener(sortProjects(applyLearnerContentFilters(projects, options)));
    },
    error => onError?.(error),
  );
}

export async function ensureProjectsSectionDefaults(): Promise<void> {
  try {
    const snapshot = await getDoc(sectionDocRef());
    if (snapshot.exists()) {
      return;
    }

    const payload: ProjectsSectionDocument = {
      ...DEFAULT_PROJECTS_SECTION,
      updatedAt: serverTimestamp(),
    };

    await setDoc(sectionDocRef(), payload);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to initialize projects section.',
    );
  }
}

export async function updateProjectsSection(
  input: UpdateProjectsSectionInput,
): Promise<ProjectsSection> {
  try {
    const payload: ProjectsSectionDocument = {
      sectionTitle: input.sectionTitle.trim(),
      sectionSubtitle: input.sectionSubtitle.trim(),
      actionLabel: DEFAULT_PROJECTS_SECTION.actionLabel,
      updatedAt: serverTimestamp(),
    };

    await setDoc(sectionDocRef(), payload, { merge: true });

    return {
      sectionTitle: payload.sectionTitle,
      sectionSubtitle: payload.sectionSubtitle,
      actionLabel: payload.actionLabel,
      updatedAt: null,
    };
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update projects screen headings.',
    );
  }
}

async function getNextSortOrder(): Promise<number> {
  const snapshot = await getDocs(
    query(projectsCollection(), orderBy('sortOrder', 'desc'), limit(1)),
  );

  if (snapshot.empty) {
    return 0;
  }

  const top = snapshot.docs[0].data() as ProjectDocument;
  return (typeof top.sortOrder === 'number' ? top.sortOrder : 0) + 1;
}

export async function createProject(
  input: CreateProjectInput,
  options?: { projectId?: string },
): Promise<Project> {
  try {
    if (!isCourseTrack(input.track)) {
      throw wrapFirebaseError(
        new Error('Project track is required.'),
        'FIRESTORE_ERROR',
        'Select whether this project is for kids or professionals.',
      );
    }

    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = options?.projectId
      ? doc(projectsCollection(), options.projectId)
      : doc(projectsCollection());
    const payload: ProjectDocument = {
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() ?? '',
      description: input.description?.trim() ?? '',
      imageUri: input.imageUri?.trim() ?? '',
      track: input.track,
      sortOrder,
      isPublished: input.isPublished ?? true,
      ...buildTrackAwareSchoolAudienceWriteFields(input.track, input),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);

    return mapProject(ref.id, {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to create project.',
    );
  }
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (input.title !== undefined) {
      updates.title = input.title.trim();
    }
    if (input.subtitle !== undefined) {
      updates.subtitle = input.subtitle.trim();
    }
    if (input.description !== undefined) {
      updates.description = input.description.trim();
    }
    if (input.imageUri !== undefined) {
      updates.imageUri = input.imageUri.trim();
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
          new Error('Project track is required.'),
          'FIRESTORE_ERROR',
          'Select whether this project is for kids or professionals.',
        );
      }
      updates.track = input.track;
    }
    if (shouldApplyTrackAwareSchoolAudienceUpdate(input)) {
      Object.assign(
        updates,
        buildTrackAwareSchoolAudienceWriteFields(
          input.track === 'professionals' ? 'professionals' : input.track ?? 'kids',
          input,
        ),
      );
    }

    await updateDoc(
      doc(projectsCollection(), projectId),
      updates as UpdateData<DocumentData>,
    );
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update project.',
    );
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    await deleteDoc(doc(projectsCollection(), projectId));
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to delete project.',
    );
  }
}

export async function reorderProjects(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) {
    return;
  }

  try {
    const batch = writeBatch(db);

    orderedIds.forEach((id, index) => {
      batch.update(doc(projectsCollection(), id), {
        sortOrder: Math.trunc(index),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to reorder projects.',
    );
  }
}

export async function moveProject(
  projectId: string,
  direction: 'up' | 'down',
  currentProjects: Project[],
): Promise<void> {
  const ids = currentProjects.map(project => project.id);
  const index = ids.indexOf(projectId);

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

  await reorderProjects(nextIds);
}
