import { getFirestore } from '@react-native-firebase/firestore';

export {
  collection,
  deleteDoc,
  doc,
  enableNetwork,
  getDoc,
  getDocFromServer,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  waitForPendingWrites,
  writeBatch,
} from '@react-native-firebase/firestore';

export const db = getFirestore();
