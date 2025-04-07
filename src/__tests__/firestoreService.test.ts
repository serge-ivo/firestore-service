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

  it("should set (create) a document using setDocument", async () => {
    const docId = "set-create-test";
    const docPath = `${testCollection}/${docId}`;
    const setData: TestDocument = {
      name: "Set Create",
      value: 100,
      timestamp: new Date(),
    };

    await firestoreService.setDocument(docPath, setData, { merge: false });

    const fetchedDoc = await firestoreService.getDocument<TestDocument>(
      docPath
    );
    expect(fetchedDoc).not.toBeNull();
    expect(fetchedDoc?.name).toBe(setData.name);
    expect(fetchedDoc?.value).toBe(setData.value);
  });

  it("should set (overwrite) an existing document using setDocument", async () => {
    // 1. Add initial document
    const initialData = {
      name: "Initial Set",
      value: 1,
      timestamp: new Date(),
    };
    const docId = await firestoreService.addDocument(
      testCollection,
      initialData
    );
    expect(docId).toBeDefined();
    const docPath = `${testCollection}/${docId}`;

    // 2. Overwrite with setDocument (default is merge: false)
    const overwriteData: TestDocument = {
      name: "Overwrite Set",
      value: 2,
      timestamp: new Date(), // Need all fields when not merging
    };
    await firestoreService.setDocument(docPath, overwriteData);

    // 3. Verify overwrite
    const fetchedDoc = await firestoreService.getDocument<TestDocument>(
      docPath
    );
    expect(fetchedDoc).not.toBeNull();
    expect(fetchedDoc?.name).toBe(overwriteData.name);
    expect(fetchedDoc?.value).toBe(overwriteData.value);
    // Timestamps might differ slightly, just check existence
    expect(fetchedDoc?.timestamp).toBeInstanceOf(Date);
  });

  it("should merge data into an existing document using setDocument with merge: true", async () => {
    // 1. Add initial document
    const initialData = {
      name: "Initial Merge",
      value: 10,
      timestamp: new Date(),
    };
    const docId = await firestoreService.addDocument(
      testCollection,
      initialData
    );
    expect(docId).toBeDefined();
    const docPath = `${testCollection}/${docId}`;

    // 2. Merge new data
    const mergeData = { value: 11, newField: "merged" }; // Only provide changed/new fields
    await firestoreService.setDocument(docPath, mergeData, { merge: true });

    // 3. Verify merge
    const fetchedDoc = await firestoreService.getDocument<
      TestDocument & { newField?: string }
    >(docPath);
    expect(fetchedDoc).not.toBeNull();
    expect(fetchedDoc?.name).toBe(initialData.name); // Original name should persist
    expect(fetchedDoc?.value).toBe(mergeData.value); // Value should be updated
    expect(fetchedDoc?.newField).toBe(mergeData.newField); // New field should exist
    expect(fetchedDoc?.timestamp).toBeInstanceOf(Date); // Original timestamp should persist
  });

  it("should throw validation error for invalid path in setDocument", async () => {
    const invalidPath = "test"; // Invalid: needs even segments
    await expect(firestoreService.setDocument(invalidPath, {})).rejects.toThrow(
      "Document path must have an even number of segments"
    );
  });

  it("should perform multiple operations using batch", async () => {
    const batch = firestoreService.getBatch();
    expect(batch).toBeDefined();
    expect(typeof batch.commit).toBe("function"); // Basic check for WriteBatch type

    // 1. Define operations
    const doc1Path = `${testCollection}/batch-set`;
    const doc1Data = { name: "Batch Set", value: 1 };

    const doc2Path = `${testCollection}/batch-update`;
    const doc2InitialData = { name: "Batch Update Initial", value: 2 };
    const doc2Id = await firestoreService.addDocument(
      testCollection,
      doc2InitialData
    );
    const doc2UpdateData = { value: 3, updated: true };

    const doc3Path = `${testCollection}/batch-delete`;
    const doc3InitialData = { name: "Batch Delete Me", value: 4 };
    const doc3Id = await firestoreService.addDocument(
      testCollection,
      doc3InitialData
    );

    // 2. Add operations to batch
    firestoreService.setInBatch(batch, doc1Path, doc1Data);
    firestoreService.updateInBatch(
      batch,
      `${testCollection}/${doc2Id}`,
      doc2UpdateData
    );
    firestoreService.deleteInBatch(batch, `${testCollection}/${doc3Id}`);

    // 3. Commit the batch
    await batch.commit();

    // 4. Verify results
    const fetchedDoc1 = await firestoreService.getDocument<TestDocument>(
      doc1Path
    );
    expect(fetchedDoc1).not.toBeNull();
    expect(fetchedDoc1?.name).toBe(doc1Data.name);

    const fetchedDoc2 = await firestoreService.getDocument<
      TestDocument & { updated?: boolean }
    >(`${testCollection}/${doc2Id}`);
    expect(fetchedDoc2).not.toBeNull();
    expect(fetchedDoc2?.name).toBe(doc2InitialData.name); // Name should persist
    expect(fetchedDoc2?.value).toBe(doc2UpdateData.value);
    expect(fetchedDoc2?.updated).toBe(true);

    const fetchedDoc3 = await firestoreService.getDocument<TestDocument>(
      `${testCollection}/${doc3Id}`
    );
    expect(fetchedDoc3).toBeNull();
  });

  it("should throw validation error for invalid path in updateInBatch", async () => {
    const batch = firestoreService.getBatch();
    const invalidPath = "test"; // Invalid: needs even segments
    expect(() =>
      firestoreService.updateInBatch(batch, invalidPath, {})
    ).toThrow("Document path must have an even number of segments");
  });

  it("should throw validation error for invalid path in setInBatch", async () => {
    const batch = firestoreService.getBatch();
    const invalidPath = "test/doc/sub"; // Invalid: needs even segments
    expect(() => firestoreService.setInBatch(batch, invalidPath, {})).toThrow(
      "Document path must have an even number of segments"
    );
  });

  it("should throw validation error for invalid path in deleteInBatch", async () => {
    const batch = firestoreService.getBatch();
    const invalidPath = "/"; // Invalid: basic validation
    expect(() => firestoreService.deleteInBatch(batch, invalidPath)).toThrow(
      "Path cannot start or end with '/'"
    );
  });
});

// Add a separate describe block for static methods
describe("FirestoreService Static Utilities", () => {
  it("should return FieldValue functions from getFieldValue", () => {
    const fieldValues = FirestoreService.getFieldValue();
    expect(fieldValues).toBeDefined();
    // Check for the presence and type of expected functions
    expect(typeof fieldValues.arrayUnion).toBe("function");
    expect(typeof fieldValues.arrayRemove).toBe("function");
    // We could try calling them, but checking type is usually sufficient
  });

  it("should return a Firestore Timestamp from getTimestamp", () => {
    const ts = FirestoreService.getTimestamp();
    expect(ts).toBeDefined();
    // Check if it behaves like a Timestamp (has seconds/nanoseconds properties)
    expect(ts).toHaveProperty("seconds");
    expect(ts).toHaveProperty("nanoseconds");
    expect(typeof ts.seconds).toBe("number");
    expect(typeof ts.nanoseconds).toBe("number");
    // Basic check that the timestamp is recent (within the last minute, for example)
    const nowSeconds = Date.now() / 1000;
    expect(ts.seconds).toBeGreaterThan(nowSeconds - 60);
    expect(ts.seconds).toBeLessThanOrEqual(nowSeconds + 5); // Allow slight clock skew
  });

  it("should return a sentinel FieldValue from deleteField", () => {
    const deleteFieldValue = FirestoreService.deleteField();
    expect(deleteFieldValue).toBeDefined();
    // Firestore's deleteField() returns a specific sentinel object.
    // Checking its internal properties might be brittle, but we can check
    // that it's not undefined/null and maybe its string representation if stable.
    // A basic existence check is often good enough.
    expect(deleteFieldValue).not.toBeNull();
    // console.log(deleteFieldValue); // Log to see structure if needed
  });
});
