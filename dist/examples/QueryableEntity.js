"use strict";
// src/models/QueryableEntity.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryableEntity = void 0;
const firestoreModel_1 = require("../firestoreModel");
const firestoreService_1 = require("../firestoreService");
/**
 * ✅ Demonstrates a Firestore entity that can be queried
 * without a custom save() — we rely on the base create() and update().
 */
class QueryableEntity extends firestoreModel_1.FirestoreModel {
    constructor(data, id) {
        super(id);
        this.userId = data.userId;
        this.status = data.status;
        this.category = data.category;
        this.createdAt = data.createdAt;
    }
    /**
     * Required by FirestoreModel:
     * - Document path for this instance (e.g. "users/userId/items/itemId").
     */
    getDocPath() {
        if (!this.id) {
            throw new Error("Document ID not set. Cannot build doc path.");
        }
        return `users/${this.userId}/items/${this.id}`;
    }
    /**
     * Required by FirestoreModel:
     * - Collection path (e.g. "users/userId/items").
     */
    getColPath() {
        return `users/${this.userId}/items`;
    }
    /**
     * ✅ Finds items by status in this user’s collection.
     */
    static async findByStatus(userId, status) {
        const path = `users/${userId}/items`;
        return firestoreService_1.FirestoreService.queryCollection(QueryableEntity, path, {
            where: [{ field: "status", op: "==", value: status }],
        });
    }
    /**
     * ✅ Finds items by both status and category.
     */
    static async findByStatusAndCategory(userId, status, category) {
        const path = `users/${userId}/items`;
        return firestoreService_1.FirestoreService.queryCollection(QueryableEntity, path, {
            where: [
                { field: "status", op: "==", value: status },
                { field: "category", op: "==", value: category },
            ],
        });
    }
    /**
     * ✅ Finds recent 'active' items, optionally filtered by category,
     *    ordered by createdAt descending.
     */
    static async findRecentActiveItems(userId, category, maxResults = 10) {
        const path = `users/${userId}/items`;
        const queryOptions = {
            where: [
                { field: "status", op: "==", value: "active" },
                ...(category
                    ? [{ field: "category", op: "==", value: category }]
                    : []),
            ],
            orderBy: [{ field: "createdAt", direction: "desc" }],
            limit: maxResults,
        };
        return firestoreService_1.FirestoreService.queryCollection(QueryableEntity, path, queryOptions);
    }
}
exports.QueryableEntity = QueryableEntity;
