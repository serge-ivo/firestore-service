"use strict";
// src/models/ExampleEntity.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleEntity = void 0;
const firestoreModel_1 = require("../firestoreModel");
const firestoreService_1 = __importDefault(require("../firestoreService"));
/**
 * ✅ ExampleEntity extends FirestoreModel, gaining 'update', 'delete', etc.
 */
class ExampleEntity extends firestoreModel_1.FirestoreModel {
    constructor(data = {}, id) {
        var _a, _b, _c, _d, _e;
        super(id);
        // Initialize fields safely (handle partial data)
        this.title = (_a = data.title) !== null && _a !== void 0 ? _a : "";
        this.description = (_b = data.description) !== null && _b !== void 0 ? _b : "";
        this.createdAt = (_c = data.createdAt) !== null && _c !== void 0 ? _c : new Date();
        this.updatedAt = (_d = data.updatedAt) !== null && _d !== void 0 ? _d : new Date();
        this.owner = (_e = data.owner) !== null && _e !== void 0 ? _e : "";
    }
    /**
     * ✅ Build Firestore path. If 'id' is provided, returns document path; else collection path.
     */
    static buildPath(id) {
        return id ? `examples/${id}` : `examples`;
    }
    /**
     * ✅ For FirestoreModel's abstract method: document path for this instance.
     */
    getDocPath() {
        if (!this.id) {
            throw new Error("Cannot get document path: entity has no Firestore ID yet.");
        }
        return ExampleEntity.buildPath(this.id);
    }
    /**
     * ✅ For FirestoreModel's abstract method: collection path for this model.
     */
    getColPath() {
        return ExampleEntity.buildPath();
    }
    /**
     * ✅ Retrieve an ExampleEntity by ID directly (alternative to FirestoreModel.get()).
     */
    static async getById(id) {
        const docData = await firestoreService_1.default.getDocument(ExampleEntity.buildPath(id));
        return docData ? new ExampleEntity(docData, id) : null;
    }
}
exports.ExampleEntity = ExampleEntity;
