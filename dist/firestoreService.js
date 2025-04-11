"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreService = void 0;
// src/services/FirestoreService.ts
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
// Correctly import the local factory function
const FirestoreDataConverter_1 = __importDefault(require("./FirestoreDataConverter"));
const RequestLimiter_1 = __importDefault(require("./RequestLimiter"));
class FirestoreService {
    /**
     * Creates an instance of FirestoreService.
     * @param {FirebaseOptions} firebaseConfig - The Firebase configuration object.
     * @throws Error if firebaseConfig is not provided or invalid.
     */
    constructor(firebaseConfig) {
        // Basic check for firebaseConfig object
        if (!firebaseConfig ||
            typeof firebaseConfig !== "object" ||
            !firebaseConfig.apiKey // Check for a key property like apiKey as a basic validation
        ) {
            throw new Error("Valid Firebase configuration object is required for FirestoreService constructor");
        }
        // Initialize Firebase app and Firestore instance
        try {
            const app = (0, app_1.initializeApp)(firebaseConfig);
            this.db = (0, firestore_1.getFirestore)(app);
            console.log("FirestoreService instance created and Firebase initialized successfully.");
        }
        catch (error) {
            console.error("Error initializing Firebase:", error);
            throw new Error("Failed to initialize Firebase within FirestoreService");
        }
    }
    // --- Path Validation Methods (can remain private static or become private instance methods) ---
    // Let's make them instance methods for consistency, though static is also fine.
    validatePathBasic(path) {
        if (!path) {
            throw new Error("Path cannot be empty");
        }
        if (path.startsWith("/") || path.endsWith("/")) {
            throw new Error("Path cannot start or end with '/'");
        }
    }
    validateCollectionPathSegments(path) {
        this.validatePathBasic(path);
        const segments = path.split("/");
        if (segments.length % 2 !== 1) {
            throw new Error("Collection path must have an odd number of segments (e.g., 'users' or 'users/123/posts')");
        }
    }
    validateDocumentPathSegments(path) {
        this.validatePathBasic(path);
        const segments = path.split("/");
        if (segments.length % 2 !== 0) {
            throw new Error("Document path must have an even number of segments (e.g., 'users/123' or 'users/123/posts/456')");
        }
        if (segments.length < 2) {
            throw new Error("Document path must have at least two segments.");
        }
    }
    validateDocumentPath(path) {
        this.validateDocumentPathSegments(path);
    }
    // --- End Path Validation ---
    // --- Instance Methods (previously static, now use this.db) ---
    /**
     * Connects this service instance to the Firestore emulator.
     * Note: This should ideally be done once globally if possible.
     * @param {number} firestoreEmulatorPort - The port the emulator is running on.
     */
    connectEmulator(firestoreEmulatorPort) {
        // Note: Emulator connection is typically done once globally,
        // but providing it as an instance method allows flexibility if needed.
        (0, firestore_1.connectFirestoreEmulator)(this.db, "localhost", firestoreEmulatorPort);
        console.log("🔥 Connected instance to Firestore Emulator");
    }
    // Private helpers now use this.db and are instance methods
    docRef(path) {
        this.validateDocumentPath(path);
        return (0, firestore_1.doc)(this.db, path).withConverter((0, FirestoreDataConverter_1.default)());
    }
    colRef(path) {
        // Use the imported factory function
        return (0, firestore_1.collection)(this.db, path).withConverter((0, FirestoreDataConverter_1.default)());
    }
    // Public API methods are now instance methods
    /**
     * Retrieves a single document from Firestore by its full path.
     * @template T The expected type of the document data.
     * @param {string} docPath The full path to the document (e.g., 'users/userId').
     * @returns {Promise<T | null>} A promise resolving to the document data or null if not found.
     */
    async getDocument(docPath) {
        RequestLimiter_1.default.logDocumentRequest(docPath);
        const docSnap = await (0, firestore_1.getDoc)(this.docRef(docPath));
        return docSnap.exists() ? docSnap.data() : null;
    }
    /**
     * Adds a new document to a specified collection.
     * @template T The type of the data being added.
     * @param {string} collectionPath The path to the collection (e.g., 'posts', 'users/userId/tasks').
     * @param {T} data The data for the new document.
     * @returns {Promise<string | undefined>} A promise resolving to the new document's ID, or undefined on failure.
     */
    async addDocument(collectionPath, data) {
        this.validateCollectionPathSegments(collectionPath); // Validate path first
        RequestLimiter_1.default.logGeneralRequest();
        const docRef = await (0, firestore_1.addDoc)(this.colRef(collectionPath), data);
        return docRef.id;
    }
    /**
     * Updates specific fields of an existing document.
     * @param {string} docPath The full path to the document.
     * @param {Record<string, any>} data An object containing the fields to update.
     * @returns {Promise<void>}
     */
    async updateDocument(docPath, data) {
        this.validateDocumentPath(docPath); // Ensure doc path is valid before update
        RequestLimiter_1.default.logGeneralRequest();
        // Use the raw doc ref without converter for partial updates
        await (0, firestore_1.updateDoc)((0, firestore_1.doc)(this.db, docPath), data);
    }
    /**
     * Creates or overwrites a document completely.
     * @template T The type of the data being set.
     * @param {string} docPath The full path to the document.
     * @param {T} data The data for the document.
     * @param {object} [options] Optional settings. `merge: true` merges data instead of overwriting.
     * @returns {Promise<void>}
     */
    async setDocument(docPath, data, options = { merge: true }) {
        this.validateDocumentPath(docPath);
        RequestLimiter_1.default.logGeneralRequest();
        await (0, firestore_1.setDoc)(this.docRef(docPath), data, options);
    }
    /**
     * Deletes a document from Firestore.
     * @param {string} docPath The full path to the document.
     * @returns {Promise<void>}
     */
    async deleteDocument(docPath) {
        this.validateDocumentPath(docPath);
        RequestLimiter_1.default.logGeneralRequest();
        // Get the raw doc ref for deletion
        await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(this.db, docPath));
    }
    /**
     * Deletes all documents within a specified collection or subcollection.
     * Use with caution, especially on large collections.
     * @param {string} collectionPath The path to the collection (e.g., 'users', 'users/userId/posts').
     * @returns {Promise<void>}
     */
    async deleteCollection(collectionPath) {
        this.validateCollectionPathSegments(collectionPath);
        RequestLimiter_1.default.logGeneralRequest();
        const batch = (0, firestore_1.writeBatch)(this.db);
        // Use colRef without converter for deletion query
        const snapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(this.db, collectionPath));
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
    subscribeToDocument(docPath, callback) {
        this.validateDocumentPath(docPath);
        RequestLimiter_1.default.logSubscriptionRequest(docPath);
        const unsubscribe = (0, firestore_1.onSnapshot)(this.docRef(docPath), (docSnap) => {
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
    subscribeToCollection(collectionPath, callback) {
        this.validateCollectionPathSegments(collectionPath);
        RequestLimiter_1.default.logSubscriptionRequest(collectionPath);
        const unsubscribe = (0, firestore_1.onSnapshot)((0, firestore_1.query)(this.colRef(collectionPath)), (snapshot) => {
            const data = snapshot.docs.map((d) => d.data());
            callback(data);
        });
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
    subscribeToCollection2(model, collectionPath, callback) {
        this.validateCollectionPathSegments(collectionPath);
        RequestLimiter_1.default.logSubscriptionRequest(collectionPath);
        // Use the factory function to get the converter
        const converter = (0, FirestoreDataConverter_1.default)(); // Use <any> or a base type for raw data
        const unsubscribe = (0, firestore_1.onSnapshot)((0, firestore_1.query)(this.colRef(collectionPath)).withConverter(converter), (snapshot) => {
            // Map the raw data, then instantiate the specific model class
            const data = snapshot.docs.map((doc) => {
                const rawData = doc.data(); // Get data converted by the converter
                // Manually instantiate the correct model subclass
                return new model(rawData, doc.id);
            });
            callback(data);
        });
        return unsubscribe;
    }
    /**
     * Fetches documents from a collection, optionally applying query constraints.
     * @template T The expected type of the documents.
     * @param {string} path The path to the collection.
     * @param {...QueryConstraint} queryConstraints Optional Firestore query constraints (where, orderBy, limit, etc.).
     * @returns {Promise<T[]>} A promise resolving to an array of document data.
     */
    async fetchCollection(path, ...queryConstraints) {
        this.validateCollectionPathSegments(path);
        RequestLimiter_1.default.logCollectionFetchRequest(path);
        const snapshot = await (0, firestore_1.getDocs)(queryConstraints.length > 0
            ? (0, firestore_1.query)(this.colRef(path), ...queryConstraints)
            : this.colRef(path));
        return snapshot.docs.map((d) => d.data());
    }
    /**
     * Queries a Firestore collection using a structured options object.
     * @template T The expected type of the document data.
     * @param {string} collectionPath The path to the collection.
     * @param {QueryOptions} [options={}] Optional query constraints (where, orderBy, limit, startAfter, endBefore).
     * @returns {Promise<T[]>} A promise resolving to an array of document data.
     */
    async queryCollection(collectionPath, options = {}) {
        this.validateCollectionPathSegments(collectionPath);
        RequestLimiter_1.default.logGeneralRequest();
        const colReference = this.colRef(collectionPath);
        const constraints = [];
        if (options.where) {
            options.where.forEach((w) => {
                constraints.push((0, firestore_1.where)(w.field, w.op, w.value));
            });
        }
        if (options.orderBy) {
            options.orderBy.forEach((o) => {
                constraints.push((0, firestore_1.orderBy)(o.field, o.direction));
            });
        }
        if (options.startAfter) {
            constraints.push((0, firestore_1.startAfter)(options.startAfter));
        }
        if (options.endBefore) {
            constraints.push((0, firestore_1.endBefore)(options.endBefore));
        }
        // Apply limit LAST as recommended by Firestore docs
        if (options.limit) {
            constraints.push((0, firestore_1.limit)(options.limit));
        }
        const q = (0, firestore_1.query)(colReference, ...constraints);
        const snapshot = await (0, firestore_1.getDocs)(q);
        return snapshot.docs.map((d) => d.data());
    }
    // --- Batch Operations ---
    /**
     * Returns a new Firestore WriteBatch associated with this service instance's database.
     * @returns {WriteBatch}
     */
    getBatch() {
        RequestLimiter_1.default.logGeneralRequest();
        return (0, firestore_1.writeBatch)(this.db);
    }
    /**
     * Updates specific fields of multiple documents in a batch.
     * @param {WriteBatch} batch The Firestore WriteBatch to update.
     * @param {string} docPath The full path to the document.
     * @param {object} data An object containing the fields to update.
     */
    updateInBatch(batch, docPath, data) {
        this.validateDocumentPath(docPath);
        const docRef = (0, firestore_1.doc)(this.db, docPath); // Use raw doc ref
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
    setInBatch(batch, docPath, data, options = {}) {
        this.validateDocumentPath(docPath);
        // Use docRef with converter for type safety during set
        const docRef = this.docRef(docPath);
        batch.set(docRef, data, options);
    }
    /**
     * Deletes a document in a batch.
     * @param {WriteBatch} batch The Firestore WriteBatch to delete.
     * @param {string} docPath The full path to the document.
     */
    deleteInBatch(batch, docPath) {
        this.validateDocumentPath(docPath);
        const docRef = (0, firestore_1.doc)(this.db, docPath); // Use raw doc ref
        batch.delete(docRef);
    }
    // --- Static Utility Methods (Do not depend on instance state) ---
    /**
     * Provides access to Firestore FieldValue constants (e.g., arrayUnion, arrayRemove).
     */
    static getFieldValue() {
        return { arrayUnion: firestore_1.arrayUnion, arrayRemove: firestore_1.arrayRemove };
    }
    /**
     * Returns a Firestore Timestamp for the current time.
     */
    static getTimestamp() {
        return firestore_1.Timestamp.now();
    }
    /**
     * Returns a special value used to delete a field during an update.
     */
    static deleteField() {
        return (0, firestore_1.deleteField)();
    }
}
exports.FirestoreService = FirestoreService;
