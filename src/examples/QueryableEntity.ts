// src/models/QueryableEntity.ts

import { FirestoreModel } from "../firestoreModel";
// import { FirestoreService } from "../firestoreService"; // No longer needed
import type { FilterOperator } from "../firestoreService"; // Keep type import for external use if needed

export interface QueryableEntityData {
  userId: string;
  status: "active" | "inactive";
  category: string;
  createdAt: Date;
  // Note: ID is handled by FirestoreModel base class and converter
}

/**
 * ✅ QueryableEntity: Data representation + Path logic.
 * Persistence (including querying) is handled by FirestoreService.
 */
export class QueryableEntity extends FirestoreModel {
  // Declare properties for type safety; assigned by base constructor
  userId!: string;
  status!: "active" | "inactive";
  category!: string;
  createdAt!: Date;

  // Update constructor to accept data object (with optional id)
  constructor(data: { id?: string } & QueryableEntityData) {
    super(data); // Pass the whole data object up
    // Base constructor assigns properties via Object.assign
  }

  /**
   * Required by FirestoreModel:
   * - Document path for this instance (e.g. "users/userId/items/itemId").
   */
  getDocPath(): string {
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
  getColPath(): string {
    // Ensure userId is assigned before calling this
    if (!this.userId) {
      throw new Error("User ID not set. Cannot build collection path.");
    }
    return `users/${this.userId}/items`;
  }

  // Static find... methods were already removed
}
