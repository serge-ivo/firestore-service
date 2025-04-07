// FieldValueExample.ts

import { initializeApp } from "firebase/app";
import { FirestoreService } from "../firestoreService";
import { ExampleData } from "./ExampleEntity";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  arrayUnion,
  arrayRemove,
  deleteField,
} from "firebase/firestore";
/**
 * Demonstrates FirestoreService instance usage with FieldValue operations:
 * - arrayUnion / arrayRemove
 * - deleteField
 */
async function demoFieldValueOps() {
  // Initialize Firebase app
  const app = initializeApp({
    apiKey: "fake-api-key",
    projectId: "your-app",
  });

  // Initialize Firestore with the Firebase app
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });

  // Instantiate the service
  const firestoreService = new FirestoreService(db);

  // 1️⃣ Create data and add it using the service
  //    Assuming ExampleData has a 'tags' field (e.g., tags?: string[])
  const newExampleData: ExampleData = {
    title: "Field Values Demo",
    description: "Testing arrayUnion/arrayRemove",
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: "owner456",
    tags: [], // Initialize tags array
  };

  const newId = await firestoreService.addDocument<ExampleData>(
    "examples", // Assuming collection name is 'examples'
    newExampleData
  );

  if (!newId) {
    console.error("Failed to create document for FieldValue demo.");
    return;
  }

  const docPath = `examples/${newId}`; // Define doc path

  // 2️⃣ Use updateDocument with arrayUnion (using instance and imported helper)
  await firestoreService.updateDocument(docPath, {
    tags: arrayUnion("firebase", "tutorial"), // Use imported arrayUnion
  });
  console.log("Added tags via arrayUnion.");

  // 3️⃣ Remove a tag with arrayRemove (using instance and imported helper)
  await firestoreService.updateDocument(docPath, {
    tags: arrayRemove("firebase"), // Use imported arrayRemove
  });
  console.log("Removed 'firebase' tag via arrayRemove.");

  // 4️⃣ Delete a field entirely with deleteField (using instance and imported helper)
  await firestoreService.updateDocument(docPath, {
    description: deleteField(), // Use imported deleteField
  });
  console.log("Deleted 'description' field from document.");
}

// Run the demo
demoFieldValueOps().catch(console.error);
