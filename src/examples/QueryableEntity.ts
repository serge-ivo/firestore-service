import { FirestoreModel } from "../firestoreModel";
import { FirestoreService } from "../firestoreService";
import type { FilterOperator } from "../firestoreService";

export interface QueryableEntityData {
  userId: string;
  status: "active" | "inactive";
  category: string;
  createdAt: Date;
}

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

  getDocPath(): string {
    if (!this.id) throw new Error("Document ID not set");
    return `users/${this.userId}/items/${this.id}`;
  }

  getColPath(): string {
    return `users/${this.userId}/items`;
  }

  async save(): Promise<void> {
    if (this.id) {
      await FirestoreService.updateDocument(this.getDocPath(), this);
    } else {
      const newId = await FirestoreService.addDocument(this.getColPath(), this);
      if (newId) {
        this._setId(newId);
      }
    }
  }

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
