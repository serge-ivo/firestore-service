"use strict";
// FieldValueExample.ts
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const firestoreService_1 = require("../firestoreService");
const firestore_1 = require("firebase/firestore");
/**
 * Demonstrates FirestoreService instance usage with FieldValue operations:
 * - arrayUnion / arrayRemove
 * - deleteField
 */
async function demoFieldValueOps() {
    // Initialize Firebase app
    const app = (0, app_1.initializeApp)({
        apiKey: "fake-api-key",
        projectId: "your-app",
    });
    // Initialize Firestore with the Firebase app
    const db = (0, firestore_1.initializeFirestore)(app, {
        localCache: (0, firestore_1.persistentLocalCache)({
            tabManager: (0, firestore_1.persistentMultipleTabManager)(),
        }),
    });
    // Instantiate the service
    const firestoreService = new firestoreService_1.FirestoreService(db);
    // 1️⃣ Create data and add it using the service
    //    Assuming ExampleData has a 'tags' field (e.g., tags?: string[])
    const newExampleData = {
        title: "Field Values Demo",
        description: "Testing arrayUnion/arrayRemove",
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: "owner456",
        tags: [], // Initialize tags array
    };
    const newId = await firestoreService.addDocument("examples", // Assuming collection name is 'examples'
    newExampleData);
    if (!newId) {
        console.error("Failed to create document for FieldValue demo.");
        return;
    }
    const docPath = `examples/${newId}`; // Define doc path
    // 2️⃣ Use updateDocument with arrayUnion (using instance and imported helper)
    await firestoreService.updateDocument(docPath, {
        tags: (0, firestore_1.arrayUnion)("firebase", "tutorial"), // Use imported arrayUnion
    });
    console.log("Added tags via arrayUnion.");
    // 3️⃣ Remove a tag with arrayRemove (using instance and imported helper)
    await firestoreService.updateDocument(docPath, {
        tags: (0, firestore_1.arrayRemove)("firebase"), // Use imported arrayRemove
    });
    console.log("Removed 'firebase' tag via arrayRemove.");
    // 4️⃣ Delete a field entirely with deleteField (using instance and imported helper)
    await firestoreService.updateDocument(docPath, {
        description: (0, firestore_1.deleteField)(), // Use imported deleteField
    });
    console.log("Deleted 'description' field from document.");
}
// Run the demo
demoFieldValueOps().catch(console.error);
