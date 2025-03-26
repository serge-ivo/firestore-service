// RealTimeExample.ts

import { initializeApp } from "firebase/app";
import FirestoreService from "../firestoreService";
import { ExampleData, ExampleEntity } from "./ExampleEntity";
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
  FirestoreService.initialize(db);

  // 2️⃣ Create a sample document to watch
  const newEntity = await ExampleEntity.create({
    title: "Realtime Demo",
    description: "Testing real-time subscription",
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: "user123",
  });

  // 3️⃣ Subscribe to the single document changes
  const unsubscribeDoc = FirestoreService.subscribeToDocument<ExampleData>(
    `examples/${newEntity.id}`,
    (updatedData) => {
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
    FirestoreService.subscribeToCollection<ExampleData>(
      "examples",
      (allDocs) => {
        console.log("Collection changed in real time. Current docs:", allDocs);
      }
    );

  // 5️⃣ After some test updates, you can unsubscribe
  //    E.g., in a real app, you’d do this when leaving a screen or ending the process:
  setTimeout(() => {
    console.log("Unsubscribing from real-time updates...");
    unsubscribeDoc();
    unsubscribeCollection();
  }, 30000); // unsub after 30 seconds for demo
}

// Just call the function to run the demo
demoRealTime().catch(console.error);
