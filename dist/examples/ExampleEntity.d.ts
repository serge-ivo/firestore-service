import { FirestoreModel } from "../firestoreModel";
/**
 * ✅ Represents the shape of the Firestore document data.
 */
export type ExampleData = {
    id?: string;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    owner: string;
    tags?: string[];
};
/**
 * ✅ ExampleEntity: Data representation + Path logic.
 * Persistence is handled by FirestoreService.
 */
export declare class ExampleEntity extends FirestoreModel {
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    owner: string;
    constructor(data: {
        id?: string;
    } & Partial<ExampleData>);
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
}
