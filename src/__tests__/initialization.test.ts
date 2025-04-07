import { firestoreService } from "./setup"; // Import the instance

describe("FirestoreService Instance Initialization", () => {
  it("should have a defined firestoreService instance from global setup", () => {
    // Check if the instance imported from setup is defined
    expect(firestoreService).toBeDefined();
    expect(firestoreService).not.toBeNull();
  });

  it("should allow operations using the initialized instance", async () => {
    // Test a simple operation to ensure the instance is functional
    // This implicitly tests that the global initialization worked.
    // We expect an empty array as the collection should be cleaned or non-existent.
    await expect(
      firestoreService.fetchCollection("test-init")
    ).resolves.toEqual([]);
  });

  // No need for other tests as initialization is handled globally
});
