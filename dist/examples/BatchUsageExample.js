"use strict";
// BatchUsageExample.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const firestoreService_1 = __importDefault(require("../firestoreService"));
const ExampleEntity_1 = require("../examples/ExampleEntity");
const firestore_1 = require("firebase/firestore");
const firestore_2 = require("firebase/firestore");
/**
 * Demonstrates how to use FirestoreService.getBatch() alongside
 * FirestoreService.updateDocumentInBatch/setDocumentInBatch/deleteDocumentInBatch
 * to perform multiple writes in a single atomic batch.
 */
function demoBatchWrites() {
    return __awaiter(this, void 0, void 0, function* () {
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
        firestoreService_1.default.initialize(db);
        // 2️⃣ Create two new ExampleEntity documents
        const entityA = yield ExampleEntity_1.ExampleEntity.create({
            title: "Batch Doc A",
            description: "Created via batch demo",
            createdAt: new Date(),
            updatedAt: new Date(),
            owner: "user123",
        });
        const entityB = yield ExampleEntity_1.ExampleEntity.create({
            title: "Batch Doc B",
            description: "Created via batch demo",
            createdAt: new Date(),
            updatedAt: new Date(),
            owner: "user123",
        });
        console.log("Created entityA:", entityA.id);
        console.log("Created entityB:", entityB.id);
        // 3️⃣ Start a Firestore batch
        const batch = firestoreService_1.default.getBatch();
        // 4️⃣ Add operations to the batch
        //    For example, let's update both docs
        if (entityA.id) {
            firestoreService_1.default.updateInBatch(batch, entityA.getDocPath(), {
                title: "Batch Updated A",
                updatedAt: new Date(),
            });
        }
        if (entityB.id) {
            firestoreService_1.default.updateInBatch(batch, entityB.getDocPath(), {
                title: "Batch Updated B",
                updatedAt: new Date(),
            });
        }
        // (If you wanted to set data from scratch, do:)
        // FirestoreService.setInBatch(batch, entityA.getDocPath(), { ...newData }, { merge: true });
        // (If you wanted to delete in batch, do:)
        // FirestoreService.deleteInBatch(batch, entityB.getDocPath());
        // 5️⃣ Commit the batch
        yield batch.commit();
        console.log("✅ Batch write completed, documents updated.");
        // 6️⃣ Confirm the changes
        //    Re-fetch from Firestore to verify
        const updatedA = yield ExampleEntity_1.ExampleEntity.get(entityA.getDocPath());
        const updatedB = yield ExampleEntity_1.ExampleEntity.get(entityB.getDocPath());
        console.log("Updated entity A:", updatedA);
        console.log("Updated entity B:", updatedB);
    });
}
// Run the demo
demoBatchWrites().catch(console.error);
//# sourceMappingURL=BatchUsageExample.js.map