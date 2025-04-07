import { FirestoreService } from "../firestoreService";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

describe("Integration Tests", () => {
  const firebaseConfig = {
    apiKey: "test-api-key",
    authDomain: "test.firebaseapp.com",
    projectId: "test-project",
    storageBucket: "test.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:test",
    measurementId: "G-TEST",
  };

  let db: any;
  const testData = {
    name: "Test Document",
    value: 42,
    timestamp: new Date(),
  };

  beforeEach(() => {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    FirestoreService.initialize(db);
  });

  it("should perform complete CRUD operations", async () => {
    // Create
    const docRef = await FirestoreService.addDocument("test", testData);
    expect(docRef).toBeDefined();
    expect(docRef.id).toBeDefined();

    // Read
    const doc = await FirestoreService.getDocument("test", docRef.id);
    expect(doc).toBeDefined();
    expect(doc.data).toEqual(testData);

    // Update
    const updateData = { value: 43 };
    await FirestoreService.updateDocument("test", docRef.id, updateData);
    const updatedDoc = await FirestoreService.getDocument("test", docRef.id);
    expect(updatedDoc.data.value).toBe(43);

    // Delete
    await FirestoreService.deleteDocument("test", docRef.id);
    await expect(
      FirestoreService.getDocument("test", docRef.id)
    ).rejects.toThrow();
  });

  it("should handle complex operations with transactions", async () => {
    const doc1 = await FirestoreService.addDocument("test", testData);
    const doc2 = await FirestoreService.addDocument("test", testData);

    await FirestoreService.runTransaction(async (transaction) => {
      const doc1Data = await transaction.get("test", doc1.id);
      const doc2Data = await transaction.get("test", doc2.id);

      transaction.update("test", doc1.id, { value: doc1Data.data.value + 1 });
      transaction.update("test", doc2.id, { value: doc2Data.data.value - 1 });
    });

    const updatedDoc1 = await FirestoreService.getDocument("test", doc1.id);
    const updatedDoc2 = await FirestoreService.getDocument("test", doc2.id);
    expect(updatedDoc1.data.value).toBe(43);
    expect(updatedDoc2.data.value).toBe(41);
  });

  it("should handle batch operations with multiple collections", async () => {
    const batch = FirestoreService.startBatch();
    const doc1 = await FirestoreService.addDocument("collection1", testData);
    const doc2 = await FirestoreService.addDocument("collection2", testData);

    batch.update("collection1", doc1.id, { value: 1 });
    batch.update("collection2", doc2.id, { value: 2 });
    await batch.commit();

    const updatedDoc1 = await FirestoreService.getDocument(
      "collection1",
      doc1.id
    );
    const updatedDoc2 = await FirestoreService.getDocument(
      "collection2",
      doc2.id
    );
    expect(updatedDoc1.data.value).toBe(1);
    expect(updatedDoc2.data.value).toBe(2);
  });

  it("should handle real-time updates with complex queries", async () => {
    const updates: any[] = [];
    const unsubscribe = FirestoreService.onCollectionUpdate(
      "test",
      (docs) => {
        updates.push(docs);
      },
      {
        where: [{ field: "value", op: ">", value: 40 }],
        orderBy: [{ field: "value", direction: "desc" }],
        limit: 5,
      }
    );

    // Add documents
    await FirestoreService.addDocument("test", { ...testData, value: 41 });
    await FirestoreService.addDocument("test", { ...testData, value: 39 });
    await FirestoreService.addDocument("test", { ...testData, value: 42 });

    // Wait for updates
    await new Promise((resolve) => setTimeout(resolve, 100));

    unsubscribe();
    expect(updates.length).toBeGreaterThan(0);
    const lastUpdate = updates[updates.length - 1];
    expect(lastUpdate.every((doc: any) => doc.data.value > 40)).toBe(true);
    expect(lastUpdate[0].data.value).toBe(42);
  });

  it("should handle concurrent operations with error handling", async () => {
    const docRef = await FirestoreService.addDocument("test", testData);
    const operations = [];

    // Create multiple concurrent operations
    for (let i = 0; i < 5; i++) {
      operations.push(
        FirestoreService.updateDocument("test", docRef.id, { value: i }).catch(
          (error) => {
            expect(error.message).toContain("concurrent modification");
          }
        )
      );
    }

    await Promise.all(operations);
    const finalDoc = await FirestoreService.getDocument("test", docRef.id);
    expect(finalDoc.data.value).toBeDefined();
  });

  it("should handle complex data structures", async () => {
    const complexData = {
      name: "Complex Document",
      value: 42,
      nested: {
        array: [1, 2, 3],
        object: {
          field1: "value1",
          field2: "value2",
        },
      },
      timestamp: new Date(),
    };

    const docRef = await FirestoreService.addDocument("test", complexData);
    const doc = await FirestoreService.getDocument("test", docRef.id);
    expect(doc.data).toEqual(complexData);
  });

  it("should handle pagination with complex queries", async () => {
    // Create documents
    for (let i = 0; i < 20; i++) {
      await FirestoreService.addDocument("test", {
        ...testData,
        value: i,
        category: i % 3,
      });
    }

    // First page
    const firstPage = await FirestoreService.queryCollection("test", {
      where: [{ field: "category", op: "==", value: 1 }],
      orderBy: [{ field: "value", direction: "asc" }],
      limit: 5,
    });

    // Second page
    const lastDoc = firstPage[firstPage.length - 1];
    const secondPage = await FirestoreService.queryCollection("test", {
      where: [{ field: "category", op: "==", value: 1 }],
      orderBy: [{ field: "value", direction: "asc" }],
      startAfter: lastDoc.id,
      limit: 5,
    });

    expect(firstPage.length).toBe(5);
    expect(secondPage.length).toBe(2); // Only 2 more documents with category 1
  });
});
