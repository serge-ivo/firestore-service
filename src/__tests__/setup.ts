import "@testing-library/jest-dom";
import { initializeApp, getApps, getApp, deleteApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { FirestoreService } from "../firestoreService";

// Global Firebase app instance
let app: any = null;
let firestore: any = null;

// Initialize Firestore service for tests
beforeAll(async () => {
  try {
    // Delete any existing apps to ensure clean state
    const apps = getApps();
    for (const existingApp of apps) {
      await deleteApp(existingApp);
    }

    // Initialize new app
    app = initializeApp({
      projectId: "test-project",
      apiKey: "test-api-key",
      authDomain: "test-project.firebaseapp.com",
    });

    firestore = getFirestore(app);
    connectFirestoreEmulator(firestore, "localhost", 9098);
    FirestoreService.initialize(firestore);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    if (app) {
      await deleteApp(app);
    }
  } catch (error) {
    console.error("Failed to cleanup Firebase:", error);
  }
});

// Reset Firestore state before each test
beforeEach(async () => {
  try {
    // Clean up any existing data
    const collections = ["test"];
    for (const collection of collections) {
      const snapshot = await FirestoreService.fetchCollection<{ id: string }>(
        collection
      );
      for (const doc of snapshot) {
        await FirestoreService.deleteDocument(`${collection}/${doc.id}`);
      }
    }
  } catch (error) {
    console.error("Failed to reset Firestore state:", error);
  }
});

// Global error handler for unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});
