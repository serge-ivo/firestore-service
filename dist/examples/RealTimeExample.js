"use strict";
// RealTimeExample.ts
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const firestoreService_1 = require("../firestoreService");
const firestore_1 = require("firebase/firestore");
/**
 * Demonstrates how to use subscribeToDocument and subscribeToCollection
 * for real-time updates.
 */
async function demoRealTime() {
    // 1️⃣ Initialize Firebase app and Firestore
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
    // Instantiate FirestoreService instead of calling a static initialize
    const firestoreService = new firestoreService_1.FirestoreService(db);
    // 2️⃣ Create data and add it using the service
    const newExampleData = {
        title: "Realtime Demo",
        description: "Testing real-time subscription",
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: "user123",
    };
    const newId = await firestoreService.addDocument("examples", newExampleData);
    if (!newId) {
        console.error("Failed to create document");
        return; // Exit if creation failed
    }
    // 3️⃣ Subscribe to the single document changes using the new ID
    const unsubscribeDoc = firestoreService.subscribeToDocument(`examples/${newId}`, // Use the returned ID
    (updatedData) => {
        if (updatedData) {
            console.log("Document changed in real time:", updatedData);
        }
        else {
            console.log("Document was deleted.");
        }
    });
    // 4️⃣ Subscribe to the entire "examples" collection
    //    (though, in a real app, you might limit or filter your queries)
    const unsubscribeCollection = firestoreService.subscribeToCollection("examples", (allDocs) => {
        console.log("Collection changed in real time. Current docs:", allDocs);
    });
    // 5️⃣ After some test updates, you can unsubscribe
    //    E.g., in a real app, you'd do this when leaving a screen or ending the process:
    setTimeout(() => {
        console.log("Unsubscribing from real-time updates...");
        unsubscribeDoc();
        unsubscribeCollection();
    }, 30000); // unsub after 30 seconds for demo
}
// Just call the function to run the demo
demoRealTime().catch(console.error);
