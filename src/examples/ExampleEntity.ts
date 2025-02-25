import { FirestoreModel } from "../firestoreModel";
import FirestoreService from "../firestoreService";

/**
 * ✅ Represents a Firestore document entity.
 */
export type ExampleData = {
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
};

export class ExampleEntity extends FirestoreModel {
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  owner: string;

  constructor(data: ExampleData, id?: string) {
    super(id ?? ""); // Ensure Firestore ID is handled properly
    this.title = data.title;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.owner = data.owner;
  }

  /**
   * ✅ Constructs Firestore collection/document paths.
   */
  static buildPath(entityId?: string): string {
    return entityId ? `examples/${entityId}` : `examples`;
  }

  getDocPath(): string {
    if (!this.id)
      throw new Error("Cannot get document path before saving to Firestore");
    return ExampleEntity.buildPath(this.id);
  }

  getColPath(): string {
    return ExampleEntity.buildPath();
  }

  /**
   * ✅ Fetches an ExampleEntity by ID from Firestore.
   */
  static async getById(id: string): Promise<ExampleEntity | null> {
    const docData = await FirestoreService.getDocument<ExampleData>(
      ExampleEntity.buildPath(id)
    );
    return docData ? new ExampleEntity(docData, id) : null;
  }

  /**
   * ✅ Saves or updates this entity in Firestore.
   */
  async save(): Promise<ExampleEntity> {
    if (!this.id) {
      const newId = await FirestoreService.addDocument<ExampleData>(
        this.getColPath(),
        {
          title: this.title,
          description: this.description,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
          owner: this.owner,
        }
      );

      if (!newId) throw new Error("Failed to save ExampleEntity");
      this._setId(newId);
    } else {
      await FirestoreService.updateDocument(this.getDocPath(), {
        title: this.title,
        description: this.description,
        updatedAt: new Date(),
      });
    }
    return this;
  }
}
