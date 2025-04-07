/**
 * FirestoreService - A wrapper around Firebase Firestore providing type-safe operations
 *
 * @example
 * // 1️⃣ Basic Setup
 * import { getFirestore } from 'firebase/firestore';
 * import { FirestoreService } from '@serge-ivo/firestore-client';
 *
 * // Initialize Firebase app first
 * const app = initializeApp(firebaseConfig);
 * const db = getFirestore(app);
 *
 * // Initialize FirestoreService
 * FirestoreService.initialize(db);
 *
 * @example
 * // 2️⃣ Using the Service
 * // After initialization, you can use any of the service methods
 * const doc = await FirestoreService.getDocument<User>('users/user123');
 *
 * @example
 * // 3️⃣ Common Error Cases
 * // ❌ Don't use before initialization
 * FirestoreService.getDocument('users/user123'); // Throws error
 *
 * // ❌ Don't initialize with invalid Firestore instance
 * FirestoreService.initialize(null); // Throws error
 *
 * // ✅ Correct usage
 * FirestoreService.initialize(db);
 * const result = await FirestoreService.getDocument('users/user123');
 */

// src/services/FirestoreService.ts
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  CollectionReference,
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

import FirestoreDataConverter from "./FirestoreDataConverter";
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

import { connectFirestoreEmulator } from "firebase/firestore";

export class FirestoreService {
  private static db: Firestore;
  private static isInitialized = false;

  private static validatePathBasic(path: string): void {
    if (!path) {
      throw new Error("Path cannot be empty");
    }
    if (path.startsWith("/") || path.endsWith("/")) {
      throw new Error("Path cannot start or end with '/'");
    }
  }

  private static validateCollectionPathSegments(path: string): void {
    this.validatePathBasic(path);
    const segments = path.split("/");
    if (segments.length % 2 !== 1) {
      throw new Error(
        "Collection path must have an odd number of segments (e.g., 'users' or 'users/123/posts')"
      );
    }
  }

  private static validateDocumentPathSegments(path: string): void {
    this.validatePathBasic(path);
    const segments = path.split("/");
    if (segments.length % 2 !== 0) {
      throw new Error(
        "Document path must have an even number of segments (e.g., 'users/123' or 'users/123/posts/456')"
      );
    }
    if (segments.length < 2) {
      // Ensure at least collection/doc
      throw new Error("Document path must have at least two segments.");
    }
  }

  // Update existing validateDocumentPath to use the new segment validator
  private static validateDocumentPath(path: string): void {
    this.validateDocumentPathSegments(path);
  }

  /**
   * Initialize Firestore using an existing Firebase app instance.
   * Note: You must initialize Firebase app yourself before calling this method.
   * @param db - An initialized Firestore instance
   * @throws Error if db is not provided or invalid
   */
  static initialize(db: Firestore) {
    // Only initialize if not already done
    if (this.isInitialized) {
      // Optional: Log that it's already initialized
      console.log("FirestoreService already initialized.");
      return;
    }

    if (
      !db ||
      typeof db !== "object" ||
      !("type" in db) ||
      db.type !== "firestore"
    ) {
      throw new Error("Firestore instance is required for initialization");
    }
    this.db = db;
    this.isInitialized = true;
    console.log("FirestoreService initialized successfully");
  }

  private static checkInitialized() {
    if (!this.isInitialized) {
      throw new Error(
        "FirestoreService has not been initialized. Call FirestoreService.initialize(db) first."
      );
    }
  }

  static connectEmulator(firestoreEmulatorPort: number) {
    connectFirestoreEmulator(
      FirestoreService.db,
      "localhost",
      firestoreEmulatorPort
    );
    console.log("🔥 Connected to Firestore Emulator");
  }

  private static doc<T>(path: string): DocumentReference<T> {
    this.checkInitialized();
    this.validateDocumentPath(path);
    return doc(this.db, path).withConverter(FirestoreDataConverter<T>());
  }

  private static collection<T>(path: string): CollectionReference<T> {
    this.checkInitialized();
    return collection(this.db, path).withConverter(FirestoreDataConverter<T>());
  }

  static async getDocument<T>(docPath: string): Promise<T | null> {
    RequestLimiter.logDocumentRequest(docPath);
    const docSnap = await getDoc(this.doc<T>(docPath));
    return docSnap.exists() ? docSnap.data() : null;
  }

  static async addDocument<T>(
    collectionPath: string,
    data: T
  ): Promise<string | undefined> {
    // Perform validation *first* before any other operations
    this.checkInitialized(); // Check initialization first is also good practice
    this.validateCollectionPathSegments(collectionPath);

    RequestLimiter.logGeneralRequest();
    const docRef = await addDoc(this.collection<T>(collectionPath), data);
    return docRef.id;
  }

  static async updateDocument(
    docPath: string,
    data: Record<string, any>
  ): Promise<void> {
    RequestLimiter.logGeneralRequest();
    await updateDoc(doc(this.db, docPath), data);
  }

  static async setDocument<T>(
    docPath: string,
    data: T,
    options: { merge?: boolean } = { merge: true }
  ): Promise<void> {
    RequestLimiter.logGeneralRequest();
    await setDoc(this.doc<T>(docPath), data, options);
  }

  static async deleteDocument(docPath: string): Promise<void> {
    RequestLimiter.logGeneralRequest();
    await deleteDoc(this.doc(docPath));
  }

  static async deleteCollection(collectionPath: string): Promise<void> {
    RequestLimiter.logGeneralRequest();
    const batch = writeBatch(this.db);
    const snapshot = await getDocs(this.collection(collectionPath));
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  static subscribeToDocument<T>(
    docPath: string,
    callback: (data: T | null) => void
  ): () => void {
    RequestLimiter.logSubscriptionRequest(docPath);
    const unsubscribe = onSnapshot(this.doc<T>(docPath), (docSnap) => {
      callback(docSnap.exists() ? docSnap.data() : null);
    });
    return unsubscribe;
  }

  static subscribeToCollection<T>(
    collectionPath: string,
    callback: (data: T[]) => void
  ): () => void {
    RequestLimiter.logSubscriptionRequest(collectionPath);
    const unsubscribe = onSnapshot(
      query(this.collection<T>(collectionPath)),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data());
        callback(data);
      }
    );
    return unsubscribe;
  }

  static subscribeToCollection2<T extends FirestoreModel>(
    model: new (data: any) => T, // ✅ Accepts a class constructor
    collectionPath: string,
    callback: (data: T[]) => void
  ): () => void {
    RequestLimiter.logSubscriptionRequest(collectionPath);

    const unsubscribe = onSnapshot(
      query(FirestoreService.collection<T>(collectionPath)),
      (snapshot) => {
        const data = snapshot.docs.map((doc) =>
          new model(doc.data()).withId(doc.id)
        ); // ✅ Instantiate correct class
        callback(data);
      }
    );

    return unsubscribe;
  }

  static async fetchCollection<T>(
    path: string,
    ...queryConstraints: QueryConstraint[]
  ): Promise<T[]> {
    RequestLimiter.logCollectionFetchRequest(path);
    const snapshot = await getDocs(
      queryConstraints.length > 0
        ? query(this.collection<T>(path), ...queryConstraints)
        : this.collection<T>(path)
    );
    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Queries a Firestore collection with flexible options such as `where` filters, `orderBy` clauses, and `limit` constraints.
   *
   * @template T - The generic type representing the structure of the documents in the collection.
   * @param {string} path - The Firestore collection path (e.g., "users", "jobs/applications").
   * @param {QueryOptions} [options] - Optional query constraints:
   *   - `where`: An array of conditions to filter documents. Each condition includes:
   *       - `field`: The field to filter on (e.g., "status", "age").
   *       - `op`: The comparison operator (e.g., "==", ">=", "<").
   *       - `value`: The value to compare against.
   *   - `orderBy`: An array of ordering criteria:
   *       - `field`: The field to sort by.
   *       - `direction`: Sort direction ("asc" for ascending or "desc" for descending, defaults to "asc").
   *   - `limit`: Limits the number of returned documents.
   *
   * @returns {Promise<T[]>} A promise that resolves to an array of documents of type `T`.
   *
   * @example
   * // 1️⃣ Basic Query Without Constraints
   * const users = await FirestoreService.queryCollection<User>('users');
   * console.log(users);
   *
   * @example
   * // 2️⃣ Query with WHERE Condition
   * const activeUsers = await FirestoreService.queryCollection<User>('users', {
   *   where: [{ field: 'status', op: '==', value: 'active' }]
   * });
   * console.log(activeUsers);
   *
   * @example
   * // 3️⃣ Query with ORDER BY and LIMIT
   * const recentJobs = await FirestoreService.queryCollection<Job>('jobs', {
   *   orderBy: [{ field: 'postedDate', direction: 'desc' }],
   *   limit: 5
   * });
   * console.log(recentJobs);
   *
   * @example
   * // 4️⃣ Combined WHERE, ORDER BY, and LIMIT Query
   * const topActiveUsers = await FirestoreService.queryCollection<User>('users', {
   *   where: [{ field: 'status', op: '==', value: 'active' }],
   *   orderBy: [{ field: 'signupDate', direction: 'asc' }],
   *   limit: 3
   * });
   * console.log(topActiveUsers);
   */
  static async queryCollection<T extends FirestoreModel>(
    _model: new (...args: any[]) => T,
    collectionPath: string,
    options: QueryOptions = {}
  ): Promise<T[]> {
    RequestLimiter.logGeneralRequest();
    this.checkInitialized();

    const colRef = collection(this.db, collectionPath);
    const constraints: QueryConstraint[] = [];

    // Apply where clauses
    if (options.where) {
      options.where.forEach((w) => {
        constraints.push(where(w.field, w.op, w.value));
      });
    }

    // Apply orderBy clauses
    if (options.orderBy) {
      options.orderBy.forEach((o) => {
        constraints.push(orderBy(o.field, o.direction));
      });
    }

    // Apply limit
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    // Apply startAfter for pagination
    if (options.startAfter) {
      // If startAfter is a FirestoreModel instance, get its snapshot reference if needed
      // Firestore SDK v9+ can often use the document data directly if sorted by __name__
      // or the specific fields used in orderBy.
      // Passing the model instance *might* work if the converter handles it,
      // but using the underlying ID or field values is safer if not relying on __name__.
      // For simplicity here, we'll assume direct use or that the converter handles it.
      // A more robust implementation might require getting the DocumentSnapshot.
      constraints.push(startAfter(options.startAfter));
    }

    // Apply endBefore for pagination
    if (options.endBefore) {
      constraints.push(endBefore(options.endBefore));
    }

    const q = query(colRef, ...constraints).withConverter(
      FirestoreDataConverter<T>()
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  }

  static getFieldValue() {
    return { arrayUnion, arrayRemove };
  }

  static getTimestamp() {
    return Timestamp.now();
  }

  static deleteField() {
    return deleteField();
  }

  /**
   * Returns a new Firestore WriteBatch.
   */
  static getBatch(): WriteBatch {
    RequestLimiter.logGeneralRequest();
    return writeBatch(this.db);
  }

  /**
   * Helper for batch.update()
   */
  static updateInBatch(
    batch: WriteBatch,
    docPath: string,
    data: { [key: string]: FieldValue | Partial<unknown> | undefined }
  ): void {
    const docRef = doc(this.db, docPath);
    batch.update(docRef, data);
  }

  /**
   * Helper for batch.set()
   * Overload with optional merge
   */
  static setInBatch<T>(
    batch: WriteBatch,
    docPath: string,
    data: T,
    options: SetOptions = {}
  ): void {
    const docRef = doc(this.db, docPath).withConverter(
      FirestoreDataConverter<T>()
    );
    batch.set(docRef, data, options);
  }

  /**
   * Helper for batch.delete()
   */
  static deleteInBatch(batch: WriteBatch, docPath: string): void {
    const docRef = doc(this.db, docPath);
    batch.delete(docRef);
  }

  static add(collectionPath: string, data: any): Promise<string | undefined> {
    return addDoc(this.collection<any>(collectionPath), data).then(
      (docRef) => docRef.id
    );
  }
}

export default FirestoreService;
