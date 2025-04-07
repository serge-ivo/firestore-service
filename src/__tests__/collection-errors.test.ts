import { FirestoreService } from "../firestoreService";

// Add a simple model class for testing
class TestModel {
  constructor(public data: any, public id?: string) {}
}

describe("Collection Error Handling", () => {
  it("should handle invalid collection paths", async () => {
    const invalidPaths = [
      "test/doc/subcollection", // too many segments
      "", // empty path
      "test/", // trailing slash
      "/test", // leading slash
    ];

    for (const path of invalidPaths) {
      await expect(FirestoreService.addDocument(path, {})).rejects.toThrow();
    }
  });

  it("should handle invalid document data", async () => {
    const invalidData = {
      function: () => {}, // Functions are not valid Firestore data
      undefined: undefined, // Undefined is not valid in Firestore
      symbol: Symbol("test"), // Symbols are not valid in Firestore
    };

    await expect(
      FirestoreService.addDocument("test", invalidData)
    ).rejects.toThrow();
  });

  it("should handle non-existent collection queries", async () => {
    const result = await FirestoreService.fetchCollection("non-existent");
    expect(result).toEqual([]);
  });

  it("should handle invalid query constraints", async () => {
    const invalidQuery = {
      where: [{ field: "name", op: "invalid-op" as any, value: "test" }],
    };

    await expect(
      FirestoreService.queryCollection(TestModel, "test", invalidQuery)
    ).rejects.toThrow();
  });

  it("should handle invalid document references", async () => {
    // Invalid document path (collection path instead of document path)
    await expect(FirestoreService.getDocument("test")).rejects.toThrow();

    // Invalid document path format
    await expect(
      FirestoreService.getDocument("test/doc/subcollection/doc2")
    ).rejects.toThrow();
  });
});
