export declare abstract class FirestoreModel {
    protected _id?: string;
    constructor(id?: string);
    get id(): string | undefined;
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
    protected sanitizeData<T extends Record<string, unknown>>(data: T): T;
    /**
     * ✅ Updates this document in Firestore.
     */
    update(data: Partial<this>): Promise<void>;
    /**
     * ✅ Deletes this document from Firestore.
     */
    delete(): Promise<void>;
    /**
     * ✅ Assigns Firestore ID after retrieval.
     */
    protected _setId(id: string): void;
    withId(id: string): this;
    /**
     * ✅ Fetches a document from Firestore and instantiates the model.
     */
    static get<T extends FirestoreModel>(this: new (...args: any[]) => T, docPath: string): Promise<T | null>;
    /**
     * ✅ Creates and saves a new Firestore document, returning an instance.
     */
    static create<T extends FirestoreModel>(this: new (...args: any[]) => T, data: Partial<T>): Promise<T>;
}
