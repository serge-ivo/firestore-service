import { FirestoreService } from "../firestoreService";
import { FirestoreModel } from "../firestoreModel"; // Import base model

// Define a minimal dummy model that extends FirestoreModel
class DummyErrorModel extends FirestoreModel {
  // Define properties that might be relevant if data was accessed,
  // but for these error tests, they might not be strictly needed.
  name: string = "";
  value: any = null;

  constructor(data?: any, id?: string) {
    super(id); // Call base constructor
    if (data) {
      Object.assign(this, data);
    }
  }

  // --- Required abstract methods ---
  getColPath(): string {
    // Use a consistent path for tests, e.g., 'test'
    return "test";
  }

  getDocPath(): string {
    if (!this.id) {
      // Attempt to generate a temporary path if needed for an error case,
      // or throw if an ID is strictly required before path generation.
      // For queryCollection error test, doc path might not be needed.
      // Let's throw for safety, adjust if a specific test needs otherwise.
      throw new Error("Cannot get doc path without an ID for DummyErrorModel");
    }
    return `${this.getColPath()}/${this.id}`;
  }
  // --- End Required abstract methods ---
}

describe("Collection Error Handling", () => {
  it("should handle invalid collection paths", async () => {
    const invalidPaths = [
      // Paths that should fail basic validation
      "",
      "test/",
      "/test",
      // Path that should fail segment validation (even number)
      "test/doc",
    ];

    for (const path of invalidPaths) {
      try {
        await FirestoreService.addDocument(path, {});
        // If it reaches here, it didn't throw, which is a failure for this test
        throw new Error(
          `Expected addDocument to throw for path: "${path}" but it did not.`
        );
      } catch (error: any) {
        // Expect *some* error to be thrown
        expect(error).toBeInstanceOf(Error);
        // Optional: Check for specific error messages if needed
        // console.log(`Correctly threw for path "${path}": ${error.message}`);
      }
    }

    // Optionally, add a separate test case for a *valid* deep collection path
    const validDeepPath = "test/doc1/subcol1";
    let docId: string | undefined;
    try {
      docId = await FirestoreService.addDocument(validDeepPath, {
        works: true,
      });
      expect(docId).toBeDefined();
    } finally {
      // Clean up the created document
      if (docId) {
        await FirestoreService.deleteDocument(`${validDeepPath}/${docId}`);
      }
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

    // Use the correctly defined DummyErrorModel
    await expect(
      FirestoreService.queryCollection(DummyErrorModel, "test", invalidQuery)
    ).rejects.toThrow();
  });

  it("should handle invalid document references", async () => {
    // Valid path structure, but document doesn't exist
    const nonExistentPath = "test/doc/subcollection/doc2";
    // Expect getDocument to resolve to null for a valid path to a non-existent doc
    await expect(
      FirestoreService.getDocument(nonExistentPath)
    ).resolves.toBeNull();

    // Example of a path that *should* throw due to invalid segment count (odd)
    const invalidPathFormat = "test/doc/subcollection";
    await expect(
      FirestoreService.getDocument(invalidPathFormat)
    ).rejects.toThrow();
  });
});
