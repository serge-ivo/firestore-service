"use strict";
// BatchUsageExample.ts
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const firestoreService_1 = require("../firestoreService");
const ExampleEntity_1 = require("../examples/ExampleEntity");
const firestore_1 = require("firebase/firestore");
const firestore_2 = require("firebase/firestore");
/**
 * Demonstrates how to use FirestoreService.getBatch() alongside
 * FirestoreService.updateDocumentInBatch/setDocumentInBatch/deleteDocumentInBatch
 * to perform multiple writes in a single atomic batch.
 */
async function demoBatchWrites() {
    // 1️⃣ Initialize Firebase app and Firestore
    const app = (0, app_1.initializeApp)({
        apiKey: "fake-api-key",
        projectId: "your-app",
    });
    const db = (0, firestore_1.initializeFirestore)(app, {
        localCache: (0, firestore_1.persistentLocalCache)({
            tabManager: (0, firestore_2.persistentMultipleTabManager)(),
        }),
    });
    // Initialize Firestore with the Firebase app
    const firestoreService = new firestoreService_1.FirestoreService(db);
    // 2️⃣ Create two new ExampleEntity documents
    const entityA = await firestoreService.addDocument("examples", {
        title: "Batch Doc A",
        description: "Created via batch demo",
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: "user123",
    });
    const entityB = await firestoreService.addDocument("examples", {
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
    const docPathA = ExampleEntity_1.ExampleEntity.buildPath(entityA);
    const docPathB = ExampleEntity_1.ExampleEntity.buildPath(entityB);
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
    const updatedA = await firestoreService.getDocument(docPathA);
    const updatedB = await firestoreService.getDocument(docPathB);
    console.log("Updated entity A data:", updatedA);
    console.log("Updated entity B data:", updatedB);
}
// Run the demo
demoBatchWrites().catch(console.error);
