import { FirestoreService } from "../firestoreService";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { FirestoreModel } from "../firestoreModel"; // Import base model

// Define a minimal dummy model for query tests
// matching the structure of FirestoreModel
class DummyQueryModel extends FirestoreModel {
  name: string = "";
  value: number = 0;
  timestamp: Date = new Date();

  // Constructor matching FirestoreModel (takes optional id)
  constructor(data?: Partial<DummyQueryModel>, id?: string) {
    super(id); // Call base constructor with optional id
    if (data) {
      Object.assign(this, data);
    }
  }

  // --- Required abstract methods ---
  getColPath(): string {
    // All documents for these tests are in the 'test' collection
    return "test";
  }

  getDocPath(): string {
    if (!this.id) throw new Error("Cannot get doc path without an ID");
    return `${this.getColPath()}/${this.id}`;
  }
  // --- End Required abstract methods ---
}

describe("Query Operations", () => {
  const testData: Partial<DummyQueryModel>[] = [
    { name: "Document 1", value: 10, timestamp: new Date() },
    { name: "Document 2", value: 20, timestamp: new Date() },
    { name: "Document 3", value: 30, timestamp: new Date() },
  ];

  beforeEach(async () => {
    // Clean up existing test data before each test using deleteDocument
    const docs = await FirestoreService.fetchCollection<{ id: string }>("test");
    for (const doc of docs) {
      await FirestoreService.deleteDocument(`test/${doc.id}`);
    }

    // Add fresh test data using the Dummy model's path
    const colPath = DummyQueryModel.prototype.getColPath(); // Get path without instance
    for (const data of testData) {
      await FirestoreService.addDocument(colPath, data);
    }
  });

  it("should query documents with where clause", async () => {
    const query = {
      where: [{ field: "value", op: ">" as const, value: 15 }],
    };
    const colPath = DummyQueryModel.prototype.getColPath();
    const results = await FirestoreService.queryCollection(
      DummyQueryModel,
      colPath,
      query
    );
    expect(results.length).toBe(2);
    expect(results.every((doc) => doc.value > 15)).toBe(true);
  });

  it("should order documents", async () => {
    const query = {
      orderBy: [{ field: "value", direction: "desc" as const }],
    };
    const colPath = DummyQueryModel.prototype.getColPath();
    const results = await FirestoreService.queryCollection(
      DummyQueryModel,
      colPath,
      query
    );
    expect(results[0].value).toBe(30);
    expect(results[1].value).toBe(20);
    expect(results[2].value).toBe(10);
  });

  it("should limit results", async () => {
    const query = {
      limit: 2,
    };
    const colPath = DummyQueryModel.prototype.getColPath();
    const results = await FirestoreService.queryCollection(
      DummyQueryModel,
      colPath,
      query
    );
    expect(results.length).toBe(2);
  });

  it("should paginate results", async () => {
    const colPath = DummyQueryModel.prototype.getColPath();
    const firstPage = await FirestoreService.queryCollection(
      DummyQueryModel,
      colPath,
      {
        limit: 2,
        orderBy: [{ field: "value", direction: "asc" }],
      }
    );
    if (firstPage.length === 0) {
      throw new Error("Pagination test requires initial data to be present.");
    }
    const lastDoc = firstPage[firstPage.length - 1];
    const nextPage = await FirestoreService.queryCollection(
      DummyQueryModel,
      colPath,
      {
        startAfter: lastDoc.value,
        limit: 2,
        orderBy: [{ field: "value", direction: "asc" }],
      }
    );
    expect(nextPage.length).toBe(1);
    expect(nextPage[0].value).toBe(30);
  });

  it("should combine multiple query conditions", async () => {
    const query = {
      where: [{ field: "value", op: ">" as const, value: 15 }],
      orderBy: [{ field: "value", direction: "asc" as const }],
      limit: 1,
    };
    const colPath = DummyQueryModel.prototype.getColPath();
    const results = await FirestoreService.queryCollection(
      DummyQueryModel,
      colPath,
      query
    );
    expect(results.length).toBe(1);
    expect(results[0].value).toBe(20);
  });

  it("should handle empty results", async () => {
    const query = {
      where: [{ field: "value", op: ">" as const, value: 100 }],
    };
    const colPath = DummyQueryModel.prototype.getColPath();
    const results = await FirestoreService.queryCollection(
      DummyQueryModel,
      colPath,
      query
    );
    expect(results.length).toBe(0);
  });

  it("should handle complex queries with multiple where clauses", async () => {
    const query = {
      where: [
        { field: "value", op: ">" as const, value: 15 },
        { field: "name", op: "==" as const, value: "Document 2" },
      ],
    };
    const colPath = DummyQueryModel.prototype.getColPath();
    const results = await FirestoreService.queryCollection(
      DummyQueryModel,
      colPath,
      query
    );
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("Document 2");
  });
});
