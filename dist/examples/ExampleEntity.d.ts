import { FirestoreModel } from "../firestoreModel";
/**
 * ✅ Represents a Firestore document entity.
 */
export type ExampleData = {
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    owner: string;
};
export declare class ExampleEntity extends FirestoreModel {
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    owner: string;
    constructor(data: ExampleData, id?: string);
    /**
     * ✅ Constructs Firestore collection/document paths.
     */
    static buildPath(entityId?: string): string;
    getDocPath(): string;
    getColPath(): string;
    /**
     * ✅ Fetches an ExampleEntity by ID from Firestore.
     */
    static getById(id: string): Promise<ExampleEntity | null>;
    /**
     * ✅ Saves or updates this entity in Firestore.
     */
    save(): Promise<ExampleEntity>;
}
