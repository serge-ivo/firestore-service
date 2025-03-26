// BatchUsageExample.ts

import { initializeApp } from "firebase/app";
import FirestoreService from "../firestoreService";
import { ExampleEntity } from "../examples/ExampleEntity";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import { persistentMultipleTabManager } from "firebase/firestore";

/**
 * Demonstrates how to use FirestoreService.getBatch() alongside
 * FirestoreService.updateDocumentInBatch/setDocumentInBatch/deleteDocumentInBatch
 * to perform multiple writes in a single atomic batch.
 */
async function demoBatchWrites() {
  // 1️⃣ Initialize Firebase app and Firestore
  const app = initializeApp({
    apiKey: "fake-api-key",
    projectId: "your-app",
  });

  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });

  // Initialize Firestore with the Firebase app
  FirestoreService.initialize(db);

  // 2️⃣ Create two new ExampleEntity documents
  const entityA = await ExampleEntity.create({
    title: "Batch Doc A",
    description: "Created via batch demo",
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: "user123",
  });

  const entityB = await ExampleEntity.create({
    title: "Batch Doc B",
    description: "Created via batch demo",
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: "user123",
  });

  console.log("Created entityA:", entityA.id);
  console.log("Created entityB:", entityB.id);

  // 3️⃣ Start a Firestore batch
  const batch = FirestoreService.getBatch();

  // 4️⃣ Add operations to the batch
  //    For example, let's update both docs
  if (entityA.id) {
    FirestoreService.updateInBatch(batch, entityA.getDocPath(), {
      title: "Batch Updated A",
      updatedAt: new Date(),
    });
  }
  if (entityB.id) {
    FirestoreService.updateInBatch(batch, entityB.getDocPath(), {
      title: "Batch Updated B",
      updatedAt: new Date(),
    });
  }

  // (If you wanted to set data from scratch, do:)
  // FirestoreService.setInBatch(batch, entityA.getDocPath(), { ...newData }, { merge: true });

  // (If you wanted to delete in batch, do:)
  // FirestoreService.deleteInBatch(batch, entityB.getDocPath());

  // 5️⃣ Commit the batch
  await batch.commit();
  console.log("✅ Batch write completed, documents updated.");

  // 6️⃣ Confirm the changes
  //    Re-fetch from Firestore to verify
  const updatedA = await ExampleEntity.get<ExampleEntity>(entityA.getDocPath());
  const updatedB = await ExampleEntity.get<ExampleEntity>(entityB.getDocPath());

  console.log("Updated entity A:", updatedA);
  console.log("Updated entity B:", updatedB);
}

// Run the demo
demoBatchWrites().catch(console.error);
