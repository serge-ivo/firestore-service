import { FirestoreService } from "../firestoreService";
import { initializeApp, deleteApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Add a simple model class for testing
class TestModel {
  constructor(public data: any, public id?: string) {}
}

describe("FirestoreService Initialization", () => {
  beforeEach(async () => {
    // Reset FirestoreService state
    (FirestoreService as any)["db"] = null;
    (FirestoreService as any)["isInitialized"] = false;
  });

  it("should throw error when using service before initialization", () => {
    expect(() => FirestoreService.addDocument("test", {})).rejects.toThrow(
      "FirestoreService has not been initialized. Call FirestoreService.initialize(db) first."
    );
  });

  it("should initialize successfully with valid Firestore instance", () => {
    const db = getFirestore();
    FirestoreService.initialize(db);
    expect((FirestoreService as any)["isInitialized"]).toBe(true);
    expect((FirestoreService as any)["db"]).toBe(db);
  });

  it("should throw error when initializing with null", () => {
    expect(() => FirestoreService.initialize(null as any)).toThrow(
      "Firestore instance is required for initialization"
    );
  });

  it("should throw error when initializing with invalid object", () => {
    expect(() => FirestoreService.initialize({} as any)).toThrow(
      "Firestore instance is required for initialization"
    );
  });

  it("should allow operations after successful initialization", async () => {
    const db = getFirestore();
    FirestoreService.initialize(db);

    // Test a simple operation
    await expect(FirestoreService.fetchCollection("test")).resolves.toEqual([]);
  });

  it("should handle double initialization gracefully", () => {
    const db = getFirestore();
    FirestoreService.initialize(db);
    expect(() => FirestoreService.initialize(db)).not.toThrow();
  });

  it("should maintain state after reinitialization", () => {
    const db = getFirestore();
    FirestoreService.initialize(db);
    const firstDb = (FirestoreService as any)["db"];

    FirestoreService.initialize(db);
    const secondDb = (FirestoreService as any)["db"];

    expect(firstDb).toBe(secondDb);
  });
});
