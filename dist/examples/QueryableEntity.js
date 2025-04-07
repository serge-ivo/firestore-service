"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryableEntity = void 0;
const firestoreModel_1 = require("../firestoreModel");
/**
 * ✅ QueryableEntity: Data representation + Path logic.
 * Persistence (including querying) is handled by FirestoreService.
 */
class QueryableEntity extends firestoreModel_1.FirestoreModel {
    // Update constructor to accept data object (with optional id)
    constructor(data) {
        super(data); // Pass the whole data object up
        // Base constructor assigns properties via Object.assign
    }
    /**
     * Required by FirestoreModel:
     * - Document path for this instance (e.g. "users/userId/items/itemId").
     */
    getDocPath() {
        if (!this.id) {
            throw new Error("Document ID not set. Cannot build doc path.");
        }
        // Ensure userId is assigned before calling this
        if (!this.userId) {
            throw new Error("User ID not set. Cannot build doc path.");
        }
        return `users/${this.userId}/items/${this.id}`;
    }
    /**
     * Required by FirestoreModel:
     * - Collection path (e.g. "users/userId/items").
     */
    getColPath() {
        // Ensure userId is assigned before calling this
        if (!this.userId) {
            throw new Error("User ID not set. Cannot build collection path.");
        }
        return `users/${this.userId}/items`;
    }
}
exports.QueryableEntity = QueryableEntity;
