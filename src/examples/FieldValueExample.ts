// FieldValueExample.ts

import { arrayRemove, arrayUnion, deleteField } from "firebase/firestore";
import { FirestoreService } from "../firestoreService";
import { ExampleData } from "./ExampleEntity";
/**
 * Demonstrates FirestoreService instance usage with FieldValue operations:
 * - arrayUnion / arrayRemove
 * - deleteField
 */
async function demoFieldValueOps() {
  // 1️⃣ Define Firebase Config
  const firebaseConfig = {
    apiKey: "fake-api-key", // Replace with actual config
    projectId: "your-app",
  };

  // 2️⃣ Initialize FirestoreService
  const firestoreService = new FirestoreService(firebaseConfig);

  // Optional: Connect to emulator
  // try {
  //   firestoreService.connectEmulator(8080);
  // } catch (error) {
  //   console.warn("Emulator connection failed:", error);
  // }

  // 3️⃣ Create a document to work with
  const initialData: ExampleData & { tags?: string[]; comments?: string[] } = {
    title: "Field Values Demo",
    description: "Testing arrayUnion/arrayRemove",
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: "owner456",
    tags: [], // Initialize tags array
  };

  const newId = await firestoreService.addDocument<ExampleData>(
    "examples", // Assuming collection name is 'examples'
    initialData
  );

  if (!newId) {
    console.error("Failed to create document for FieldValue demo.");
    return;
  }

  const docPath = `examples/${newId}`; // Define doc path

  // 4️⃣ Use updateDocument with arrayUnion (using instance and imported helper)
  await firestoreService.updateDocument(docPath, {
    tags: arrayUnion("firebase", "tutorial"), // Use imported arrayUnion
  });
  console.log("Added tags via arrayUnion.");

  // 5️⃣ Remove a tag with arrayRemove (using instance and imported helper)
  await firestoreService.updateDocument(docPath, {
    tags: arrayRemove("firebase"), // Use imported arrayRemove
  });
  console.log("Removed 'firebase' tag via arrayRemove.");

  // 6️⃣ Delete a field entirely with deleteField (using instance and imported helper)
  await firestoreService.updateDocument(docPath, {
    description: deleteField(), // Use imported deleteField
  });
  console.log("Deleted 'description' field from document.");
}

// Run the demo
demoFieldValueOps().catch(console.error);
