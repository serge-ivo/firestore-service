"use strict";
// Type definitions for @serge-ivo/firestore-client
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreError = void 0;
// Error Types
class FirestoreError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "FirestoreError";
    }
}
exports.FirestoreError = FirestoreError;
