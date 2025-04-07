"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreService = void 0;
// src/services/FirestoreService.ts
const firestore_1 = require("firebase/firestore");
const FirestoreDataConverter_1 = __importDefault(require("./FirestoreDataConverter"));
const RequestLimiter_1 = __importDefault(require("./RequestLimiter"));
const firestore_2 = require("firebase/firestore");
class FirestoreService {
    static validatePathBasic(path) {
        if (!path) {
            throw new Error("Path cannot be empty");
        }
        if (path.startsWith("/") || path.endsWith("/")) {
            throw new Error("Path cannot start or end with '/'");
        }
    }
    static validateCollectionPathSegments(path) {
        this.validatePathBasic(path);
        const segments = path.split("/");
        if (segments.length % 2 !== 1) {
            throw new Error("Collection path must have an odd number of segments (e.g., 'users' or 'users/123/posts')");
        }
    }
    static validateDocumentPathSegments(path) {
        this.validatePathBasic(path);
        const segments = path.split("/");
        if (segments.length % 2 !== 0) {
            throw new Error("Document path must have an even number of segments (e.g., 'users/123' or 'users/123/posts/456')");
        }
        if (segments.length < 2) {
            // Ensure at least collection/doc
            throw new Error("Document path must have at least two segments.");
        }
    }
    // Update existing validateDocumentPath to use the new segment validator
    static validateDocumentPath(path) {
        this.validateDocumentPathSegments(path);
    }
    /**
     * Initialize Firestore using an existing Firebase app instance.
     * Note: You must initialize Firebase app yourself before calling this method.
     * @param db - An initialized Firestore instance
     * @throws Error if db is not provided or invalid
     */
    static initialize(db) {
        if (!db ||
            typeof db !== "object" ||
            !("type" in db) ||
            db.type !== "firestore") {
            throw new Error("Firestore instance is required for initialization");
        }
        this.db = db;
        this.isInitialized = true;
        console.log("FirestoreService initialized successfully");
    }
    static checkInitialized() {
        if (!this.isInitialized) {
            throw new Error("FirestoreService has not been initialized. Call FirestoreService.initialize(db) first.");
        }
    }
    static connectEmulator(firestoreEmulatorPort) {
        (0, firestore_2.connectFirestoreEmulator)(FirestoreService.db, "localhost", firestoreEmulatorPort);
        console.log("🔥 Connected to Firestore Emulator");
    }
    static doc(path) {
        this.checkInitialized();
        this.validateDocumentPath(path);
        return (0, firestore_1.doc)(this.db, path).withConverter((0, FirestoreDataConverter_1.default)());
    }
    static collection(path) {
        this.checkInitialized();
        return (0, firestore_1.collection)(this.db, path).withConverter((0, FirestoreDataConverter_1.default)());
    }
    static async getDocument(docPath) {
        RequestLimiter_1.default.logDocumentRequest(docPath);
        const docSnap = await (0, firestore_1.getDoc)(this.doc(docPath));
        return docSnap.exists() ? docSnap.data() : null;
    }
    static async addDocument(collectionPath, data) {
        // Perform validation *first* before any other operations
        this.checkInitialized(); // Check initialization first is also good practice
        this.validateCollectionPathSegments(collectionPath);
        RequestLimiter_1.default.logGeneralRequest();
        const docRef = await (0, firestore_1.addDoc)(this.collection(collectionPath), data);
        return docRef.id;
    }
    static async updateDocument(docPath, data) {
        RequestLimiter_1.default.logGeneralRequest();
        await (0, firestore_1.updateDoc)((0, firestore_1.doc)(this.db, docPath), data);
    }
    static async setDocument(docPath, data, options = { merge: true }) {
        RequestLimiter_1.default.logGeneralRequest();
        await (0, firestore_1.setDoc)(this.doc(docPath), data, options);
    }
    static async deleteDocument(docPath) {
        RequestLimiter_1.default.logGeneralRequest();
        await (0, firestore_1.deleteDoc)(this.doc(docPath));
    }
    static async deleteCollection(collectionPath) {
        RequestLimiter_1.default.logGeneralRequest();
        const batch = (0, firestore_1.writeBatch)(this.db);
        const snapshot = await (0, firestore_1.getDocs)(this.collection(collectionPath));
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
    }
    static subscribeToDocument(docPath, callback) {
        RequestLimiter_1.default.logSubscriptionRequest(docPath);
        const unsubscribe = (0, firestore_1.onSnapshot)(this.doc(docPath), (docSnap) => {
            callback(docSnap.exists() ? docSnap.data() : null);
        });
        return unsubscribe;
    }
    static subscribeToCollection(collectionPath, callback) {
        RequestLimiter_1.default.logSubscriptionRequest(collectionPath);
        const unsubscribe = (0, firestore_1.onSnapshot)((0, firestore_1.query)(this.collection(collectionPath)), (snapshot) => {
            const data = snapshot.docs.map((doc) => doc.data());
            callback(data);
        });
        return unsubscribe;
    }
    static subscribeToCollection2(model, // ✅ Accepts a class constructor
    collectionPath, callback) {
        RequestLimiter_1.default.logSubscriptionRequest(collectionPath);
        const unsubscribe = (0, firestore_1.onSnapshot)((0, firestore_1.query)(FirestoreService.collection(collectionPath)), (snapshot) => {
            const data = snapshot.docs.map((doc) => new model(doc.data()).withId(doc.id)); // ✅ Instantiate correct class
            callback(data);
        });
        return unsubscribe;
    }
    static async fetchCollection(path, ...queryConstraints) {
        RequestLimiter_1.default.logCollectionFetchRequest(path);
        const snapshot = await (0, firestore_1.getDocs)(queryConstraints.length > 0
            ? (0, firestore_1.query)(this.collection(path), ...queryConstraints)
            : this.collection(path));
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
    static async queryCollection(_model, collectionPath, options = {}) {
        RequestLimiter_1.default.logGeneralRequest();
        this.checkInitialized();
        const colRef = (0, firestore_1.collection)(this.db, collectionPath);
        const constraints = [];
        // Apply where clauses
        if (options.where) {
            options.where.forEach((w) => {
                constraints.push((0, firestore_1.where)(w.field, w.op, w.value));
            });
        }
        // Apply orderBy clauses
        if (options.orderBy) {
            options.orderBy.forEach((o) => {
                constraints.push((0, firestore_1.orderBy)(o.field, o.direction));
            });
        }
        // Apply limit
        if (options.limit) {
            constraints.push((0, firestore_1.limit)(options.limit));
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
            constraints.push((0, firestore_1.startAfter)(options.startAfter));
        }
        // Apply endBefore for pagination
        if (options.endBefore) {
            constraints.push((0, firestore_1.endBefore)(options.endBefore));
        }
        const q = (0, firestore_1.query)(colRef, ...constraints).withConverter((0, FirestoreDataConverter_1.default)());
        const snapshot = await (0, firestore_1.getDocs)(q);
        return snapshot.docs.map((doc) => doc.data());
    }
    static getFieldValue() {
        return { arrayUnion: firestore_1.arrayUnion, arrayRemove: firestore_1.arrayRemove };
    }
    static getTimestamp() {
        return firestore_1.Timestamp.now();
    }
    static deleteField() {
        return (0, firestore_1.deleteField)();
    }
    /**
     * Returns a new Firestore WriteBatch.
     */
    static getBatch() {
        RequestLimiter_1.default.logGeneralRequest();
        return (0, firestore_1.writeBatch)(this.db);
    }
    /**
     * Helper for batch.update()
     */
    static updateInBatch(batch, docPath, data) {
        const docRef = (0, firestore_1.doc)(this.db, docPath);
        batch.update(docRef, data);
    }
    /**
     * Helper for batch.set()
     * Overload with optional merge
     */
    static setInBatch(batch, docPath, data, options = {}) {
        const docRef = (0, firestore_1.doc)(this.db, docPath).withConverter((0, FirestoreDataConverter_1.default)());
        batch.set(docRef, data, options);
    }
    /**
     * Helper for batch.delete()
     */
    static deleteInBatch(batch, docPath) {
        const docRef = (0, firestore_1.doc)(this.db, docPath);
        batch.delete(docRef);
    }
    static add(collectionPath, data) {
        return (0, firestore_1.addDoc)(this.collection(collectionPath), data).then((docRef) => docRef.id);
    }
}
exports.FirestoreService = FirestoreService;
FirestoreService.isInitialized = false;
exports.default = FirestoreService;
