// src/models/FirestoreModel.ts

import FirestoreService from "./firestoreService";

export abstract class FirestoreModel {
  protected _id?: string; // ✅ Internal Firestore ID (set internally)

  constructor(id?: string) {
    this._id = id; // Optional, allowing Firestore to assign ID
  }

  get id(): string | undefined {
    return this._id;
  }

  /**
   * ✅ Returns the Firestore document path (must be implemented by subclasses).
   */
  abstract getDocPath(): string;

  /**
   * ✅ Returns the Firestore collection path (must be implemented by subclasses).
   */
  abstract getColPath(): string;

  /**
   * ✅ Cleans undefined values by converting them to `null` or removing them.
   */
  protected sanitizeData<T extends Record<string, unknown>>(data: T): T {
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    ) as T;
  }

  /**
   * ✅ Updates this document in Firestore.
   */
  async update(data: Partial<this>): Promise<void> {
    if (!this._id) throw new Error("Cannot update before saving to Firestore");

    Object.assign(this, data); // Apply changes to the instance

    await FirestoreService.updateDocument(
      this.getDocPath(),
      this.sanitizeData(this as unknown as Record<string, unknown>)
    );
  }

  /**
   * ✅ Deletes this document from Firestore.
   */
  async delete(): Promise<void> {
    if (!this._id) throw new Error("Cannot delete before saving to Firestore");
    await FirestoreService.deleteDocument(this.getDocPath());
  }

  /**
   * ✅ Assigns Firestore ID after retrieval.
   */
  protected _setId(id: string) {
    this._id = id;
  }

  withId(id: string) {
    this._id = id;
    return this;
  }

  /**
   * ✅ Fetches a document from Firestore and instantiates the model.
   */
  static async get<T extends FirestoreModel>(
    this: new (...args: any[]) => T,
    docPath: string
  ): Promise<T | null> {
    const docData = await FirestoreService.getDocument<{
      id: string;
      data: any;
    }>(docPath);

    if (!docData) return null;

    console.log(`📄 Retrieved from Firestore: ${docPath}`, docData);

    const instance = new this(docData.data) as T;
    instance._setId(docData.id);

    return instance;
  }

  /**
   * ✅ Creates and saves a new Firestore document, returning an instance.
   */
  static async create<T extends FirestoreModel>(
    this: new (...args: any[]) => T,
    data: Partial<T>
  ): Promise<T> {
    const instance = new this(data);

    const newId = await FirestoreService.addDocument(
      instance.getColPath(),
      instance
    );
    if (!newId) throw new Error("Failed to save to Firestore");
    instance._setId(newId);

    return instance;
  }
}
