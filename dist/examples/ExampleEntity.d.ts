import { FirestoreModel } from "../firestoreModel";
/**
 * ✅ Represents the shape of the Firestore document data.
 */
export type ExampleData = {
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    owner: string;
};
/**
 * ✅ ExampleEntity extends FirestoreModel, gaining 'update', 'delete', etc.
 */
export declare class ExampleEntity extends FirestoreModel {
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    owner: string;
    constructor(data?: Partial<ExampleData>, id?: string);
    /**
     * ✅ Build Firestore path. If 'id' is provided, returns document path; else collection path.
     */
    static buildPath(id?: string): string;
    /**
     * ✅ For FirestoreModel's abstract method: document path for this instance.
     */
    getDocPath(): string;
    /**
     * ✅ For FirestoreModel's abstract method: collection path for this model.
     */
    getColPath(): string;
    /**
     * ✅ Retrieve an ExampleEntity by ID directly (alternative to FirestoreModel.get()).
     */
    static getById(id: string): Promise<ExampleEntity | null>;
}
