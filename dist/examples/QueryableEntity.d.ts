import { FirestoreModel } from "../firestoreModel";
export interface QueryableEntityData {
    userId: string;
    status: "active" | "inactive";
    category: string;
    createdAt: Date;
}
/**
 * ✅ QueryableEntity: Data representation + Path logic.
 * Persistence (including querying) is handled by FirestoreService.
 */
export declare class QueryableEntity extends FirestoreModel {
    userId: string;
    status: "active" | "inactive";
    category: string;
    createdAt: Date;
    constructor(data: {
        id?: string;
    } & QueryableEntityData);
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
}
