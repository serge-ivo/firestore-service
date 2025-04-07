// RealTimeExample.ts

import { initializeApp } from "firebase/app";
import { FirestoreService } from "../firestoreService";
import { ExampleData } from "./ExampleEntity";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
/**
 * Demonstrates how to use subscribeToDocument and subscribeToCollection
 * for real-time updates.
 */
async function demoRealTime() {
  // 1️⃣ Initialize Firebase app and Firestore
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

  // Instantiate FirestoreService instead of calling a static initialize
  const firestoreService = new FirestoreService(db);

  // 2️⃣ Create data and add it using the service
  const newExampleData: ExampleData = {
    title: "Realtime Demo",
    description: "Testing real-time subscription",
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: "user123",
  };
  const newId = await firestoreService.addDocument<ExampleData>(
    "examples",
    newExampleData
  );

  if (!newId) {
    console.error("Failed to create document");
    return; // Exit if creation failed
  }

  // 3️⃣ Subscribe to the single document changes using the new ID
  const unsubscribeDoc = firestoreService.subscribeToDocument<ExampleData>(
    `examples/${newId}`, // Use the returned ID
    (updatedData: ExampleData | null) => {
      if (updatedData) {
        console.log("Document changed in real time:", updatedData);
      } else {
        console.log("Document was deleted.");
      }
    }
  );

  // 4️⃣ Subscribe to the entire "examples" collection
  //    (though, in a real app, you might limit or filter your queries)
  const unsubscribeCollection =
    firestoreService.subscribeToCollection<ExampleData>(
      "examples",
      (allDocs: ExampleData[]) => {
        console.log("Collection changed in real time. Current docs:", allDocs);
      }
    );

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
