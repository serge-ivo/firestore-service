"use strict";
// src/models/FirestoreModel.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreModel = void 0;
// import { FirestoreService } from "./firestoreService"; // No longer needed here
class FirestoreModel {
    // Constructor no longer needs FirestoreService
    // Accepts data object containing properties and potentially an ID
    constructor(data) {
        // Assign properties from data, including the ID if present
        Object.assign(this, data);
        // Ensure id is directly assigned if it exists in data, potentially overwriting if Object.assign didn't handle the getter/setter correctly initially.
        // It's cleaner to just rely on Object.assign if the target properties are simple.
        // We make `id` readonly, so it can only be set here.
        if ("id" in data && data.id !== undefined) {
            this.id = data.id;
        }
        else {
            // If data didn't contain an id (e.g., initial creation before saving),
            // this.id remains undefined as initialized by the property declaration.
        }
    }
}
exports.FirestoreModel = FirestoreModel;
