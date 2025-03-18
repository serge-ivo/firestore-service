import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const testConfig = {
  projectId: 'firestore-service-test',
  apiKey: 'fake-api-key',
  authDomain: 'demo-test.firebaseapp.com'
};

// Initialize Firebase
export const app = initializeApp(testConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Connect to emulators
connectFirestoreEmulator(db, 'localhost', 9098);
connectAuthEmulator(auth, 'http://localhost:9099');
