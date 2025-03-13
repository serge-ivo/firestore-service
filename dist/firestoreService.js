"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreService = void 0;
// src/services/FirestoreService.ts
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const FirestoreDataConverter_1 = __importDefault(require("./FirestoreDataConverter"));
const RequestLimiter_1 = __importDefault(require("./RequestLimiter"));
const firestore_2 = require("firebase/firestore");
class FirestoreService {
    // Initialize Firebase app and Firestore
    static initialize(firebaseConfig) {
        if (!this.app) {
            this.app = (0, app_1.initializeApp)(firebaseConfig);
            if (process.env.NODE_ENV === "test") {
                this.db = (0, firestore_1.initializeFirestore)(this.app, {});
            }
            else {
                this.db = (0, firestore_1.initializeFirestore)(this.app, {
                    localCache: (0, firestore_1.persistentLocalCache)({
                        tabManager: (0, firestore_1.persistentMultipleTabManager)(),
                    }),
                });
            }
        }
    }
    static connectEmulators(authEmulatorPort, firestoreEmulatorPort) {
        (0, auth_1.connectAuthEmulator)((0, auth_1.getAuth)(), `http://localhost:${authEmulatorPort}`, {
            disableWarnings: true,
        });
        (0, firestore_2.connectFirestoreEmulator)(FirestoreService.db, "localhost", firestoreEmulatorPort);
        console.log("🔥 Connected to Firestore & Auth Emulators");
    }
    static doc(path) {
        return (0, firestore_1.doc)(this.db, path).withConverter((0, FirestoreDataConverter_1.default)());
    }
    static collection(path) {
        return (0, firestore_1.collection)(this.db, path).withConverter((0, FirestoreDataConverter_1.default)());
    }
    static getDocument(docPath) {
        return __awaiter(this, void 0, void 0, function* () {
            RequestLimiter_1.default.logDocumentRequest(docPath);
            const docSnap = yield (0, firestore_1.getDoc)(this.doc(docPath));
            return docSnap.exists() ? docSnap.data() : null;
        });
    }
    static addDocument(collectionPath, data) {
        return __awaiter(this, void 0, void 0, function* () {
            RequestLimiter_1.default.logGeneralRequest();
            console.log(collectionPath);
            console.log("collection:");
            console.log(this.collection(collectionPath).toString());
            console.log("typeof collection:");
            console.log(typeof this.collection(collectionPath));
            const docRef = yield (0, firestore_1.addDoc)(this.collection(collectionPath), data);
            return docRef.id;
        });
    }
    static updateDocument(docPath, data) {
        return __awaiter(this, void 0, void 0, function* () {
            RequestLimiter_1.default.logGeneralRequest();
            yield (0, firestore_1.updateDoc)((0, firestore_1.doc)(this.db, docPath), data);
        });
    }
    static setDocument(docPath_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (docPath, data, options = { merge: true }) {
            RequestLimiter_1.default.logGeneralRequest();
            yield (0, firestore_1.setDoc)(this.doc(docPath), data, options);
        });
    }
    static deleteDocument(docPath) {
        return __awaiter(this, void 0, void 0, function* () {
            RequestLimiter_1.default.logGeneralRequest();
            yield (0, firestore_1.deleteDoc)(this.doc(docPath));
        });
    }
    static deleteCollection(collectionPath) {
        return __awaiter(this, void 0, void 0, function* () {
            RequestLimiter_1.default.logGeneralRequest();
            const batch = (0, firestore_1.writeBatch)(this.db);
            const snapshot = yield (0, firestore_1.getDocs)(this.collection(collectionPath));
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));
            yield batch.commit();
        });
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
    static fetchCollection(path, ...queryConstraints) {
        return __awaiter(this, void 0, void 0, function* () {
            RequestLimiter_1.default.logCollectionFetchRequest(path);
            const snapshot = yield (0, firestore_1.getDocs)(queryConstraints.length > 0
                ? (0, firestore_1.query)(this.collection(path), ...queryConstraints)
                : this.collection(path));
            return snapshot.docs.map((doc) => doc.data());
        });
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
    static queryCollection(model, path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const constraints = [];
            // Handle WHERE clauses
            if (options === null || options === void 0 ? void 0 : options.where) {
                options.where.forEach((condition) => {
                    constraints.push((0, firestore_1.where)(condition.field, condition.op, condition.value));
                });
            }
            // Handle ORDER BY clauses
            if (options === null || options === void 0 ? void 0 : options.orderBy) {
                options.orderBy.forEach((order) => {
                    constraints.push((0, firestore_1.orderBy)(order.field, order.direction || "asc"));
                });
            }
            // Handle LIMIT
            if (options === null || options === void 0 ? void 0 : options.limit) {
                constraints.push((0, firestore_1.limit)(options.limit));
            }
            const q = constraints.length > 0
                ? (0, firestore_1.query)(this.collection(path), ...constraints)
                : this.collection(path);
            const snapshot = yield (0, firestore_1.getDocs)(q);
            return snapshot.docs.map((doc) => new model(doc.data(), doc.id));
        });
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
    static getBatch() {
        RequestLimiter_1.default.logGeneralRequest();
        return (0, firestore_1.writeBatch)(this.db);
    }
    static getAuthUserId() {
        const auth = (0, auth_1.getAuth)();
        const user = auth.currentUser;
        return user ? user.uid : null;
    }
    // Method to sign in with Google
    static signInWithGoogle() {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = (0, auth_1.getAuth)();
            const provider = new auth_1.GoogleAuthProvider();
            try {
                const result = yield (0, auth_1.signInWithPopup)(auth, provider);
                return result.user;
            }
            catch (error) {
                console.error("Error during Google sign-in:", error);
                return null;
            }
        });
    }
    // Method to sign in with Email and Password
    static signInWithEmailPassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = (0, auth_1.getAuth)();
            try {
                const result = yield (0, auth_1.signInWithEmailAndPassword)(auth, email, password);
                return result.user;
            }
            catch (error) {
                console.error("Error during email/password sign-in:", error);
                return null;
            }
        });
    }
    static onAuthStateChanged(callback) {
        return (0, auth_1.getAuth)().onAuthStateChanged(callback);
    }
    static signOut() {
        return (0, auth_1.getAuth)().signOut();
    }
    static add(collectionPath, data) {
        return (0, firestore_1.addDoc)(this.collection(collectionPath), data).then((docRef) => docRef.id);
    }
}
exports.FirestoreService = FirestoreService;
exports.default = FirestoreService;
//# sourceMappingURL=firestoreService.js.map