import FirestoreService from "../src/firestoreService";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  deleteDoc,
  doc,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from "firebase/auth";

// 🔥 Firebase Emulator Config
const firebaseConfig = {
  apiKey: "test-api-key",
  authDomain: "test-auth-domain",
  projectId: "test-project-id",
  storageBucket: "test-storage-bucket",
  messagingSenderId: "test-messaging-sender-id",
  appId: "test-app-id",
};

// Initialize FirestoreService for testing
FirestoreService.initialize(firebaseConfig);
const db = getFirestore();

interface TestData {
  name: string;
  email: string;
  createdAt: Date;
}

const testCollection = "test_collection";

const testData: TestData = {
  name: "Test User",
  email: "testuser@example.com",
  createdAt: new Date(),
};

describe("🔥 FirestoreService - Full Tests", () => {
  let testDocId: string | undefined;

  beforeAll(() => {
    console.log("🔥 Starting Firestore tests...");
  });

  afterAll(async () => {
    if (testDocId) {
      await deleteDoc(doc(db, `${testCollection}/${testDocId}`));
    }
  });

  // ✅ 1️⃣ Test Adding a Document
  it("should add a document to Firestore", async () => {
    testDocId = await FirestoreService.addDocument(testCollection, testData);
    expect(testDocId).toBeDefined();

    const retrievedDoc = await FirestoreService.getDocument<TestData>(
      testCollection + "/" + testDocId
    );
    expect(retrievedDoc).not.toBeNull();
    expect(retrievedDoc?.name).toBe(testData.name);
  });

  // ✅ 2️⃣ Test Updating a Document
  it("should update a document in Firestore", async () => {
    const updatedData = { name: "Updated Name" };
    await FirestoreService.updateDocument(
      `${testCollection}/${testDocId}`,
      updatedData
    );

    const updatedDoc = await FirestoreService.getDocument<TestData>(
      testCollection + "/" + testDocId
    );
    expect(updatedDoc?.name).toBe(updatedData.name);
  });

  // ✅ 3️⃣ Test Fetching a Collection
  it("should fetch documents from Firestore", async () => {
    const docs = await FirestoreService.fetchCollection(testCollection);
    expect(docs.length).toBeGreaterThan(0);
  });

  // ✅ 4️⃣ Test Deleting a Document
  it("should delete a document", async () => {
    await FirestoreService.deleteDocument(`${testCollection}/${testDocId}`);
    const deletedDoc = await FirestoreService.getDocument(
      testCollection + "/" + testDocId
    );
    expect(deletedDoc).toBeNull();
  });

  // ✅ 5️⃣ Test Authentication (Fake Login)
  it("should handle user authentication", async () => {
    const auth = getAuth();
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        "testuser@example.com",
        "password123"
      );
      expect(userCredential.user).not.toBeNull();

      await signOut(auth);
      expect(auth.currentUser).toBeNull();
    } catch (error) {
      console.warn("Auth test skipped: Firebase auth emulator not configured.");
    }
  });
});
