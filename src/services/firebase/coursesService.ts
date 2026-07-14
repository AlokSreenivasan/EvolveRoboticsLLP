import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type {
  Course,
  CourseDocument,
  CourseTrack,
  CreateCourseInput,
  UpdateCourseInput,
} from '../../store/content/types/courses.types';
import { isCourseTrack } from '../../store/content/types/courses.types';
import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import {
  applyLearnerContentFilters,
  buildTrackAwareSchoolAudienceWriteFields,
  mapContentTrack,
  mapSchoolAudienceFields,
  shouldApplyTrackAwareSchoolAudienceUpdate,
} from './schoolAudienceFirestore';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { syncFirestoreAuthSession } from '../../utils/firebase/firestoreSessionSync';
import { FIRESTORE_COLLECTIONS } from './constants';
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

function coursesCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.courses);
}

function mapCourse(
  id: string,
  data: Partial<CourseDocument> | undefined,
): Course {
  return {
    id,
    title: data?.title?.trim() ?? '',
    subtitle: data?.subtitle?.trim() ?? '',
    imageUri: data?.imageUri?.trim() ?? '',
    durationLabel: data?.durationLabel?.trim() ?? '',
    description: data?.description?.trim() ?? '',
    track: mapContentTrack(data),
    sortOrder: typeof data?.sortOrder === 'number' ? data.sortOrder : 0,
    isPublished: data?.isPublished === true,
    createdAt: data && isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: data && isTimestamp(data.updatedAt) ? data.updatedAt : null,
    ...mapSchoolAudienceFields(data),
  };
}

function sortCourses(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function subscribeCourses(
  listener: (courses: Course[]) => void,
  options?: ContentSubscribeOptions,
  onError?: (error: unknown) => void,
): () => void {
  const coursesQuery = buildSortedContentListQuery(coursesCollection(), options);

  return onSnapshot(
    coursesQuery,
    snapshot => {
      const courses = snapshot.docs.map(courseDoc =>
        mapCourse(
          courseDoc.id,
          courseDoc.data() as Partial<CourseDocument> | undefined,
        ),
      );

      listener(sortCourses(applyLearnerContentFilters(courses, options)));
    },
    error => onError?.(error),
  );
}

async function getNextSortOrder(): Promise<number> {
  try {
    await syncFirestoreAuthSession();
    const snapshot = await getDocs(
      query(coursesCollection(), orderBy('sortOrder', 'desc'), limit(1)),
    );

    if (snapshot.empty) {
      return 0;
    }

    const top = snapshot.docs[0].data() as Partial<CourseDocument>;
    return (typeof top.sortOrder === 'number' ? top.sortOrder : 0) + 1;
  } catch {
    return 0;
  }
}

export async function createCourse(
  input: CreateCourseInput,
  options?: { courseId?: string },
): Promise<Course> {
  try {
    await syncFirestoreAuthSession();
    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = options?.courseId
      ? doc(coursesCollection(), options.courseId)
      : doc(coursesCollection());

    if (!isCourseTrack(input.track)) {
      throw wrapFirebaseError(
        new Error('Course track is required.'),
        'FIRESTORE_ERROR',
        'Select whether this course is for kids or professionals.',
      );
    }

    const payload: CourseDocument = {
      title: input.title.trim(),
      subtitle: input.subtitle.trim(),
      imageUri: input.imageUri.trim(),
      durationLabel: input.durationLabel.trim(),
      description: input.description.trim(),
      track: input.track,
      sortOrder,
      isPublished: input.isPublished ?? true,
      ...buildTrackAwareSchoolAudienceWriteFields(input.track, input),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);

    return mapCourse(ref.id, {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to create course.');
  }
}

export async function updateCourse(
  courseId: string,
  input: UpdateCourseInput,
): Promise<void> {
  try {
    await syncFirestoreAuthSession();
    const ref = doc(coursesCollection(), courseId);
    const existing = await getDoc(ref);
    const current = mapCourse(
      courseId,
      existing.data() as Partial<CourseDocument> | undefined,
    );

    const payload: {
      title: string;
      subtitle: string;
      imageUri: string;
      durationLabel: string;
      description: string;
      track?: CourseTrack;
      sortOrder: number;
      isPublished: boolean;
      updatedAt: ReturnType<typeof serverTimestamp>;
      audience?: 'all' | 'schools';
      schoolIds?: string[];
      schoolGradeIds?: Record<string, string[]>;
    } = {
      title: input.title !== undefined ? input.title.trim() : current.title,
      subtitle:
        input.subtitle !== undefined ? input.subtitle.trim() : current.subtitle,
      imageUri:
        input.imageUri !== undefined ? input.imageUri.trim() : current.imageUri,
      durationLabel:
        input.durationLabel !== undefined
          ? input.durationLabel.trim()
          : current.durationLabel,
      description:
        input.description !== undefined
          ? input.description.trim()
          : current.description,
      sortOrder:
        input.sortOrder !== undefined ? input.sortOrder : current.sortOrder,
      isPublished:
        input.isPublished !== undefined
          ? input.isPublished
          : current.isPublished,
      updatedAt: serverTimestamp(),
    };

    if (input.track !== undefined) {
      if (!isCourseTrack(input.track)) {
        throw wrapFirebaseError(
          new Error('Course track is required.'),
          'FIRESTORE_ERROR',
          'Select whether this course is for kids or professionals.',
        );
      }
      payload.track = input.track;
    } else if (isCourseTrack(current.track)) {
      payload.track = current.track;
    }

    if (shouldApplyTrackAwareSchoolAudienceUpdate(input)) {
      Object.assign(
        payload,
        buildTrackAwareSchoolAudienceWriteFields(
          input.track === 'professionals'
            ? 'professionals'
            : input.track ?? current.track ?? 'kids',
          input,
        ),
      );
    }

    await setDoc(ref, payload, { merge: true });
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to update course.');
  }
}

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    await syncFirestoreAuthSession();
    await deleteDoc(doc(coursesCollection(), courseId));
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to delete course.');
  }
}

export async function reorderCourses(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) {
    return;
  }

  try {
    await syncFirestoreAuthSession();
    await Promise.all(
      orderedIds.map((id, index) =>
        updateCourse(id, { sortOrder: Math.trunc(index) }),
      ),
    );
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to reorder courses.',
    );
  }
}

export async function moveCourse(
  courseId: string,
  direction: 'up' | 'down',
  currentCourses: Course[],
): Promise<void> {
  const ids = currentCourses.map(course => course.id);
  const index = ids.indexOf(courseId);

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

  await reorderCourses(nextIds);
}
