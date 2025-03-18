/**
 * ExampleEntity.test.ts
 *
 * Demonstrates creating, updating, fetching, and deleting a Firestore document
 * via ExampleEntity and FirestoreService, connected to the Firestore emulator.
 */

import { getApp, deleteApp, initializeApp } from "firebase/app"; // for clean teardown
import FirestoreService from "../src/firestoreService";
import { ExampleEntity, ExampleData } from "../src/examples/ExampleEntity";

// Increase timeout (5s default can be too short for emulator tests).
jest.setTimeout(20000);

// 1️⃣ Initialize Firestore and connect emulator once for all tests
beforeAll(() => {
  // Initialize Firebase app with test config. The `projectId` here should match the emulator settings.
  const app = initializeApp({
    apiKey: "test-api-key",
    authDomain: "test-auth-domain",
    projectId: "test-project-id", // Must match your emulator project
    storageBucket: "test-storage-bucket",
    messagingSenderId: "test-messaging-sender-id",
    appId: "test-app-id",
  });

  // Initialize Firestore with the Firebase app
  FirestoreService.initialize(app);

  // Connect to local emulator on the port you use (default 8080 for Firestore)
  FirestoreService.connectEmulator(9098);
});

// 2️⃣ Cleanup: Delete the Firebase app after all tests finish
afterAll(async () => {
  await deleteApp(getApp());
});

// Provide example data for creating an entity
const exampleData: ExampleData = {
  title: "Test Example",
  description: "This is a test example for Firestore.",
  createdAt: new Date(),
  updatedAt: new Date(),
  owner: "user123",
};

describe("🔥 FirestoreService - ExampleEntity Tests", () => {
  let testEntity: ExampleEntity;

  // 1) Create a new ExampleEntity
  it("should create and save a new example entity", async () => {
    testEntity = await ExampleEntity.create(exampleData);
    expect(testEntity.id).toBeDefined();

    const fetchedEntity = await ExampleEntity.getById(testEntity.id!);
    expect(fetchedEntity).not.toBeNull();
    expect(fetchedEntity?.title).toBe(exampleData.title);
  });

  // 2) Update the ExampleEntity
  it("should update an existing example entity", async () => {
    await testEntity.update({ title: "Updated Example Title" });

    const updatedEntity = await ExampleEntity.getById(testEntity.id!);
    expect(updatedEntity?.title).toBe("Updated Example Title");
  });

  // 3) Fetch the ExampleEntity by ID
  it("should fetch an example entity by ID", async () => {
    const fetchedEntity = await ExampleEntity.getById(testEntity.id!);
    expect(fetchedEntity).not.toBeNull();
    expect(fetchedEntity?.owner).toBe(exampleData.owner);
  });

  // 4) Delete the ExampleEntity
  it("should delete an example entity", async () => {
    await FirestoreService.deleteDocument(`examples/${testEntity.id}`);
    const deletedEntity = await ExampleEntity.getById(testEntity.id!);
    expect(deletedEntity).toBeNull();
  });
});
