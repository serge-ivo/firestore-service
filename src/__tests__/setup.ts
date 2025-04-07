import "@testing-library/jest-dom";
import { initializeApp, getApps, getApp, deleteApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from "firebase/firestore";
import { FirestoreService } from "../firestoreService";

// Global Firebase app instance
let app: any = null;
let firestore: Firestore; // Use Firestore type

// Export a service instance for tests to use
export let firestoreService: FirestoreService;

// Initialize Firebase and create the FirestoreService instance once
beforeAll(async () => {
  try {
    // Delete any existing apps to ensure clean state
    const apps = getApps();
    for (const existingApp of apps) {
      await deleteApp(existingApp);
    }

    // Initialize new app
    app = initializeApp({
      projectId: "test-project", // Use a consistent test project ID
      apiKey: "test-api-key",
      authDomain: "test-project.firebaseapp.com",
    });

    firestore = getFirestore(app);
    connectFirestoreEmulator(firestore, "localhost", 9098);

    // Create the service instance
    firestoreService = new FirestoreService(firestore);
    // Optionally connect the instance to the emulator if needed/supported
    // firestoreService.connectEmulator(9098);

    console.log("✅ Firebase and FirestoreService initialized for tests.");
  } catch (error) {
    console.error(
      "🚨 Failed to initialize Firebase/FirestoreService for tests:",
      error
    );
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    if (app) {
      await deleteApp(app);
      console.log("Firebase app deleted successfully.");
    }
  } catch (error) {
    console.error("🚨 Failed to cleanup Firebase:", error);
  }
});

// Reset Firestore state before each test using the instance
beforeEach(async () => {
  if (!firestoreService) {
    console.warn(
      "Skipping beforeEach cleanup: firestoreService not initialized."
    );
    return;
  }
  try {
    const collectionsToClean = ["test", "queryable-entities", "users"]; // Add all collections used in tests
    console.log(`🧹 Cleaning collections: ${collectionsToClean.join(", ")}`);
    for (const collectionPath of collectionsToClean) {
      // Use instance method to delete collection contents
      // Note: deleteCollection itself uses batching, so this is efficient.
      await firestoreService.deleteCollection(collectionPath);
    }
    console.log(`✅ Collections cleaned.`);
  } catch (error: any) {
    // Handle potential errors during cleanup (e.g., if a subcollection path was passed unexpectedly)
    if (error.message?.includes("odd number of segments")) {
      console.warn(
        `Cleanup skipped for path potentially used as subcollection root: ${error.message}`
      );
    } else {
      console.error("🚨 Failed to reset Firestore state:", error);
    }
  }
});

// Global error handler for unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("🚨 Unhandled promise rejection:", error);
});
