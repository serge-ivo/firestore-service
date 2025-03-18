import { arrayRemove, arrayUnion, QueryConstraint, SetOptions, Timestamp, WriteBatch, FieldValue } from "firebase/firestore";
import { FirestoreModel } from "./firestoreModel";
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
}
export declare class FirestoreService {
    private static app;
    private static db;
    static initialize(firebaseConfig: Record<string, any>): void;
    static connectEmulator(firestoreEmulatorPort: number): void;
    private static doc;
    private static collection;
    static getDocument<T>(docPath: string): Promise<T | null>;
    static addDocument<T>(collectionPath: string, data: T): Promise<string | undefined>;
    static updateDocument(docPath: string, data: Record<string, any>): Promise<void>;
    static setDocument<T>(docPath: string, data: T, options?: {
        merge?: boolean;
    }): Promise<void>;
    static deleteDocument(docPath: string): Promise<void>;
    static deleteCollection(collectionPath: string): Promise<void>;
    static subscribeToDocument<T>(docPath: string, callback: (data: T | null) => void): () => void;
    static subscribeToCollection<T>(collectionPath: string, callback: (data: T[]) => void): () => void;
    static subscribeToCollection2<T extends FirestoreModel>(model: new (data: any) => T, // ✅ Accepts a class constructor
    collectionPath: string, callback: (data: T[]) => void): () => void;
    static fetchCollection<T>(path: string, ...queryConstraints: QueryConstraint[]): Promise<T[]>;
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
    static queryCollection<T>(model: new (data: any, id?: string) => T, path: string, options?: QueryOptions): Promise<T[]>;
    static getFieldValue(): {
        arrayUnion: typeof arrayUnion;
        arrayRemove: typeof arrayRemove;
    };
    static getTimestamp(): Timestamp;
    static deleteField(): FieldValue;
    /**
     * Returns a new Firestore WriteBatch.
     */
    static getBatch(): WriteBatch;
    /**
     * Helper for batch.update()
     */
    static updateInBatch(batch: WriteBatch, docPath: string, data: {
        [key: string]: FieldValue | Partial<unknown> | undefined;
    }): void;
    /**
     * Helper for batch.set()
     * Overload with optional merge
     */
    static setInBatch<T>(batch: WriteBatch, docPath: string, data: T, options?: SetOptions): void;
    /**
     * Helper for batch.delete()
     */
    static deleteInBatch(batch: WriteBatch, docPath: string): void;
    static add(collectionPath: string, data: any): Promise<string | undefined>;
}
export default FirestoreService;
