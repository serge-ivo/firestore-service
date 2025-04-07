/**
 * FirestoreService - A wrapper around Firebase Firestore providing type-safe operations.
 * This service needs to be instantiated with a Firestore database instance.
 *
 * @example
 * // 1️⃣ Basic Setup
 * import { initializeApp } from 'firebase/app';
 * import { getFirestore } from 'firebase/firestore';
 * import { FirestoreService } from '@serge-ivo/firestore-client';
 *
 * // Initialize Firebase app first
 * const app = initializeApp(firebaseConfig);
 * const db = getFirestore(app);
 *
 * // Create an instance of FirestoreService
 * const firestoreService = new FirestoreService(db);
 *
 * @example
 * // 2️⃣ Using the Service Instance
 * // Use the created instance to call methods
 * const user = await firestoreService.getDocument<User>('users/user123');
 *
 * @example
 * // 3️⃣ Common Error Cases
 * // ❌ Don't instantiate without a valid Firestore instance
 * // const invalidService = new FirestoreService(null); // Throws error
 *
 * // ✅ Correct usage:
 * const firestoreService = new FirestoreService(db);
 * const result = await firestoreService.getDocument('users/user123');
 */

// src/services/FirestoreService.ts
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  CollectionReference,
  connectFirestoreEmulator,
  deleteDoc,
  deleteField,
  doc,
  DocumentReference,
  endBefore,
  FieldValue,
  Firestore,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  setDoc,
  SetOptions,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  WriteBatch,
  writeBatch,
} from "firebase/firestore";

// Correctly import the local factory function
import createFirestoreDataConverter from "./FirestoreDataConverter";
import { FirestoreModel } from "./firestoreModel";
import RequestLimiter from "./RequestLimiter";

export type FilterOperator =
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "array-contains"
  | "in"
  | "array-contains-any"
  | "not-in";

interface QueryOptions {
  where?: Array<{ field: string; op: FilterOperator; value: any }>;
  orderBy?: Array<{ field: string; direction?: "asc" | "desc" }>;
  limit?: number;
  startAfter?: any;
  endBefore?: any;
}

export class FirestoreService {
  // Store db as a private readonly instance variable
  private readonly db: Firestore;

  /**
   * Creates an instance of FirestoreService.
   * @param {Firestore} db - An initialized Firestore database instance.
   * @throws Error if db is not provided or invalid.
   */
  constructor(db: Firestore) {
    if (
      !db ||
      typeof db !== "object" ||
      !("type" in db) ||
      db.type !== "firestore"
    ) {
      throw new Error(
        "Valid Firestore instance is required for FirestoreService constructor"
      );
    }
    this.db = db;
    console.log("FirestoreService instance created successfully.");
  }

  // --- Path Validation Methods (can remain private static or become private instance methods) ---
  // Let's make them instance methods for consistency, though static is also fine.
  private validatePathBasic(path: string): void {
    if (!path) {
      throw new Error("Path cannot be empty");
    }
    if (path.startsWith("/") || path.endsWith("/")) {
      throw new Error("Path cannot start or end with '/'");
    }
  }

  private validateCollectionPathSegments(path: string): void {
    this.validatePathBasic(path);
    const segments = path.split("/");
    if (segments.length % 2 !== 1) {
      throw new Error(
        "Collection path must have an odd number of segments (e.g., 'users' or 'users/123/posts')"
      );
    }
  }

  private validateDocumentPathSegments(path: string): void {
    this.validatePathBasic(path);
    const segments = path.split("/");
    if (segments.length % 2 !== 0) {
      throw new Error(
        "Document path must have an even number of segments (e.g., 'users/123' or 'users/123/posts/456')"
      );
    }
    if (segments.length < 2) {
      throw new Error("Document path must have at least two segments.");
    }
  }

  private validateDocumentPath(path: string): void {
    this.validateDocumentPathSegments(path);
  }
  // --- End Path Validation ---

  // --- Instance Methods (previously static, now use this.db) ---

  /**
   * Connects this service instance to the Firestore emulator.
   * Note: This should ideally be done once globally if possible.
   * @param {number} firestoreEmulatorPort - The port the emulator is running on.
   */
  connectEmulator(firestoreEmulatorPort: number): void {
    // Note: Emulator connection is typically done once globally,
    // but providing it as an instance method allows flexibility if needed.
    connectFirestoreEmulator(this.db, "localhost", firestoreEmulatorPort);
    console.log("🔥 Connected instance to Firestore Emulator");
  }

  // Private helpers now use this.db and are instance methods
  private docRef<T>(path: string): DocumentReference<T> {
    this.validateDocumentPath(path);
    return doc(this.db, path).withConverter(createFirestoreDataConverter<T>());
  }

  private colRef<T>(path: string): CollectionReference<T> {
    // Use the imported factory function
    return collection(this.db, path).withConverter(
      createFirestoreDataConverter<T>()
    );
  }

  // Public API methods are now instance methods
  /**
   * Retrieves a single document from Firestore by its full path.
   * @template T The expected type of the document data.
   * @param {string} docPath The full path to the document (e.g., 'users/userId').
   * @returns {Promise<T | null>} A promise resolving to the document data or null if not found.
   */
  async getDocument<T>(docPath: string): Promise<T | null> {
    RequestLimiter.logDocumentRequest(docPath);
    const docSnap = await getDoc(this.docRef<T>(docPath));
    return docSnap.exists() ? docSnap.data() : null;
  }

  /**
   * Adds a new document to a specified collection.
   * @template T The type of the data being added.
   * @param {string} collectionPath The path to the collection (e.g., 'posts', 'users/userId/tasks').
   * @param {T} data The data for the new document.
   * @returns {Promise<string | undefined>} A promise resolving to the new document's ID, or undefined on failure.
   */
  async addDocument<T>(
    collectionPath: string,
    data: T
  ): Promise<string | undefined> {
    this.validateCollectionPathSegments(collectionPath); // Validate path first
    RequestLimiter.logGeneralRequest();
    const docRef = await addDoc(this.colRef<T>(collectionPath), data);
    return docRef.id;
  }

  /**
   * Updates specific fields of an existing document.
   * @param {string} docPath The full path to the document.
   * @param {Record<string, any>} data An object containing the fields to update.
   * @returns {Promise<void>}
   */
  async updateDocument(
    docPath: string,
    data: Record<string, any>
  ): Promise<void> {
    this.validateDocumentPath(docPath); // Ensure doc path is valid before update
    RequestLimiter.logGeneralRequest();
    // Use the raw doc ref without converter for partial updates
    await updateDoc(doc(this.db, docPath), data);
  }

  /**
   * Creates or overwrites a document completely.
   * @template T The type of the data being set.
   * @param {string} docPath The full path to the document.
   * @param {T} data The data for the document.
   * @param {object} [options] Optional settings. `merge: true` merges data instead of overwriting.
   * @returns {Promise<void>}
   */
  async setDocument<T>(
    docPath: string,
    data: T,
    options: { merge?: boolean } = { merge: true }
  ): Promise<void> {
    this.validateDocumentPath(docPath);
    RequestLimiter.logGeneralRequest();
    await setDoc(this.docRef<T>(docPath), data, options);
  }

  /**
   * Deletes a document from Firestore.
   * @param {string} docPath The full path to the document.
   * @returns {Promise<void>}
   */
  async deleteDocument(docPath: string): Promise<void> {
    this.validateDocumentPath(docPath);
    RequestLimiter.logGeneralRequest();
    // Get the raw doc ref for deletion
    await deleteDoc(doc(this.db, docPath));
  }

  /**
   * Deletes all documents within a specified collection or subcollection.
   * Use with caution, especially on large collections.
   * @param {string} collectionPath The path to the collection (e.g., 'users', 'users/userId/posts').
   * @returns {Promise<void>}
   */
  async deleteCollection(collectionPath: string): Promise<void> {
    this.validateCollectionPathSegments(collectionPath);
    RequestLimiter.logGeneralRequest();
    const batch = writeBatch(this.db);
    // Use colRef without converter for deletion query
    const snapshot = await getDocs(collection(this.db, collectionPath));
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  /**
   * Subscribes to real-time updates for a single document.
   * @template T The expected type of the document data.
   * @param {string} docPath The full path to the document.
   * @param {(data: T | null) => void} callback The function to call with document data (or null) on updates.
   * @returns {() => void} A function to unsubscribe from updates.
   */
  subscribeToDocument<T>(
    docPath: string,
    callback: (data: T | null) => void
  ): () => void {
    this.validateDocumentPath(docPath);
    RequestLimiter.logSubscriptionRequest(docPath);
    const unsubscribe = onSnapshot(this.docRef<T>(docPath), (docSnap) => {
      callback(docSnap.exists() ? docSnap.data() : null);
    });
    return unsubscribe;
  }

  /**
   * Subscribes to real-time updates for a collection.
   * @template T The expected type of the documents in the collection.
   * @param {string} collectionPath The path to the collection.
   * @param {(data: T[]) => void} callback The function to call with an array of document data on updates.
   * @returns {() => void} A function to unsubscribe from updates.
   */
  subscribeToCollection<T>(
    collectionPath: string,
    callback: (data: T[]) => void
  ): () => void {
    this.validateCollectionPathSegments(collectionPath);
    RequestLimiter.logSubscriptionRequest(collectionPath);
    const unsubscribe = onSnapshot(
      query(this.colRef<T>(collectionPath)),
      (snapshot) => {
        const data = snapshot.docs.map((d) => d.data());
        callback(data);
      }
    );
    return unsubscribe;
  }

  /**
   * Subscribes to real-time updates for a collection, automatically instantiating FirestoreModel subclasses.
   * @template T A type extending FirestoreModel.
   * @param {new (...args: any[]) => T} model The constructor of the FirestoreModel subclass.
   * @param {string} collectionPath The path to the collection.
   * @param {(data: T[]) => void} callback The function to call with an array of instantiated models on updates.
   * @returns {() => void} A function to unsubscribe from updates.
   */
  subscribeToCollection2<T extends FirestoreModel>(
    model: new (...args: any[]) => T,
    collectionPath: string,
    callback: (data: T[]) => void
  ): () => void {
    this.validateCollectionPathSegments(collectionPath);
    RequestLimiter.logSubscriptionRequest(collectionPath);

    // Use the factory function to get the converter
    const converter = createFirestoreDataConverter<any>(); // Use <any> or a base type for raw data

    const unsubscribe = onSnapshot(
      query(this.colRef<any>(collectionPath)).withConverter(converter),
      (snapshot) => {
        // Map the raw data, then instantiate the specific model class
        const data = snapshot.docs.map((doc) => {
          const rawData = doc.data(); // Get data converted by the converter
          // Manually instantiate the correct model subclass
          return new model(rawData, doc.id);
        });
        callback(data);
      }
    );
    return unsubscribe;
  }

  /**
   * Fetches documents from a collection, optionally applying query constraints.
   * @template T The expected type of the documents.
   * @param {string} path The path to the collection.
   * @param {...QueryConstraint} queryConstraints Optional Firestore query constraints (where, orderBy, limit, etc.).
   * @returns {Promise<T[]>} A promise resolving to an array of document data.
   */
  async fetchCollection<T>(
    path: string,
    ...queryConstraints: QueryConstraint[]
  ): Promise<T[]> {
    this.validateCollectionPathSegments(path);
    RequestLimiter.logCollectionFetchRequest(path);
    const snapshot = await getDocs(
      queryConstraints.length > 0
        ? query(this.colRef<T>(path), ...queryConstraints)
        : this.colRef<T>(path)
    );
    return snapshot.docs.map((d) => d.data());
  }

  /**
   * Queries a Firestore collection using a structured options object.
   * @template T The expected type of the document data.
   * @param {string} collectionPath The path to the collection.
   * @param {QueryOptions} [options={}] Optional query constraints (where, orderBy, limit, startAfter, endBefore).
   * @returns {Promise<T[]>} A promise resolving to an array of document data.
   */
  async queryCollection<T>(
    collectionPath: string,
    options: QueryOptions = {}
  ): Promise<T[]> {
    this.validateCollectionPathSegments(collectionPath);
    RequestLimiter.logGeneralRequest();

    const colReference = this.colRef<T>(collectionPath);
    const constraints: QueryConstraint[] = [];

    if (options.where) {
      options.where.forEach((w) => {
        constraints.push(where(w.field, w.op, w.value));
      });
    }
    if (options.orderBy) {
      options.orderBy.forEach((o) => {
        constraints.push(orderBy(o.field, o.direction));
      });
    }
    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter));
    }
    if (options.endBefore) {
      constraints.push(endBefore(options.endBefore));
    }
    // Apply limit LAST as recommended by Firestore docs
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    const q = query(colReference, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data());
  }

  // --- Batch Operations ---
  /**
   * Returns a new Firestore WriteBatch associated with this service instance's database.
   * @returns {WriteBatch}
   */
  getBatch(): WriteBatch {
    RequestLimiter.logGeneralRequest();
    return writeBatch(this.db);
  }

  /**
   * Updates specific fields of multiple documents in a batch.
   * @param {WriteBatch} batch The Firestore WriteBatch to update.
   * @param {string} docPath The full path to the document.
   * @param {object} data An object containing the fields to update.
   */
  updateInBatch(
    batch: WriteBatch,
    docPath: string,
    data: { [key: string]: FieldValue | Partial<unknown> | undefined }
  ): void {
    this.validateDocumentPath(docPath);
    const docRef = doc(this.db, docPath); // Use raw doc ref
    batch.update(docRef, data);
  }

  /**
   * Sets a document in a batch.
   * @template T The type of the data being set.
   * @param {WriteBatch} batch The Firestore WriteBatch to set.
   * @param {string} docPath The full path to the document.
   * @param {T} data The data for the document.
   * @param {SetOptions} [options] Optional settings. `merge: true` merges data instead of overwriting.
   */
  setInBatch<T>(
    batch: WriteBatch,
    docPath: string,
    data: T,
    options: SetOptions = {}
  ): void {
    this.validateDocumentPath(docPath);
    // Use docRef with converter for type safety during set
    const docRef = this.docRef<T>(docPath);
    batch.set(docRef, data, options);
  }

  /**
   * Deletes a document in a batch.
   * @param {WriteBatch} batch The Firestore WriteBatch to delete.
   * @param {string} docPath The full path to the document.
   */
  deleteInBatch(batch: WriteBatch, docPath: string): void {
    this.validateDocumentPath(docPath);
    const docRef = doc(this.db, docPath); // Use raw doc ref
    batch.delete(docRef);
  }

  // --- Static Utility Methods (Do not depend on instance state) ---
  /**
   * Provides access to Firestore FieldValue constants (e.g., arrayUnion, arrayRemove).
   */
  static getFieldValue() {
    return { arrayUnion, arrayRemove };
  }

  /**
   * Returns a Firestore Timestamp for the current time.
   */
  static getTimestamp() {
    return Timestamp.now();
  }

  /**
   * Returns a special value used to delete a field during an update.
   */
  static deleteField() {
    return deleteField();
  }
}
