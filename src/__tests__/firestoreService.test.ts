// tests/FirestoreServiceFull.test.ts

import { getApp } from "firebase/app";
import { getFirestore, deleteDoc, doc } from "firebase/firestore";
import { FirestoreService } from "../firestoreService";
import { firestoreService } from "./setup"; // Import the instance

jest.setTimeout(20000);

interface TestDocument {
  id?: string;
  name: string;
  value: number;
  timestamp: Date;
}

const testCollection = "test-collection";
const testDocId = "test-doc";

describe("🔥 FirestoreService Instance Tests", () => {
  const testData: TestDocument = {
    name: "Test Document",
    value: 42,
    timestamp: new Date(),
  };

  beforeEach(async () => {
    console.log("🔥 Starting Firestore tests against emulator..."); // Keep log if useful
    // Use instance method for fetchCollection
    const docs = await firestoreService.fetchCollection<TestDocument>("test");
    for (const doc of docs) {
      // Use instance method for deleteDocument
      await firestoreService.deleteDocument(`test/${doc.id}`);
    }
  });

  it("should add a document to Firestore", async () => {
    // Use instance method
    const docId = await firestoreService.addDocument("test", testData);
    expect(docId).toBeDefined();
    expect(typeof docId).toBe("string");
  });

  it("should update a document in Firestore", async () => {
    // Use instance method
    const docId = await firestoreService.addDocument("test", testData);
    expect(docId).toBeDefined();

    const updateData = { value: 43 };
    // Use instance method
    await firestoreService.updateDocument(`test/${docId}`, updateData);

    // Use instance method
    const updatedDoc = await firestoreService.getDocument<TestDocument>(
      `test/${docId}`
    );
    expect(updatedDoc?.value).toBe(43);
    expect(updatedDoc?.name).toBe(testData.name);
  });

  it("should fetch documents from Firestore", async () => {
    const testData1: TestDocument = { ...testData, value: 1 };
    const testData2: TestDocument = { ...testData, value: 2 };
    // Use instance methods
    await firestoreService.addDocument("test", testData1);
    await firestoreService.addDocument("test", testData2);

    // Use instance method
    const docs = await firestoreService.fetchCollection<TestDocument>("test");
    expect(docs).toHaveLength(2);

    const sortedDocs = [...docs].sort((a, b) => a.value - b.value);
    expect(sortedDocs[0].value).toBe(1);
    expect(sortedDocs[1].value).toBe(2);
  });

  it("should delete a document", async () => {
    // Use instance method
    const docId = await firestoreService.addDocument("test", testData);
    expect(docId).toBeDefined();

    // Use instance method
    await firestoreService.deleteDocument(`test/${docId}`);

    // Use instance method
    const deletedDoc = await firestoreService.getDocument<TestDocument>(
      `test/${docId}`
    );
    expect(deletedDoc).toBeNull();
  });

  it("should handle document timestamps correctly", async () => {
    // Use instance method
    const docId = await firestoreService.addDocument("test", testData);
    // Use instance method
    const doc = await firestoreService.getDocument<TestDocument>(
      `test/${docId}`
    );
    expect(doc?.timestamp).toBeInstanceOf(Date);
    expect(doc?.timestamp.getTime()).toBeCloseTo(
      testData.timestamp.getTime(),
      -2
    );
  });

  it("should handle partial updates correctly", async () => {
    // Use instance method
    const docId = await firestoreService.addDocument("test", testData);

    // Use instance method
    await firestoreService.updateDocument(`test/${docId}`, { value: 43 });

    // Use instance method
    const updatedDoc = await firestoreService.getDocument<TestDocument>(
      `test/${docId}`
    );
    expect(updatedDoc?.value).toBe(43);
    expect(updatedDoc?.name).toBe(testData.name);
    expect(updatedDoc?.timestamp).toBeInstanceOf(Date);
  });
});
