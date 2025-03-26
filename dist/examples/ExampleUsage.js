"use strict";
// ExampleUsage.ts
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
const firestore_1 = require("firebase/firestore");
(function runDemo() {
    return __awaiter(this, void 0, void 0, function* () {
        // 1️⃣ Initialize Firebase app (only once in your app's lifecycle)
        const app = (0, app_1.initializeApp)({
            apiKey: "fake-api-key", // Replace with real config in production
            authDomain: "your-app.firebaseapp.com",
            projectId: "your-app",
            // etc.
        });
        // 2️⃣ Initialize Firestore using the Firebase app
        const db = (0, firestore_1.initializeFirestore)(app, {
            localCache: (0, firestore_1.persistentLocalCache)({
                tabManager: (0, firestore_1.persistentMultipleTabManager)(),
            }),
        });
        firestoreService_1.default.initialize(db);
        // 3️⃣ (Optional) Connect to Firestore emulator for local dev
        // FirestoreService.connectEmulator(8080);
        // 4️⃣ Create a new ExampleEntity
        const newEntity = yield ExampleEntity_1.ExampleEntity.create({
            title: "Hello World",
            description: "A brand new entity",
            createdAt: new Date(),
            updatedAt: new Date(),
            owner: "user123",
        });
        console.log("Created entity:", newEntity);
        console.log("Assigned Firestore ID:", newEntity.id);
        // 5️⃣ Fetch it by ID (two approaches)
        const fetchedEntity = yield ExampleEntity_1.ExampleEntity.getById(newEntity.id);
        console.log("Fetched with getById:", fetchedEntity);
        // or using the static `get` from FirestoreModel (if you prefer doc paths)
        const docPath = ExampleEntity_1.ExampleEntity.buildPath(newEntity.id);
        const fetchedViaModel = yield ExampleEntity_1.ExampleEntity.get(docPath);
        console.log("Fetched via FirestoreModel static get:", fetchedViaModel);
        // 6️⃣ Update the entity (notice it already has an ID)
        if (fetchedEntity) {
            yield fetchedEntity.update({
                description: "Updated description with update()",
                updatedAt: new Date(),
            });
            console.log("Updated entity:", fetchedEntity);
        }
        // 7️⃣ (Optional) Demonstrate query or fetchCollection
        // If you want to fetch a list of ExampleEntities (e.g., all documents in the "examples" collection),
        // you'd typically do something like:
        const allExamples = yield firestoreService_1.default.fetchCollection("examples");
        console.log("All example docs (raw data):", allExamples);
        // Or if you have a method on ExampleEntity to fetch multiple,
        // you might do something like:
        // static async getAll(): Promise<ExampleEntity[]> {
        //   const docs = await FirestoreService.fetchCollection<ExampleData>("examples");
        //   return docs.map(d => new ExampleEntity(d));
        // }
        // 8️⃣ Delete if desired
        // if (fetchedEntity) {
        //   await fetchedEntity.delete();
        //   console.log("Deleted entity:", fetchedEntity.id);
        // }
    });
})();
//# sourceMappingURL=ExampleUsage.js.map