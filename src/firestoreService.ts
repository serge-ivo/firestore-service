// src/services/FirestoreService.ts
import { FirebaseApp, initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
} from "firebase/auth";
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
  Firestore,
  getDoc,
  getDocs,
  initializeFirestore,
  limit,
  onSnapshot,
  orderBy,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  QueryConstraint,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import FirestoreDataConverter from "./FirestoreDataConverter";
import { FirestoreModel } from "./firestoreModel";
import RequestLimiter from "./RequestLimiter";

type FilterOperator =
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
}

import { connectFirestoreEmulator } from "firebase/firestore";

export class FirestoreService {
  private static app: FirebaseApp;
  private static db: Firestore;

  // Initialize Firebase app and Firestore
  static initialize(firebaseConfig: Record<string, any>) {
    if (!this.app) {
      this.app = initializeApp(firebaseConfig);

      if (process.env.NODE_ENV === "test") {
        this.db = initializeFirestore(this.app, {});
      } else {
        this.db = initializeFirestore(this.app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
      }
    }

    if (process.env.NODE_ENV === "test") {
      connectFirestoreEmulator(FirestoreService.db, "localhost", 9098);
      connectAuthEmulator(getAuth(), "http://localhost:9099", {
        disableWarnings: true,
      });
      console.log("🔥 Connected to Firestore & Auth Emulators");
    }
  }

  static doc<T>(path: string): DocumentReference<T> {
    return doc(this.db, path).withConverter(FirestoreDataConverter<T>());
  }

  static collection<T>(path: string): CollectionReference<T> {
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
    RequestLimiter.logGeneralRequest();
    console.log(collectionPath);

    console.log("collection:");
    console.log(this.collection<T>(collectionPath).toString());
    console.log("typeof collection:");
    console.log(typeof this.collection<T>(collectionPath));
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
  static async queryCollection<T>(
    model: new (data: any, id?: string) => T,
    path: string,
    options?: QueryOptions
  ): Promise<T[]> {
    const constraints: QueryConstraint[] = [];

    // Handle WHERE clauses
    if (options?.where) {
      options.where.forEach((condition) => {
        constraints.push(where(condition.field, condition.op, condition.value));
      });
    }

    // Handle ORDER BY clauses
    if (options?.orderBy) {
      options.orderBy.forEach((order) => {
        constraints.push(orderBy(order.field, order.direction || "asc"));
      });
    }

    // Handle LIMIT
    if (options?.limit) {
      constraints.push(limit(options.limit));
    }

    const q =
      constraints.length > 0
        ? query(this.collection<T>(path), ...constraints)
        : this.collection<T>(path);

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => new model(doc.data(), doc.id));
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

  static getBatch() {
    RequestLimiter.logGeneralRequest();
    return writeBatch(this.db);
  }

  static getAuthUserId(): string | null {
    const auth = getAuth();
    const user: User | null = auth.currentUser;
    return user ? user.uid : null;
  }

  // Method to sign in with Google
  static async signInWithGoogle(): Promise<User | null> {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      return null;
    }
  }

  // Method to sign in with Email and Password
  static async signInWithEmailPassword(
    email: string,
    password: string
  ): Promise<User | null> {
    const auth = getAuth();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Error during email/password sign-in:", error);
      return null;
    }
  }

  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return getAuth().onAuthStateChanged(callback);
  }

  static signOut() {
    return getAuth().signOut();
  }

  static add(collectionPath: string, data: any): Promise<string | undefined> {
    return addDoc(this.collection<any>(collectionPath), data).then(
      (docRef) => docRef.id
    );
  }
}

export default FirestoreService;
