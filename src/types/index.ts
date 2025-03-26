// Type definitions for @serge-ivo/firestore-client

import { Timestamp, FieldValue } from "firebase/firestore";

// Query Types
export type FilterOperator =
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

// Model Types
export interface FirestoreData {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FirestoreDocument extends FirestoreData {
  [key: string]: any;
}

// Service Types
export interface FirestoreServiceConfig {
  maxBatchSize?: number;
  maxQueryLimit?: number;
  enablePersistence?: boolean;
}

export interface BatchOperation<T = any> {
  type: "add" | "set" | "update" | "delete";
  path: string;
  data?: T;
  options?: { merge?: boolean };
}

// Field Value Types
export interface FieldValueOperations {
  increment: (n: number) => FieldValue;
  arrayUnion: (...elements: any[]) => FieldValue;
  arrayRemove: (...elements: any[]) => FieldValue;
  serverTimestamp: () => FieldValue;
  deleteField: () => FieldValue;
}

// Subscription Types
export type UnsubscribeFunction = () => void;
export type DocumentSnapshotCallback<T> = (data: T | null) => void;
export type CollectionSnapshotCallback<T> = (data: T[]) => void;

// Error Types
export class FirestoreError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = "FirestoreError";
  }
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithId<T> = T & { id: string };
export type WithOptionalId<T> = T & { id?: string };
