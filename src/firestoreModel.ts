// src/models/FirestoreModel.ts

// import { FirestoreService } from "./firestoreService"; // No longer needed here

export abstract class FirestoreModel {
  readonly id?: string; // Make ID readonly and public for easier access

  // Constructor no longer needs FirestoreService
  // Accepts data object containing properties and potentially an ID
  constructor(data: { id?: string } & Record<string, any>) {
    // Assign properties from data, including the ID if present
    Object.assign(this, data);
    // Ensure id is directly assigned if it exists in data, potentially overwriting if Object.assign didn't handle the getter/setter correctly initially.
    // It's cleaner to just rely on Object.assign if the target properties are simple.
    // We make `id` readonly, so it can only be set here.
    if ("id" in data && data.id !== undefined) {
      this.id = data.id;
    } else {
      // If data didn't contain an id (e.g., initial creation before saving),
      // this.id remains undefined as initialized by the property declaration.
    }
  }

  /**
   * ✅ Returns the Firestore document path (must be implemented by subclasses).
   * Requires the instance to have an ID.
   */
  abstract getDocPath(): string;

  /**
   * ✅ Returns the Firestore collection path (must be implemented by subclasses).
   */
  abstract getColPath(): string;

  // REMOVE sanitizeData - This was primarily for the update method.
  // Data sanitization (if needed) should happen before calling firestoreService methods.
  /*
  protected sanitizeData<T extends Record<string, unknown>>(data: T): T {
    ...
  }
  */

  // REMOVE update method
  /*
  async update(data: Partial<this>): Promise<void> {
    ...
  }
  */

  // REMOVE delete method
  /*
  async delete(): Promise<void> {
    ...
  }
  */

  // REMOVE _setId method - ID is now set via constructor
  /*
  protected _setId(id: string) {
    ...
  }
  */

  // REMOVE withId method - ID is now set via constructor
  /*
  withId(id: string): this {
    ...
  }
  */

  // Static methods were already removed
}
