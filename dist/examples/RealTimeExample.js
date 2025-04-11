"use strict";
// RealTimeExample.ts
Object.defineProperty(exports, "__esModule", { value: true });
const firestoreService_1 = require("../firestoreService");
/**
 * Demonstrates how to use subscribeToDocument and subscribeToCollection
 * for real-time updates.
 */
async function demoRealTimeUpdates() {
    // 1️⃣ Define Firebase Config
    const firebaseConfig = {
        apiKey: "fake-api-key", // Replace with actual config
        projectId: "your-app",
    };
    // 2️⃣ Initialize FirestoreService
    const firestoreService = new firestoreService_1.FirestoreService(firebaseConfig);
    // Optional: Connect to emulator
    // try {
    //   firestoreService.connectEmulator(8080);
    // } catch (error) {
    //   console.warn("Emulator connection failed:", error);
    // }
    // 3️⃣ Prepare a document for demonstration
    const initialData = {
        title: "Realtime Demo",
        description: "Testing real-time subscription",
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: "user123",
    };
    const newId = await firestoreService.addDocument("examples", initialData);
    if (!newId) {
        console.error("Failed to create document");
        return; // Exit if creation failed
    }
    // 4️⃣ Subscribe to the single document changes using the new ID
    const unsubscribeDoc = firestoreService.subscribeToDocument(`examples/${newId}`, // Use the returned ID
    (updatedData) => {
        if (updatedData) {
            console.log("Document changed in real time:", updatedData);
        }
        else {
            console.log("Document was deleted.");
        }
    });
    // 5️⃣ Subscribe to the entire "examples" collection
    //    (though, in a real app, you might limit or filter your queries)
    const unsubscribeCollection = firestoreService.subscribeToCollection("examples", (allDocs) => {
        console.log("Collection changed in real time. Current docs:", allDocs);
    });
    // 6️⃣ After some test updates, you can unsubscribe
    //    E.g., in a real app, you'd do this when leaving a screen or ending the process:
    setTimeout(() => {
        console.log("Unsubscribing from real-time updates...");
        unsubscribeDoc();
        unsubscribeCollection();
    }, 30000); // unsub after 30 seconds for demo
}
// Just call the function to run the demo
demoRealTimeUpdates().catch(console.error);
