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
import { FirebaseOptions } from "firebase/app";
import { arrayRemove, arrayUnion, FieldValue, QueryConstraint, SetOptions, Timestamp, WriteBatch } from "firebase/firestore";
import { FirestoreModel } from "./firestoreModel";
import { AuthService } from "./AuthService";
export type FilterOperator = "==" | "!=" | "<" | "<=" | ">" | ">=" | "array-contains" | "in" | "array-contains-any" | "not-in";
interface QueryOptions {
    where?: Array<{
        field: string;
        op: FilterOperator;
        value: any;
    }>;
    orderBy?: Array<{
        field: string;
        direction?: "asc" | "desc";
    }>;
    limit?: number;
    startAfter?: any;
    endBefore?: any;
}
export declare class FirestoreService {
    private readonly db;
    readonly auth: AuthService;
    /**
     * Creates an instance of FirestoreService.
     * @param {FirebaseOptions} firebaseConfig - The Firebase configuration object.
     * @throws Error if firebaseConfig is not provided or invalid.
     */
    constructor(firebaseConfig: FirebaseOptions);
    private validatePathBasic;
    private validateCollectionPathSegments;
    private validateDocumentPathSegments;
    private validateDocumentPath;
    /**
     * Connects this service instance to the Firestore emulator.
     * Note: This should ideally be done once globally if possible.
     * @param {number} firestoreEmulatorPort - The port the emulator is running on.
     */
    connectEmulator(firestoreEmulatorPort: number): void;
    private docRef;
    private colRef;
    /**
     * Retrieves a single document from Firestore by its full path.
     * @template T The expected type of the document data.
     * @param {string} docPath The full path to the document (e.g., 'users/userId').
     * @returns {Promise<T | null>} A promise resolving to the document data or null if not found.
     */
    getDocument<T>(docPath: string): Promise<T | null>;
    /**
     * Adds a new document to a specified collection.
     * @template T The type of the data being added.
     * @param {string} collectionPath The path to the collection (e.g., 'posts', 'users/userId/tasks').
     * @param {T} data The data for the new document.
     * @returns {Promise<string | undefined>} A promise resolving to the new document's ID, or undefined on failure.
     */
    addDocument<T>(collectionPath: string, data: T): Promise<string | undefined>;
    /**
     * Updates specific fields of an existing document.
     * @param {string} docPath The full path to the document.
     * @param {Record<string, any>} data An object containing the fields to update.
     * @returns {Promise<void>}
     */
    updateDocument(docPath: string, data: Record<string, any>): Promise<void>;
    /**
     * Creates or overwrites a document completely.
     * @template T The type of the data being set.
     * @param {string} docPath The full path to the document.
     * @param {T} data The data for the document.
     * @param {object} [options] Optional settings. `merge: true` merges data instead of overwriting.
     * @returns {Promise<void>}
     */
    setDocument<T>(docPath: string, data: T, options?: {
        merge?: boolean;
    }): Promise<void>;
    /**
     * Deletes a document from Firestore.
     * @param {string} docPath The full path to the document.
     * @returns {Promise<void>}
     */
    deleteDocument(docPath: string): Promise<void>;
    /**
     * Deletes all documents within a specified collection or subcollection.
     * Use with caution, especially on large collections.
     * @param {string} collectionPath The path to the collection (e.g., 'users', 'users/userId/posts').
     * @returns {Promise<void>}
     */
    deleteCollection(collectionPath: string): Promise<void>;
    /**
     * Subscribes to real-time updates for a single document.
     * @template T The expected type of the document data.
     * @param {string} docPath The full path to the document.
     * @param {(data: T | null) => void} callback The function to call with document data (or null) on updates.
     * @returns {() => void} A function to unsubscribe from updates.
     */
    subscribeToDocument<T>(docPath: string, callback: (data: T | null) => void): () => void;
    /**
     * Subscribes to real-time updates for a collection.
     * @template T The expected type of the documents in the collection.
     * @param {string} collectionPath The path to the collection.
     * @param {(data: T[]) => void} callback The function to call with an array of document data on updates.
     * @returns {() => void} A function to unsubscribe from updates.
     */
    subscribeToCollection<T>(collectionPath: string, callback: (data: T[]) => void): () => void;
    /**
     * Subscribes to real-time updates for a collection, automatically instantiating FirestoreModel subclasses.
     * @template T A type extending FirestoreModel.
     * @param {new (...args: any[]) => T} model The constructor of the FirestoreModel subclass.
     * @param {string} collectionPath The path to the collection.
     * @param {(data: T[]) => void} callback The function to call with an array of instantiated models on updates.
     * @returns {() => void} A function to unsubscribe from updates.
     */
    subscribeToCollection2<T extends FirestoreModel>(model: new (...args: any[]) => T, collectionPath: string, callback: (data: T[]) => void): () => void;
    /**
     * Fetches documents from a collection, optionally applying query constraints.
     * @template T The expected type of the documents.
     * @param {string} path The path to the collection.
     * @param {...QueryConstraint} queryConstraints Optional Firestore query constraints (where, orderBy, limit, etc.).
     * @returns {Promise<T[]>} A promise resolving to an array of document data.
     */
    fetchCollection<T>(path: string, ...queryConstraints: QueryConstraint[]): Promise<T[]>;
    /**
     * Queries a Firestore collection using a structured options object.
     * @template T The expected type of the document data.
     * @param {string} collectionPath The path to the collection.
     * @param {QueryOptions} [options={}] Optional query constraints (where, orderBy, limit, startAfter, endBefore).
     * @returns {Promise<T[]>} A promise resolving to an array of document data.
     */
    queryCollection<T>(collectionPath: string, options?: QueryOptions): Promise<T[]>;
    /**
     * Returns a new Firestore WriteBatch associated with this service instance's database.
     * @returns {WriteBatch}
     */
    getBatch(): WriteBatch;
    /**
     * Updates specific fields of multiple documents in a batch.
     * @param {WriteBatch} batch The Firestore WriteBatch to update.
     * @param {string} docPath The full path to the document.
     * @param {object} data An object containing the fields to update.
     */
    updateInBatch(batch: WriteBatch, docPath: string, data: {
        [key: string]: FieldValue | Partial<unknown> | undefined;
    }): void;
    /**
     * Sets a document in a batch.
     * @template T The type of the data being set.
     * @param {WriteBatch} batch The Firestore WriteBatch to set.
     * @param {string} docPath The full path to the document.
     * @param {T} data The data for the document.
     * @param {SetOptions} [options] Optional settings. `merge: true` merges data instead of overwriting.
     */
    setInBatch<T>(batch: WriteBatch, docPath: string, data: T, options?: SetOptions): void;
    /**
     * Deletes a document in a batch.
     * @param {WriteBatch} batch The Firestore WriteBatch to delete.
     * @param {string} docPath The full path to the document.
     */
    deleteInBatch(batch: WriteBatch, docPath: string): void;
    /**
     * Provides access to Firestore FieldValue constants (e.g., arrayUnion, arrayRemove).
     */
    static getFieldValue(): {
        arrayUnion: typeof arrayUnion;
        arrayRemove: typeof arrayRemove;
    };
    /**
     * Returns a Firestore Timestamp for the current time.
     */
    static getTimestamp(): Timestamp;
    /**
     * Returns a special value used to delete a field during an update.
     */
    static deleteField(): FieldValue;
}
export {};
