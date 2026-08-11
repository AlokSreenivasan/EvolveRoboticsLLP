import { getFirestore } from '@react-native-firebase/firestore';

export {
  collection,
  deleteDoc,
  doc,
  documentId,
  enableNetwork,
  getDoc,
  getDocFromServer,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  waitForPendingWrites,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';

export const db = getFirestore();
