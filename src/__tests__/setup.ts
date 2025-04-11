import "@testing-library/jest-dom";
import { initializeApp, getApps, getApp, deleteApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from "firebase/firestore";
import { FirestoreService } from "../firestoreService";

// Global Firebase app instance
let app: any = null; // This might become unnecessary if FirestoreService manages the app internally
let firestore: Firestore; // Still needed for raw emulator connection if service doesn't expose it

// Export a service instance for tests to use
export let firestoreService: FirestoreService;

// Define the config used for tests
const testFirebaseConfig = {
  projectId: "test-project", // Use a consistent test project ID
  apiKey: "test-api-key", // Use fake credentials for emulator
  authDomain: "test-project.firebaseapp.com",
};

// Initialize Firebase and create the FirestoreService instance once
beforeAll(async () => {
  try {
    // Cleanup any previous apps (good practice)
    const apps = getApps();
    if (apps.length > 0) {
      await Promise.all(apps.map(deleteApp));
      console.log("Cleaned up previous Firebase apps.");
    }

    // Create the service instance using the config
    // FirestoreService constructor now handles initializeApp and getFirestore
    firestoreService = new FirestoreService(testFirebaseConfig);

    // Connect the service instance to the emulator
    firestoreService.connectEmulator(9098); // Use the instance method

    console.log(
      "✅ FirestoreService initialized and connected to emulator for tests."
    );
  } catch (error) {
    console.error("🚨 Failed to initialize FirestoreService for tests:", error);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    // No need to explicitly delete the app if FirestoreService handles it,
    // but keep it if direct app management is needed elsewhere.
    // If FirestoreService doesn't expose a way to disconnect/cleanup, this might be needed.
    const appInstance = getApps().length > 0 ? getApp() : null;
    if (appInstance) {
      await deleteApp(appInstance);
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
