import { Timestamp, FieldValue } from "firebase/firestore";
export type FilterOperator = "==" | "!=" | "<" | "<=" | ">" | ">=" | "array-contains" | "in" | "array-contains-any" | "not-in";
export interface WhereClause {
    field: string;
    op: FilterOperator;
    value: any;
}
export interface OrderByClause {
    field: string;
    direction?: "asc" | "desc";
}
export interface QueryOptions {
    where?: WhereClause[];
    orderBy?: OrderByClause[];
    limit?: number;
}
export interface FirestoreData {
    id?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}
export interface FirestoreDocument extends FirestoreData {
    [key: string]: any;
}
export interface FirestoreServiceConfig {
    maxBatchSize?: number;
    maxQueryLimit?: number;
    enablePersistence?: boolean;
}
export interface BatchOperation<T = any> {
    type: "add" | "set" | "update" | "delete";
    path: string;
    data?: T;
    options?: {
        merge?: boolean;
    };
}
export interface FieldValueOperations {
    increment: (n: number) => FieldValue;
    arrayUnion: (...elements: any[]) => FieldValue;
    arrayRemove: (...elements: any[]) => FieldValue;
    serverTimestamp: () => FieldValue;
    deleteField: () => FieldValue;
}
export type UnsubscribeFunction = () => void;
export type DocumentSnapshotCallback<T> = (data: T | null) => void;
export type CollectionSnapshotCallback<T> = (data: T[]) => void;
export declare class FirestoreError extends Error {
    code?: string | undefined;
    details?: any | undefined;
    constructor(message: string, code?: string | undefined, details?: any | undefined);
}
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type WithId<T> = T & {
    id: string;
};
export type WithOptionalId<T> = T & {
    id?: string;
};
