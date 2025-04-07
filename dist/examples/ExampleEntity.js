"use strict";
// src/models/ExampleEntity.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleEntity = void 0;
const firestoreModel_1 = require("../firestoreModel");
/**
 * ✅ ExampleEntity: Data representation + Path logic.
 * Persistence is handled by FirestoreService.
 */
class ExampleEntity extends firestoreModel_1.FirestoreModel {
    // Constructor accepts data (potentially with id) and passes to super
    constructor(data) {
        super(data); // Pass the whole data object (including potential id) up
        // No need for manual assignment here if super() handles it via Object.assign
        // Ensure base class constructor logic is sufficient.
        // If defaults are needed for properties NOT in ExampleData, assign them here:
        // this.someOtherProp = data.someOtherProp ?? defaultValue;
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
            throw new Error("Cannot get document path: entity has no Firestore ID.");
        }
        return ExampleEntity.buildPath(this.id);
    }
    /**
     * ✅ For FirestoreModel's abstract method: collection path for this model.
     */
    getColPath() {
        return ExampleEntity.buildPath();
    }
}
exports.ExampleEntity = ExampleEntity;
