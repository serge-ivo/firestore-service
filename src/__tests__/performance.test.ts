import { FirestoreService } from "../firestoreService";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

describe("Performance Tests", () => {
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

  it("should handle large batch operations efficiently", async () => {
    const batchSize = 500;
    const batch = FirestoreService.startBatch();
    const startTime = performance.now();

    for (let i = 0; i < batchSize; i++) {
      const doc = await FirestoreService.addDocument("test", {
        ...testData,
        value: i,
      });
      batch.update("test", doc.id, { value: i * 2 });
    }

    await batch.commit();
    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
  });

  it("should handle concurrent operations efficiently", async () => {
    const numOperations = 100;
    const startTime = performance.now();

    const operations = Array.from({ length: numOperations }, (_, i) =>
      FirestoreService.addDocument("test", {
        ...testData,
        value: i,
      })
    );

    await Promise.all(operations);
    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  it("should handle large document queries efficiently", async () => {
    const numDocuments = 1000;
    const startTime = performance.now();

    // Create documents
    for (let i = 0; i < numDocuments; i++) {
      await FirestoreService.addDocument("test", {
        ...testData,
        value: i,
      });
    }

    // Query all documents
    const results = await FirestoreService.queryCollection("test", {
      orderBy: [{ field: "value", direction: "asc" }],
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(results.length).toBe(numDocuments);
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
  });

  it("should handle real-time updates efficiently", async () => {
    const numUpdates = 100;
    const docRef = await FirestoreService.addDocument("test", testData);
    const updates: any[] = [];
    let updateCount = 0;

    const unsubscribe = FirestoreService.onDocumentUpdate(
      "test",
      docRef.id,
      (doc) => {
        updates.push(doc);
        updateCount++;
      }
    );

    const startTime = performance.now();

    // Perform rapid updates
    for (let i = 0; i < numUpdates; i++) {
      await FirestoreService.updateDocument("test", docRef.id, { value: i });
    }

    // Wait for all updates to be processed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const endTime = performance.now();
    const duration = endTime - startTime;

    unsubscribe();
    expect(updateCount).toBe(numUpdates);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  it("should handle large transactions efficiently", async () => {
    const numOperations = 50;
    const startTime = performance.now();

    const operations = Array.from({ length: numOperations }, async (_, i) => {
      const docRef = await FirestoreService.addDocument("test", testData);
      await FirestoreService.runTransaction(async (transaction) => {
        const doc = await transaction.get("test", docRef.id);
        transaction.update("test", docRef.id, { value: i });
      });
    });

    await Promise.all(operations);
    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
  });

  it("should handle complex queries efficiently", async () => {
    const numDocuments = 1000;
    const startTime = performance.now();

    // Create documents with varying values
    for (let i = 0; i < numDocuments; i++) {
      await FirestoreService.addDocument("test", {
        ...testData,
        value: i,
        category: i % 5,
      });
    }

    // Perform complex query
    const results = await FirestoreService.queryCollection("test", {
      where: [
        { field: "value", op: ">", value: 500 },
        { field: "category", op: "==", value: 2 },
      ],
      orderBy: [{ field: "value", direction: "desc" }],
      limit: 10,
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(results.length).toBeLessThanOrEqual(10);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });
});
