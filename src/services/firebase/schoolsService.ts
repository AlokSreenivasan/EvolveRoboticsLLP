import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import type {
  CreateSchoolInput,
  School,
  SchoolDocument,
  UpdateSchoolInput,
} from '../../store/content/types/schools.types';
import { wrapFirebaseError } from '../../utils/firebase/errors';
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

function schoolsCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.schools);
}

function mapSchool(id: string, data: SchoolDocument): School {
  return {
    id,
    name: data.name?.trim() ?? '',
    city: data.city?.trim() ?? '',
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
  };
}

function sortSchools(schools: School[]): School[] {
  return [...schools].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function subscribeSchools(
  listener: (schools: School[]) => void,
  onError?: (error: unknown) => void,
): () => void {
  const schoolsQuery = query(schoolsCollection(), orderBy('sortOrder', 'asc'));

  return onSnapshot(
    schoolsQuery,
    snapshot => {
      const schools = snapshot.docs.map(schoolDoc =>
        mapSchool(schoolDoc.id, schoolDoc.data() as SchoolDocument),
      );
      listener(sortSchools(schools));
    },
    error => onError?.(error),
  );
}

async function getNextSortOrder(): Promise<number> {
  const snapshot = await getDocs(
    query(schoolsCollection(), orderBy('sortOrder', 'desc'), limit(1)),
  );

  if (snapshot.empty) {
    return 0;
  }

  const top = snapshot.docs[0].data() as SchoolDocument;
  return (typeof top.sortOrder === 'number' ? top.sortOrder : 0) + 1;
}

export async function createSchool(input: CreateSchoolInput): Promise<School> {
  try {
    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = doc(schoolsCollection());
    const payload: SchoolDocument = {
      name: input.name.trim(),
      city: input.city?.trim() ?? '',
      sortOrder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);

    return mapSchool(ref.id, {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to create school.');
  }
}

export async function updateSchool(
  schoolId: string,
  input: UpdateSchoolInput,
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (input.name !== undefined) {
      updates.name = input.name.trim();
    }
    if (input.city !== undefined) {
      updates.city = input.city.trim();
    }
    if (input.sortOrder !== undefined) {
      updates.sortOrder = input.sortOrder;
    }

    await updateDoc(
      doc(schoolsCollection(), schoolId),
      updates as UpdateData<DocumentData>,
    );
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to update school.');
  }
}

export async function deleteSchool(schoolId: string): Promise<void> {
  try {
    await deleteDoc(doc(schoolsCollection(), schoolId));
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to delete school.');
  }
}

export async function reorderSchools(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) {
    return;
  }

  try {
    const batch = writeBatch(db);

    orderedIds.forEach((id, index) => {
      batch.update(doc(schoolsCollection(), id), {
        sortOrder: Math.trunc(index),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to reorder schools.',
    );
  }
}

export async function moveSchool(
  schoolId: string,
  direction: 'up' | 'down',
  currentSchools: School[],
): Promise<void> {
  const ids = currentSchools.map(school => school.id);
  const index = ids.indexOf(schoolId);

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

  await reorderSchools(nextIds);
}
