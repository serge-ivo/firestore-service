import { FirestoreService } from "../firestoreService";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

describe("Query Operations", () => {
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
  const testData = [
    { name: "Document 1", value: 10, timestamp: new Date() },
    { name: "Document 2", value: 20, timestamp: new Date() },
    { name: "Document 3", value: 30, timestamp: new Date() },
  ];

  beforeEach(async () => {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    FirestoreService.initialize(db);
    // Add test data
    for (const data of testData) {
      await FirestoreService.addDocument("test", data);
    }
  });

  it("should query documents with where clause", async () => {
    const query = {
      where: [{ field: "value", op: ">", value: 15 }],
    };
    const results = await FirestoreService.queryCollection("test", query);
    expect(results.length).toBe(2);
    expect(results.every((doc) => doc.data.value > 15)).toBe(true);
  });

  it("should order documents", async () => {
    const query = {
      orderBy: [{ field: "value", direction: "desc" }],
    };
    const results = await FirestoreService.queryCollection("test", query);
    expect(results[0].data.value).toBe(30);
    expect(results[1].data.value).toBe(20);
    expect(results[2].data.value).toBe(10);
  });

  it("should limit results", async () => {
    const query = {
      limit: 2,
    };
    const results = await FirestoreService.queryCollection("test", query);
    expect(results.length).toBe(2);
  });

  it("should paginate results", async () => {
    const firstPage = await FirestoreService.queryCollection("test", {
      limit: 2,
    });
    const lastDoc = firstPage[firstPage.length - 1];
    const nextPage = await FirestoreService.queryCollection("test", {
      startAfter: lastDoc.id,
      limit: 2,
    });
    expect(nextPage.length).toBe(1);
  });

  it("should combine multiple query conditions", async () => {
    const query = {
      where: [{ field: "value", op: ">", value: 15 }],
      orderBy: [{ field: "value", direction: "asc" }],
      limit: 1,
    };
    const results = await FirestoreService.queryCollection("test", query);
    expect(results.length).toBe(1);
    expect(results[0].data.value).toBe(20);
  });

  it("should handle empty results", async () => {
    const query = {
      where: [{ field: "value", op: ">", value: 100 }],
    };
    const results = await FirestoreService.queryCollection("test", query);
    expect(results.length).toBe(0);
  });

  it("should handle complex queries with multiple where clauses", async () => {
    const query = {
      where: [
        { field: "value", op: ">", value: 15 },
        { field: "name", op: "==", value: "Document 2" },
      ],
    };
    const results = await FirestoreService.queryCollection("test", query);
    expect(results.length).toBe(1);
    expect(results[0].data.name).toBe("Document 2");
  });
});
