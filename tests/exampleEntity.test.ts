import { getFirestore, deleteDoc, doc } from "firebase/firestore";
import FirestoreService from "../src/firestoreService";
import { ExampleEntity, ExampleData } from "../src/examples/ExampleEntity";

// ✅ Initialize Firebase Emulator
FirestoreService.initialize({
  apiKey: "test-api-key",
  authDomain: "test-auth-domain",
  projectId: "test-project-id",
  storageBucket: "test-storage-bucket",
  messagingSenderId: "test-messaging-sender-id",
  appId: "test-app-id",
});

const db = getFirestore();

const testCollection = "examples";
const exampleData: ExampleData = {
  title: "Test Example",
  description: "This is a test example for Firestore.",
  createdAt: new Date(),
  updatedAt: new Date(),
  owner: "user123",
};

describe("🔥 FirestoreService - ExampleEntity Tests", () => {
  let testEntity: ExampleEntity;

  beforeAll(async () => {
    console.log("🔥 Starting FirestoreService ExampleEntity Tests...");
  });

  afterAll(async () => {
    if (testEntity?.id) {
      await deleteDoc(doc(db, `examples/${testEntity.id}`));
    }
  });

  // ✅ 1️⃣ Test Creating and Saving an ExampleEntity
  it("✅ should create and save a new example entity", async () => {
    testEntity = new ExampleEntity(exampleData);
    await testEntity.save();

    expect(testEntity.id).toBeDefined();

    const fetchedEntity = await ExampleEntity.getById(testEntity.id!);
    expect(fetchedEntity).not.toBeNull();
    expect(fetchedEntity?.title).toBe(exampleData.title);
  });

  // ✅ 2️⃣ Test Updating an ExampleEntity
  it("✅ should update an existing example entity", async () => {
    testEntity.title = "Updated Example Title";
    await testEntity.save();

    const updatedEntity = await ExampleEntity.getById(testEntity.id!);
    expect(updatedEntity?.title).toBe("Updated Example Title");
  });

  // ✅ 3️⃣ Test Fetching an ExampleEntity
  it("✅ should fetch an example entity by ID", async () => {
    const fetchedEntity = await ExampleEntity.getById(testEntity.id!);
    expect(fetchedEntity).not.toBeNull();
    expect(fetchedEntity?.owner).toBe(exampleData.owner);
  });

  // ✅ 4️⃣ Test Deleting an ExampleEntity
  it("✅ should delete an example entity", async () => {
    await FirestoreService.deleteDocument(`examples/${testEntity.id}`);
    const deletedEntity = await ExampleEntity.getById(testEntity.id!);
    expect(deletedEntity).toBeNull();
  });
});
