// ExampleUsage.ts

import { initializeApp } from "firebase/app";
import { FirestoreService } from "../firestoreService";
import { ExampleEntity, ExampleData } from "./ExampleEntity";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
(async function runDemo() {
  // 1️⃣ Initialize Firebase app (only once in your app's lifecycle)
  const app = initializeApp({
    apiKey: "fake-api-key", // Replace with real config in production
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-app",
    // etc.
  });

  // 2️⃣ Initialize Firestore using the Firebase app
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
  const firestoreService = new FirestoreService(db);

  // 3️⃣ (Optional) Connect to Firestore emulator for local dev
  // FirestoreService.connectEmulator(8080);

  // 4️⃣ Create a new document with ExampleData
  const newEntityId = await firestoreService.addDocument<ExampleData>(
    "examples",
    {
      title: "Hello World",
      description: "A brand new entity",
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: "user123",
    }
  );

  if (!newEntityId) {
    console.error("Failed to create entity.");
    return;
  }

  console.log("Created entity with ID:", newEntityId);

  // 5️⃣ Fetch the document data using the service and its ID
  const docPath = ExampleEntity.buildPath(newEntityId);
  const fetchedData = await firestoreService.getDocument<ExampleData>(docPath);

  if (!fetchedData) {
    console.error(`Failed to fetch document with ID: ${newEntityId}`);
    return;
  }

  // Instantiate ExampleEntity using the fetched data and ID
  const fetchedEntity = new ExampleEntity({ id: newEntityId, ...fetchedData });
  console.log("Fetched and instantiated entity:", fetchedEntity);

  // 6️⃣ Update the entity instance (use service for persistence)
  if (fetchedEntity) {
    // Update local instance data first
    fetchedEntity.description = "Updated description via service";
    fetchedEntity.updatedAt = new Date();

    // Persist changes using the service
    await firestoreService.updateDocument(fetchedEntity.getDocPath(), {
      description: fetchedEntity.description,
      updatedAt: fetchedEntity.updatedAt,
    });
    console.log("Updated entity and persisted changes:", fetchedEntity);
  }

  // 7️⃣ Demonstrate query or fetchCollection using the service instance
  // Fetch a list of ExampleData documents
  const allExamplesData = await firestoreService.fetchCollection<ExampleData>(
    "examples"
  );
  console.log("Fetched all example docs data:", allExamplesData);

  // If you need ExampleEntity instances:
  const allExampleEntities = allExamplesData.map(
    (data) => new ExampleEntity({ id: data.id, ...data }) // Assuming data includes id from converter
  );
  console.log("Instantiated all ExampleEntities:", allExampleEntities);

  // 8️⃣ Delete using the service
  // if (fetchedEntity) { // Use docPath for deletion
  //   await firestoreService.deleteDocument(docPath);
  //   console.log("Deleted entity with ID:", newEntityId);
  // }
})();
