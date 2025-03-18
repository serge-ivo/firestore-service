"use strict";
// RealTimeExample.ts
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
const ExampleEntity_1 = require("./ExampleEntity");
/**
 * Demonstrates how to use subscribeToDocument and subscribeToCollection
 * for real-time updates.
 */
function demoRealTime() {
    return __awaiter(this, void 0, void 0, function* () {
        // 1️⃣ Initialize Firebase app and Firestore
        const app = (0, app_1.initializeApp)({
            apiKey: "fake-api-key",
            projectId: "your-app",
        });
        // Initialize Firestore with the Firebase app
        firestoreService_1.default.initialize(app);
        // 2️⃣ Create a sample document to watch
        const newEntity = yield ExampleEntity_1.ExampleEntity.create({
            title: "Realtime Demo",
            description: "Testing real-time subscription",
            createdAt: new Date(),
            updatedAt: new Date(),
            owner: "user123",
        });
        // 3️⃣ Subscribe to the single document changes
        const unsubscribeDoc = firestoreService_1.default.subscribeToDocument(`examples/${newEntity.id}`, (updatedData) => {
            if (updatedData) {
                console.log("Document changed in real time:", updatedData);
            }
            else {
                console.log("Document was deleted.");
            }
        });
        // 4️⃣ Subscribe to the entire "examples" collection
        //    (though, in a real app, you might limit or filter your queries)
        const unsubscribeCollection = firestoreService_1.default.subscribeToCollection("examples", (allDocs) => {
            console.log("Collection changed in real time. Current docs:", allDocs);
        });
        // 5️⃣ After some test updates, you can unsubscribe
        //    E.g., in a real app, you’d do this when leaving a screen or ending the process:
        setTimeout(() => {
            console.log("Unsubscribing from real-time updates...");
            unsubscribeDoc();
            unsubscribeCollection();
        }, 30000); // unsub after 30 seconds for demo
    });
}
// Just call the function to run the demo
demoRealTime().catch(console.error);
//# sourceMappingURL=RealTimeExample.js.map