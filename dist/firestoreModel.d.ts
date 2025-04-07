export declare abstract class FirestoreModel {
    readonly id?: string;
    constructor(data: {
        id?: string;
    } & Record<string, any>);
    /**
     * ✅ Returns the Firestore document path (must be implemented by subclasses).
     * Requires the instance to have an ID.
     */
    abstract getDocPath(): string;
    /**
     * ✅ Returns the Firestore collection path (must be implemented by subclasses).
     */
    abstract getColPath(): string;
}
