"use strict";
// FieldValueExample.ts
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
 * Demonstrates FirestoreService.getFieldValue() usage:
 * - arrayUnion / arrayRemove
 * - deleteField
 */
function demoFieldValueOps() {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialize Firebase app
        const app = (0, app_1.initializeApp)({
            apiKey: "fake-api-key",
            projectId: "your-app",
        });
        // Initialize Firestore with the Firebase app
        firestoreService_1.default.initialize(app);
        // 1️⃣ Create an entity that has (or can have) an array field
        //    Let’s assume we add a "tags" field to ExampleEntity for the sake of the demo
        const newEntity = yield ExampleEntity_1.ExampleEntity.create({
            title: "Field Values Demo",
            description: "Testing arrayUnion/arrayRemove",
            createdAt: new Date(),
            updatedAt: new Date(),
            owner: "owner456",
            // tags: [] // If your ExampleData has a 'tags' field
        }); // casting to any if not in the interface, or add 'tags' to ExampleData
        // 2️⃣ Use updateDocument with arrayUnion
        const { arrayUnion, arrayRemove } = firestoreService_1.default.getFieldValue();
        yield firestoreService_1.default.updateDocument(newEntity.getDocPath(), {
            tags: arrayUnion("firebase", "tutorial"),
        });
        console.log("Added tags via arrayUnion.");
        // 3️⃣ Remove a tag with arrayRemove
        yield firestoreService_1.default.updateDocument(newEntity.getDocPath(), {
            tags: arrayRemove("firebase"),
        });
        console.log("Removed 'firebase' tag via arrayRemove.");
        // 4️⃣ Delete a field entirely with deleteField
        yield firestoreService_1.default.updateDocument(newEntity.getDocPath(), {
            description: firestoreService_1.default.deleteField(),
        });
        console.log("Deleted 'description' field from document.");
    });
}
// Run the demo
demoFieldValueOps().catch(console.error);
//# sourceMappingURL=FieldValueExample.js.map