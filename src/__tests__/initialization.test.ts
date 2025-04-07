import { FirestoreService } from "../firestoreService";
import { initializeApp, deleteApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Add a simple model class for testing
class TestModel {
  constructor(public data: any, public id?: string) {}
}

describe("FirestoreService Initialization", () => {
  const firebaseConfig = {
    apiKey: "test-api-key",
    authDomain: "test.firebaseapp.com",
    projectId: "test-project",
    storageBucket: "test.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:test",
    measurementId: "G-TEST",
  };

  let app: any;

  beforeEach(async () => {
    // Clean up any existing apps
    const apps = getApps();
    for (const app of apps) {
      await deleteApp(app);
    }

    // Reset FirestoreService state
    (FirestoreService as any)["db"] = null;
    (FirestoreService as any)["isInitialized"] = false;
  });

  afterEach(async () => {
    if (app) {
      await deleteApp(app);
    }
  });

  it("should throw error when using service before initialization", () => {
    expect(() => FirestoreService.addDocument("test", {})).toThrow(
      "FirestoreService must be initialized before use"
    );
  });

  it("should initialize successfully with valid Firestore instance", () => {
    app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    FirestoreService.initialize(db);
    expect((FirestoreService as any)["isInitialized"]).toBe(true);
    expect((FirestoreService as any)["db"]).toBe(db);
  });

  it("should handle invalid Firestore instance", () => {
    expect(() => FirestoreService.initialize(null as any)).toThrow(
      "Invalid Firestore instance provided"
    );
  });

  it("should throw error when initializing with non-Firestore object", () => {
    expect(() => FirestoreService.initialize({} as any)).toThrow(
      "Firestore instance is required for initialization"
    );
  });

  it("should allow operations after successful initialization", async () => {
    app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    FirestoreService.initialize(db);

    // Mock the Firestore methods to avoid actual database operations
    const mockAddDoc = jest.fn();
    const mockCollection = jest.fn().mockReturnValue({ add: mockAddDoc });
    jest.spyOn(db as any, "collection").mockImplementation(mockCollection);

    await expect(
      FirestoreService.addDocument("test", {})
    ).resolves.not.toThrow();
    expect(mockAddDoc).toHaveBeenCalled();
  });

  it("should provide descriptive error when collection path is invalid", async () => {
    app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    FirestoreService.initialize(db);

    await expect(FirestoreService.addDocument("", {})).rejects.toThrow(
      "Invalid collection path. Path must be a non-empty string."
    );
  });

  it("should handle double initialization gracefully", () => {
    app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    FirestoreService.initialize(db);
    expect(() => FirestoreService.initialize(db)).not.toThrow();
  });

  it("should maintain state after reinitialization", () => {
    app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    FirestoreService.initialize(db);
    const firstDb = (FirestoreService as any)["db"];

    FirestoreService.initialize(db);
    const secondDb = (FirestoreService as any)["db"];

    expect(firstDb).toBe(secondDb);
  });
});
