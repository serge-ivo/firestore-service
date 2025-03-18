// src/models/QueryableEntity.ts

import { FirestoreModel } from "../firestoreModel";
import { FirestoreService } from "../firestoreService";
import type { FilterOperator } from "../firestoreService";

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
export class QueryableEntity extends FirestoreModel {
  userId: string;
  status: "active" | "inactive";
  category: string;
  createdAt: Date;

  constructor(data: QueryableEntityData, id?: string) {
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
  getDocPath(): string {
    if (!this.id) {
      throw new Error("Document ID not set. Cannot build doc path.");
    }
    return `users/${this.userId}/items/${this.id}`;
  }

  /**
   * Required by FirestoreModel:
   * - Collection path (e.g. "users/userId/items").
   */
  getColPath(): string {
    return `users/${this.userId}/items`;
  }

  /**
   * ✅ Finds items by status in this user’s collection.
   */
  static async findByStatus(
    userId: string,
    status: "active" | "inactive"
  ): Promise<QueryableEntity[]> {
    const path = `users/${userId}/items`;
    return FirestoreService.queryCollection<QueryableEntity>(
      QueryableEntity,
      path,
      {
        where: [{ field: "status", op: "==" as FilterOperator, value: status }],
      }
    );
  }

  /**
   * ✅ Finds items by both status and category.
   */
  static async findByStatusAndCategory(
    userId: string,
    status: "active" | "inactive",
    category: string
  ): Promise<QueryableEntity[]> {
    const path = `users/${userId}/items`;
    return FirestoreService.queryCollection<QueryableEntity>(
      QueryableEntity,
      path,
      {
        where: [
          { field: "status", op: "==" as FilterOperator, value: status },
          { field: "category", op: "==" as FilterOperator, value: category },
        ],
      }
    );
  }

  /**
   * ✅ Finds recent 'active' items, optionally filtered by category,
   *    ordered by createdAt descending.
   */
  static async findRecentActiveItems(
    userId: string,
    category?: string,
    maxResults: number = 10
  ): Promise<QueryableEntity[]> {
    const path = `users/${userId}/items`;

    const queryOptions = {
      where: [
        { field: "status", op: "==" as FilterOperator, value: "active" },
        ...(category
          ? [{ field: "category", op: "==" as FilterOperator, value: category }]
          : []),
      ],
      orderBy: [{ field: "createdAt", direction: "desc" as const }],
      limit: maxResults,
    };

    return FirestoreService.queryCollection<QueryableEntity>(
      QueryableEntity,
      path,
      queryOptions
    );
  }
}
