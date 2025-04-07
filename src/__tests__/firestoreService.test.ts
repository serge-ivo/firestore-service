// tests/FirestoreServiceFull.test.ts

import { getApp } from "firebase/app";
import { getFirestore, deleteDoc, doc } from "firebase/firestore";
import { FirestoreService } from "../firestoreService";

jest.setTimeout(20000);

interface TestDocument {
  id?: string;
  name: string;
  value: number;
  timestamp: Date;
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
    const docs = await FirestoreService.fetchCollection<TestDocument>("test");
    for (const doc of docs) {
      await FirestoreService.deleteDocument(`test/${doc.id}`);
    }
  });

  it("should add a document to Firestore", async () => {
    const testData: TestDocument = {
      name: "Test Document",
      value: 42,
      timestamp: new Date(),
    };
    const docId = await FirestoreService.addDocument("test", testData);
    expect(docId).toBeDefined();
    expect(typeof docId).toBe("string");
  });

  it("should update a document in Firestore", async () => {
    // First create a document
    const testData: TestDocument = {
      name: "Test Document",
      value: 42,
      timestamp: new Date(),
    };
    const docId = await FirestoreService.addDocument("test", testData);
    expect(docId).toBeDefined();

    // Then update it
    const updateData = { value: 43 };
    await FirestoreService.updateDocument(`test/${docId}`, updateData);

    // Verify the update
    const updatedDoc = await FirestoreService.getDocument<TestDocument>(
      `test/${docId}`
    );
    expect(updatedDoc?.value).toBe(43);
    expect(updatedDoc?.name).toBe(testData.name);
  });

  it("should fetch documents from Firestore", async () => {
    // Create multiple documents
    const testData: TestDocument = {
      name: "Test Document",
      value: 42,
      timestamp: new Date(),
    };
    const testData1: TestDocument = { ...testData, value: 1 };
    const testData2: TestDocument = { ...testData, value: 2 };
    await FirestoreService.addDocument("test", testData1);
    await FirestoreService.addDocument("test", testData2);

    // Fetch all documents
    const docs = await FirestoreService.fetchCollection<TestDocument>("test");
    expect(docs).toHaveLength(2);

    // Sort by value to ensure consistent order
    const sortedDocs = [...docs].sort((a, b) => a.value - b.value);
    expect(sortedDocs[0].value).toBe(1);
    expect(sortedDocs[1].value).toBe(2);
  });

  it("should delete a document", async () => {
    // First create a document
    const testData: TestDocument = {
      name: "Test Document",
      value: 42,
      timestamp: new Date(),
    };
    const docId = await FirestoreService.addDocument("test", testData);
    expect(docId).toBeDefined();

    // Then delete it
    await FirestoreService.deleteDocument(`test/${docId}`);

    // Verify it's deleted
    const deletedDoc = await FirestoreService.getDocument<TestDocument>(
      `test/${docId}`
    );
    expect(deletedDoc).toBeNull();
  });

  it("should handle document timestamps correctly", async () => {
    const testData: TestDocument = {
      name: "Test Document",
      value: 42,
      timestamp: new Date(),
    };
    const docId = await FirestoreService.addDocument("test", testData);
    const doc = await FirestoreService.getDocument<TestDocument>(
      `test/${docId}`
    );
    expect(doc?.timestamp).toBeInstanceOf(Date);
    expect(doc?.timestamp.getTime()).toBeCloseTo(
      testData.timestamp.getTime(),
      -2
    ); // Allow 1ms difference
  });

  it("should handle partial updates correctly", async () => {
    const testData: TestDocument = {
      name: "Test Document",
      value: 42,
      timestamp: new Date(),
    };
    const docId = await FirestoreService.addDocument("test", testData);

    // Update only the value field
    await FirestoreService.updateDocument(`test/${docId}`, { value: 43 });

    const updatedDoc = await FirestoreService.getDocument<TestDocument>(
      `test/${docId}`
    );
    expect(updatedDoc?.value).toBe(43);
    expect(updatedDoc?.name).toBe(testData.name);
    expect(updatedDoc?.timestamp).toBeInstanceOf(Date);
  });
});
