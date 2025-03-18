// tests/FirestoreServiceFull.test.ts

import { getApp, deleteApp } from "firebase/app";
import { getFirestore, deleteDoc, doc } from "firebase/firestore";

import FirestoreService from "../src/firestoreService";

jest.setTimeout(20000);

const firebaseConfig = {
  apiKey: "fake-api-key",
  authDomain: "localhost",
  projectId: "test-project-id", // same as ExampleEntity
  storageBucket: "test-bucket",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:fakeappid",
};

const testCollection = "test_collection";
const testData = {
  name: "Test User",
  email: "testuser@example.com",
  createdAt: new Date(),
};

describe("🔥 FirestoreService - Full Tests", () => {
  let db: ReturnType<typeof getFirestore>;
  let testDocId: string | undefined;

  // 1️⃣ Single initialization + emulator connect
  beforeAll(async () => {
    FirestoreService.initialize(firebaseConfig);
    FirestoreService.connectEmulator(9098);
    db = getFirestore(); // get updated Firestore instance if needed
    console.log("🔥 Starting Firestore & Auth tests against emulator...");
  });

  // 2️⃣ Global teardown
  afterAll(async () => {
    if (testDocId) {
      await deleteDoc(doc(db, testCollection, testDocId));
    }
    await deleteApp(getApp());
    console.log("🛑 Cleaned up Firestore app & docs");
  });

  // ✅ 1) Add Document
  it("should add a document to Firestore", async () => {
    testDocId = await FirestoreService.addDocument(testCollection, testData);
    expect(testDocId).toBeDefined();

    const retrievedDoc = await FirestoreService.getDocument<typeof testData>(
      `${testCollection}/${testDocId}`
    );
    expect(retrievedDoc).not.toBeNull();
    expect(retrievedDoc?.name).toBe(testData.name);
  });

  // ✅ 2) Update Document
  it("should update a document in Firestore", async () => {
    const updatedData = { name: "Updated Name" };
    await FirestoreService.updateDocument(
      `${testCollection}/${testDocId}`,
      updatedData
    );

    const updatedDoc = await FirestoreService.getDocument<typeof testData>(
      `${testCollection}/${testDocId}`
    );
    expect(updatedDoc?.name).toBe("Updated Name");
  });

  // ✅ 3) Fetch Collection
  it("should fetch documents from Firestore", async () => {
    const docs = await FirestoreService.fetchCollection<typeof testData>(
      testCollection
    );
    expect(docs.length).toBeGreaterThan(0);
  });

  // ✅ 4) Delete Document
  it("should delete a document", async () => {
    await FirestoreService.deleteDocument(`${testCollection}/${testDocId}`);
    const deletedDoc = await FirestoreService.getDocument(
      testCollection + "/" + testDocId
    );
    expect(deletedDoc).toBeNull();
  });
});
