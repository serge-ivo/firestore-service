"use strict";
// ExampleUsage.ts
Object.defineProperty(exports, "__esModule", { value: true });
const firestoreService_1 = require("../firestoreService");
const ExampleEntity_1 = require("./ExampleEntity");
async function demoUsage() {
    // 1️⃣ Define Firebase Config
    const firebaseConfig = {
        apiKey: "your-api-key", // Replace with your actual config
        projectId: "your-project-id", // Replace with your actual project ID
    };
    // 2️⃣ Initialize FirestoreService with the config
    const firestoreService = new firestoreService_1.FirestoreService(firebaseConfig);
    // Optional: Connect to emulator if running one
    // try {
    //   firestoreService.connectEmulator(8080);
    // } catch (error) {
    //   console.warn("Could not connect to Firestore Emulator:", error);
    // }
    // 3️⃣ Create a new document
    const newEntityId = await firestoreService.addDocument("examples", {
        title: "Hello World",
        description: "A brand new entity",
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: "user123",
    });
    if (!newEntityId) {
        console.error("Failed to create entity.");
        return;
    }
    console.log("Created entity with ID:", newEntityId);
    // 4️⃣ Fetch the document data using the service and its ID
    const docPath = ExampleEntity_1.ExampleEntity.buildPath(newEntityId);
    const fetchedData = await firestoreService.getDocument(docPath);
    if (!fetchedData) {
        console.error(`Failed to fetch document with ID: ${newEntityId}`);
        return;
    }
    // Instantiate ExampleEntity using the fetched data and ID
    const fetchedEntity = new ExampleEntity_1.ExampleEntity({ id: newEntityId, ...fetchedData });
    console.log("Fetched and instantiated entity:", fetchedEntity);
    // 5️⃣ Update the entity instance (use service for persistence)
    if (fetchedEntity) {
        // Update local instance data first
        fetchedEntity.description = "Updated description via service";
        fetchedEntity.updatedAt = new Date();
        // Persist changes using the service
        await firestoreService.updateDocument(fetchedEntity.getDocPath(), {
            description: fetchedEntity.description,
            updatedAt: fetchedEntity.updatedAt,
        });
        console.log("Updated entity and persisted changes:", fetchedEntity);
    }
    // 6️⃣ Demonstrate query or fetchCollection using the service instance
    // Fetch a list of ExampleData documents
    const allExamplesData = await firestoreService.fetchCollection("examples");
    console.log("Fetched all example docs data:", allExamplesData);
    // If you need ExampleEntity instances:
    const allExampleEntities = allExamplesData.map((data) => new ExampleEntity_1.ExampleEntity({ id: data.id, ...data }) // Assuming data includes id from converter
    );
    console.log("Instantiated all ExampleEntities:", allExampleEntities);
    // 7️⃣ Delete using the service
    // if (fetchedEntity) { // Use docPath for deletion
    //   await firestoreService.deleteDocument(docPath);
    //   console.log("Deleted entity with ID:", newEntityId);
    // }
}
// Call the demo function
demoUsage().catch(console.error);
