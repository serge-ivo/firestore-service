// tests/FirestoreServiceFull.test.ts

import { getApp } from "firebase/app";
import { getFirestore, deleteDoc, doc } from "firebase/firestore";
import { FirestoreService } from "../firestoreService";

jest.setTimeout(20000);

interface TestDocument {
  name: string;
  value: number;
}

const testCollection = "test-collection";
const testDocId = "test-doc";

describe("🔥 FirestoreService - Full Tests", () => {
  let db: ReturnType<typeof getFirestore>;

  beforeAll(() => {
    db = getFirestore(getApp());
    console.log("🔥 Starting Firestore tests against emulator...");
  });

  beforeEach(async () => {
    // Clean up any existing test data
    await FirestoreService.deleteCollection("examples");
  });

  it("should add a document to Firestore", async () => {
    const testData: TestDocument = { name: "Test Document", value: 42 };
    const docId = await FirestoreService.addDocument("examples", testData);
    expect(docId).toBeDefined();
    expect(typeof docId).toBe("string");
  });

  it("should update a document in Firestore", async () => {
    // First create a document
    const testData: TestDocument = { name: "Test Document", value: 42 };
    const docId = await FirestoreService.addDocument("examples", testData);
    expect(docId).toBeDefined();

    // Then update it
    const updateData = { value: 43 };
    await FirestoreService.updateDocument(`examples/${docId}`, updateData);

    // Verify the update
    const updatedDoc = await FirestoreService.getDocument<TestDocument>(
      `examples/${docId}`
    );
    expect(updatedDoc).toBeDefined();
    expect(updatedDoc?.value).toBe(43);
  });

  it("should fetch documents from Firestore", async () => {
    // Create multiple documents
    const testData1: TestDocument = { name: "Test Document 1", value: 1 };
    const testData2: TestDocument = { name: "Test Document 2", value: 2 };
    await FirestoreService.addDocument("examples", testData1);
    await FirestoreService.addDocument("examples", testData2);

    // Fetch all documents
    const docs = await FirestoreService.fetchCollection<TestDocument>(
      "examples"
    );
    expect(docs).toHaveLength(2);
  });

  it("should delete a document", async () => {
    // First create a document
    const testData: TestDocument = { name: "Test Document", value: 42 };
    const docId = await FirestoreService.addDocument("examples", testData);
    expect(docId).toBeDefined();

    // Then delete it
    await FirestoreService.deleteDocument(`examples/${docId}`);

    // Verify it's deleted
    const deletedDoc = await FirestoreService.getDocument<TestDocument>(
      `examples/${docId}`
    );
    expect(deletedDoc).toBeNull();
  });
});
