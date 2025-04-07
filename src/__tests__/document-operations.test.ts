import { firestoreService } from "./setup"; // Import the instance

interface TestDocument {
  name: string;
  value: number;
  timestamp: Date;
}

describe("🔥 FirestoreService - Document Operations", () => {
  const testCollectionPath = "test";
  const testData: TestDocument = {
    name: "Test Document",
    value: 42,
    timestamp: new Date(),
  };

  // Clean up collection before each test
  beforeEach(async () => {
    // Fetch documents including their IDs
    const docs = await firestoreService.fetchCollection<
      { id: string } & TestDocument
    >(testCollectionPath);
    for (const doc of docs) {
      // doc.id is now accessible
      await firestoreService.deleteDocument(`${testCollectionPath}/${doc.id}`);
    }
  });

  it("should create a new document", async () => {
    const docId = await firestoreService.addDocument(
      testCollectionPath,
      testData
    );
    expect(docId).toBeDefined();

    // Verify creation
    const doc = await firestoreService.getDocument<TestDocument>(
      `${testCollectionPath}/${docId}`
    );
    expect(doc).not.toBeNull();
  });

  it("should retrieve a document by ID", async () => {
    const docId = await firestoreService.addDocument(
      testCollectionPath,
      testData
    );
    const doc = await firestoreService.getDocument<TestDocument>(
      `${testCollectionPath}/${docId}`
    );
    expect(doc).toBeDefined();
    expect(doc).toMatchObject({
      name: testData.name,
      value: testData.value,
    });
    expect(doc?.timestamp).toBeInstanceOf(Date);
  });

  it("should update an existing document", async () => {
    const docId = await firestoreService.addDocument(
      testCollectionPath,
      testData
    );
    const updateData = { value: 43 };
    await firestoreService.updateDocument(
      `${testCollectionPath}/${docId}`,
      updateData
    );
    const updatedDoc = await firestoreService.getDocument<TestDocument>(
      `${testCollectionPath}/${docId}`
    );
    expect(updatedDoc?.value).toBe(43);
    expect(updatedDoc?.name).toBe(testData.name); // Verify other fields remain
  });

  it("should delete a document", async () => {
    const docId = await firestoreService.addDocument(
      testCollectionPath,
      testData
    );
    // Verify it exists first
    let doc = await firestoreService.getDocument<TestDocument>(
      `${testCollectionPath}/${docId}`
    );
    expect(doc).not.toBeNull();

    await firestoreService.deleteDocument(`${testCollectionPath}/${docId}`);

    // Verify it's deleted
    doc = await firestoreService.getDocument<TestDocument>(
      `${testCollectionPath}/${docId}`
    );
    expect(doc).toBeNull();
  });

  it("should handle document not found errors gracefully on get", async () => {
    const doc = await firestoreService.getDocument<TestDocument>(
      `${testCollectionPath}/non-existent-id`
    );
    expect(doc).toBeNull();
  });

  it("should handle document not found errors gracefully on update", async () => {
    // Attempt to update a non-existent document
    await expect(
      firestoreService.updateDocument(`${testCollectionPath}/non-existent-id`, {
        value: 99,
      })
    ).rejects.toThrow(); // Firestore typically throws an error
  });

  it("should handle document not found errors gracefully on delete", async () => {
    // Attempt to delete a non-existent document - should not throw
    await expect(
      firestoreService.deleteDocument(`${testCollectionPath}/non-existent-id`)
    ).resolves.not.toThrow();
  });
});
