import { FirestoreService } from "../firestoreService";

interface TestDocument {
  name: string;
  value: number;
  timestamp: Date;
}

describe("Document Operations", () => {
  const testData: TestDocument = {
    name: "Test Document",
    value: 42,
    timestamp: new Date(),
  };

  it("should create a new document", async () => {
    const docId = await FirestoreService.addDocument("test", testData);
    expect(docId).toBeDefined();
  });

  it("should retrieve a document by ID", async () => {
    const docId = await FirestoreService.addDocument("test", testData);
    const doc = await FirestoreService.getDocument<TestDocument>(
      `test/${docId}`
    );
    expect(doc).toBeDefined();
    expect(doc).toMatchObject({
      name: testData.name,
      value: testData.value,
    });
    expect(doc?.timestamp).toBeInstanceOf(Date);
  });

  it("should update an existing document", async () => {
    const docId = await FirestoreService.addDocument("test", testData);
    const updateData = { value: 43 };
    await FirestoreService.updateDocument(`test/${docId}`, updateData);
    const updatedDoc = await FirestoreService.getDocument<TestDocument>(
      `test/${docId}`
    );
    expect(updatedDoc?.value).toBe(43);
  });

  it("should delete a document", async () => {
    const docId = await FirestoreService.addDocument("test", testData);
    await FirestoreService.deleteDocument(`test/${docId}`);
    await expect(
      FirestoreService.getDocument<TestDocument>(`test/${docId}`)
    ).resolves.toBeNull();
  });

  it("should handle document not found errors", async () => {
    const doc = await FirestoreService.getDocument<TestDocument>(
      "test/non-existent-id"
    );
    expect(doc).toBeNull();
  });
});
