/**
 * ExampleEntity.test.ts
 *
 * Demonstrates creating, updating, fetching, and deleting a Firestore document
 * via ExampleEntity and FirestoreService, connected to the Firestore emulator.
 */

import { firestoreService } from "./setup"; // Import the instance
import { ExampleEntity, ExampleData } from "../examples/ExampleEntity";

describe("🔥 FirestoreService - ExampleEntity Interaction Tests", () => {
  const testCollectionPath = "examples";
  const testData: ExampleData = {
    title: "Example Test Title",
    description: "A description for the test",
    createdAt: new Date(), // Timestamps will be handled by Firestore
    updatedAt: new Date(), // Timestamps will be handled by Firestore
    owner: "test-owner",
  };

  beforeEach(async () => {
    const docs = await firestoreService.fetchCollection<
      { id: string } & ExampleData
    >(testCollectionPath);
    for (const doc of docs) {
      await firestoreService.deleteDocument(`${testCollectionPath}/${doc.id}`);
    }
  });

  it("should create a document using firestoreService", async () => {
    const docId = await firestoreService.addDocument(
      testCollectionPath,
      testData
    );
    expect(docId).toBeDefined();

    // Verify the document was created correctly
    const fetchedDoc = await firestoreService.getDocument<ExampleData>(
      `${testCollectionPath}/${docId}`
    );
    expect(fetchedDoc).not.toBeNull();
    expect(fetchedDoc?.title).toBe(testData.title);
    expect(fetchedDoc?.owner).toBe(testData.owner);
  });

  it("should update an existing document using firestoreService", async () => {
    // 1. Create document
    const docId = await firestoreService.addDocument(
      testCollectionPath,
      testData
    );
    expect(docId).toBeDefined();

    // 2. Update using the service
    const updatedTitle = "Updated Via Service";
    await firestoreService.updateDocument(
      `${testCollectionPath}/${docId}`,
      { title: updatedTitle } // Pass only the changed data
    );

    // 3. Verify update
    const fetchedDoc = await firestoreService.getDocument<ExampleData>(
      `${testCollectionPath}/${docId}`
    );
    expect(fetchedDoc).not.toBeNull();
    expect(fetchedDoc!.title).toBe(updatedTitle);
    expect(fetchedDoc!.description).toBe(testData.description); // Check other fields remain
  });

  it("should fetch an entity by ID using firestoreService", async () => {
    // 1. Create document
    const docId = await firestoreService.addDocument(
      testCollectionPath,
      testData
    );
    expect(docId).toBeDefined();

    // 2. Fetch using firestoreService
    const fetchedDoc = await firestoreService.getDocument<
      ExampleData & { id: string }
    >(`${testCollectionPath}/${docId}`);
    expect(fetchedDoc).not.toBeNull();
    expect(fetchedDoc!.id).toBe(docId);
    expect(fetchedDoc!.title).toBe(testData.title);
    expect(fetchedDoc!.description).toBe(testData.description);
    expect(fetchedDoc?.createdAt).toBeInstanceOf(Date); // Verify timestamp conversion
  });

  it("should delete a document using firestoreService", async () => {
    // 1. Create document
    const docId = await firestoreService.addDocument(
      testCollectionPath,
      testData
    );
    expect(docId).toBeDefined();

    // 2. Delete using the service
    await firestoreService.deleteDocument(`${testCollectionPath}/${docId}`);

    // 3. Verify deletion
    const fetchedDoc = await firestoreService.getDocument<ExampleData>(
      `${testCollectionPath}/${docId}`
    );
    expect(fetchedDoc).toBeNull();
  });

  it("should instantiate correctly without an ID", () => {
    const dataWithoutId: ExampleData = {
      title: "Pre-Save Title",
      description: "Desc before saving",
      owner: "temp-owner",
      createdAt: new Date(), // These might be set client-side or server-side
      updatedAt: new Date(),
    };

    // Instantiate using only the data (no id)
    const entity = new ExampleEntity(dataWithoutId);

    // Verify properties are set
    expect(entity.title).toBe(dataWithoutId.title);
    expect(entity.owner).toBe(dataWithoutId.owner);

    // Verify ID is undefined as expected
    expect(entity.id).toBeUndefined();

    // Verify path methods that require ID throw an error
    expect(() => entity.getDocPath()).toThrow(
      "Cannot get doc path without ID."
    );
    // getColPath should still work as it doesn't depend on the instance ID
    expect(() => entity.getColPath()).not.toThrow();
    expect(entity.getColPath()).toBe(testCollectionPath);
  });
});
