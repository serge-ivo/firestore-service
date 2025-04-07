// src/models/ExampleEntity.ts

import { FirestoreModel } from "../firestoreModel";
// import { FirestoreService } from "../firestoreService"; // No longer needed

/**
 * ✅ Represents the shape of the Firestore document data.
 */
export type ExampleData = {
  id?: string; // Add optional id field
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  tags?: string[]; // Add optional tags field for the example
  // Note: ID is handled by FirestoreModel base class and converter, not explicitly defined here.
};

/**
 * ✅ ExampleEntity: Data representation + Path logic.
 * Persistence is handled by FirestoreService.
 */
export class ExampleEntity extends FirestoreModel {
  // Properties will be assigned by the base constructor via Object.assign
  // We declare them here for type safety.
  title!: string; // Add '!' to assert assignment by constructor
  description!: string;
  createdAt!: Date;
  updatedAt!: Date;
  owner!: string;

  // Constructor accepts data (potentially with id) and passes to super
  constructor(data: { id?: string } & Partial<ExampleData>) {
    super(data); // Pass the whole data object (including potential id) up

    // No need for manual assignment here if super() handles it via Object.assign
    // Ensure base class constructor logic is sufficient.
    // If defaults are needed for properties NOT in ExampleData, assign them here:
    // this.someOtherProp = data.someOtherProp ?? defaultValue;
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
      throw new Error("Cannot get document path: entity has no Firestore ID.");
    }
    return ExampleEntity.buildPath(this.id);
  }

  /**
   * ✅ For FirestoreModel's abstract method: collection path for this model.
   */
  getColPath(): string {
    return ExampleEntity.buildPath();
  }

  // Static getById method was already removed
}
