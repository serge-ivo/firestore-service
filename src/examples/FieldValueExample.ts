// FieldValueExample.ts

import { initializeApp } from "firebase/app";
import FirestoreService from "../firestoreService";
import { ExampleEntity } from "./ExampleEntity";

/**
 * Demonstrates FirestoreService.getFieldValue() usage:
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
  FirestoreService.initialize(app);

  // 1️⃣ Create an entity that has (or can have) an array field
  //    Let’s assume we add a "tags" field to ExampleEntity for the sake of the demo
  const newEntity = await ExampleEntity.create({
    title: "Field Values Demo",
    description: "Testing arrayUnion/arrayRemove",
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: "owner456",
    // tags: [] // If your ExampleData has a 'tags' field
  } as any); // casting to any if not in the interface, or add 'tags' to ExampleData

  // 2️⃣ Use updateDocument with arrayUnion
  const { arrayUnion, arrayRemove } = FirestoreService.getFieldValue();
  await FirestoreService.updateDocument(newEntity.getDocPath(), {
    tags: arrayUnion("firebase", "tutorial"),
  });
  console.log("Added tags via arrayUnion.");

  // 3️⃣ Remove a tag with arrayRemove
  await FirestoreService.updateDocument(newEntity.getDocPath(), {
    tags: arrayRemove("firebase"),
  });
  console.log("Removed 'firebase' tag via arrayRemove.");

  // 4️⃣ Delete a field entirely with deleteField
  await FirestoreService.updateDocument(newEntity.getDocPath(), {
    description: FirestoreService.deleteField(),
  });
  console.log("Deleted 'description' field from document.");
}

// Run the demo
demoFieldValueOps().catch(console.error);
