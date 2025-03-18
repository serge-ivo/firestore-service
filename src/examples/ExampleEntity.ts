// src/models/ExampleEntity.ts

import { FirestoreModel } from "../firestoreModel";
import FirestoreService from "../firestoreService";

/**
 * ✅ Represents the shape of the Firestore document data.
 */
export type ExampleData = {
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
};

/**
 * ✅ ExampleEntity extends FirestoreModel, gaining 'update', 'delete', etc.
 */
export class ExampleEntity extends FirestoreModel {
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  owner: string;

  constructor(data: Partial<ExampleData> = {}, id?: string) {
    super(id);

    // Initialize fields safely (handle partial data)
    this.title = data.title ?? "";
    this.description = data.description ?? "";
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
    this.owner = data.owner ?? "";
  }

  /**
   * ✅ Build Firestore path. If 'id' is provided, returns document path; else collection path.
   */
  static buildPath(id?: string): string {
    return id ? `examples/${id}` : `examples`;
  }

  /**
   * ✅ For FirestoreModel's abstract method: document path for this instance.
   */
  getDocPath(): string {
    if (!this.id) {
      throw new Error(
        "Cannot get document path: entity has no Firestore ID yet."
      );
    }
    return ExampleEntity.buildPath(this.id);
  }

  /**
   * ✅ For FirestoreModel's abstract method: collection path for this model.
   */
  getColPath(): string {
    return ExampleEntity.buildPath();
  }

  /**
   * ✅ Retrieve an ExampleEntity by ID directly (alternative to FirestoreModel.get()).
   */
  static async getById(id: string): Promise<ExampleEntity | null> {
    const docData = await FirestoreService.getDocument<ExampleData>(
      ExampleEntity.buildPath(id)
    );
    return docData ? new ExampleEntity(docData, id) : null;
  }
}
