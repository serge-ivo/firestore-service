import { FirestoreModel } from "../firestoreModel";
export interface QueryableEntityData {
    userId: string;
    status: "active" | "inactive";
    category: string;
    createdAt: Date;
}
/**
 * ✅ Demonstrates a Firestore entity that can be queried
 * without a custom save() — we rely on the base create() and update().
 */
export declare class QueryableEntity extends FirestoreModel {
    userId: string;
    status: "active" | "inactive";
    category: string;
    createdAt: Date;
    constructor(data: QueryableEntityData, id?: string);
    /**
     * Required by FirestoreModel:
     * - Document path for this instance (e.g. "users/userId/items/itemId").
     */
    getDocPath(): string;
    /**
     * Required by FirestoreModel:
     * - Collection path (e.g. "users/userId/items").
     */
    getColPath(): string;
    /**
     * ✅ Finds items by status in this user’s collection.
     */
    static findByStatus(userId: string, status: "active" | "inactive"): Promise<QueryableEntity[]>;
    /**
     * ✅ Finds items by both status and category.
     */
    static findByStatusAndCategory(userId: string, status: "active" | "inactive", category: string): Promise<QueryableEntity[]>;
    /**
     * ✅ Finds recent 'active' items, optionally filtered by category,
     *    ordered by createdAt descending.
     */
    static findRecentActiveItems(userId: string, category?: string, maxResults?: number): Promise<QueryableEntity[]>;
}
