// BatchUsageExample.ts

import { ExampleData, ExampleEntity } from "../examples/ExampleEntity";
import { FirestoreService } from "../firestoreService";

/**
 * Demonstrates how to use FirestoreService.getBatch() alongside
 * FirestoreService.updateDocumentInBatch/setDocumentInBatch/deleteDocumentInBatch
 * to perform multiple writes in a single atomic batch.
 */
async function demoBatchWrites() {
  // 1️⃣ Define Firebase config
  const firebaseConfig = {
    apiKey: "fake-api-key", // Replace with your actual config if running against real Firebase
    projectId: "your-app", // Replace with your actual project ID
  };

  // Initialize FirestoreService with the Firebase config
  // FirestoreService now handles app initialization and Firestore instance creation internally
  const firestoreService = new FirestoreService(firebaseConfig);

  // Optionally, connect to emulator if needed (ensure emulator is running)
  // try {
  //   firestoreService.connectEmulator(8080); // Default Firestore emulator port
  //   console.log("Connected to Firestore Emulator for batch demo.");
  // } catch (error) {
  //   console.warn("Could not connect to Firestore Emulator:", error);
  // }

  // 2️⃣ Create two new ExampleEntity documents
  const entityA = await firestoreService.addDocument<ExampleData>("examples", {
    title: "Batch Doc A",
    description: "Created via batch demo",
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: "user123",
  });

  const entityB = await firestoreService.addDocument<ExampleData>("examples", {
    title: "Batch Doc B",
    description: "Created via batch demo",
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: "user123",
  });

  if (!entityA || !entityB) {
    console.error("Failed to create initial documents for batch demo.");
    return;
  }

  console.log("Created entityA with ID:", entityA);
  console.log("Created entityB with ID:", entityB);

  // Build document paths using the IDs
  const docPathA = ExampleEntity.buildPath(entityA);
  const docPathB = ExampleEntity.buildPath(entityB);

  // 3️⃣ Start a Firestore batch
  const batch = firestoreService.getBatch();

  // 4️⃣ Add operations to the batch using the document paths
  firestoreService.updateInBatch(batch, docPathA, {
    title: "Batch Updated A",
    updatedAt: new Date(),
  });
  firestoreService.updateInBatch(batch, docPathB, {
    title: "Batch Updated B",
    updatedAt: new Date(),
  });

  // (If you wanted to set data from scratch, do:)
  // firestoreService.setInBatch(batch, docPathA, { ...newData }, { merge: true });

  // (If you wanted to delete in batch, do:)
  // firestoreService.deleteInBatch(batch, docPathB);

  // 5️⃣ Commit the batch
  await batch.commit();
  console.log("✅ Batch write completed, documents updated.");

  // 6️⃣ Confirm the changes using the document paths
  //    Re-fetch from Firestore to verify
  const updatedA = await firestoreService.getDocument<ExampleData>(docPathA);
  const updatedB = await firestoreService.getDocument<ExampleData>(docPathB);

  console.log("Updated entity A data:", updatedA);
  console.log("Updated entity B data:", updatedB);
}

// Run the demo
demoBatchWrites().catch(console.error);
