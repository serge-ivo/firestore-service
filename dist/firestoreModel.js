"use strict";
// src/models/FirestoreModel.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreModel = void 0;
const firestoreService_1 = __importDefault(require("./firestoreService"));
class FirestoreModel {
    constructor(id) {
        this._id = id; // Optional, allowing Firestore to assign ID
    }
    get id() {
        return this._id;
    }
    /**
     * ✅ Cleans undefined values by converting them to `null` or removing them.
     */
    sanitizeData(data) {
        return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
    }
    /**
     * ✅ Updates this document in Firestore.
     */
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._id)
                throw new Error("Cannot update before saving to Firestore");
            Object.assign(this, data); // Apply changes to the instance
            yield firestoreService_1.default.updateDocument(this.getDocPath(), this.sanitizeData(this));
        });
    }
    /**
     * ✅ Deletes this document from Firestore.
     */
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._id)
                throw new Error("Cannot delete before saving to Firestore");
            yield firestoreService_1.default.deleteDocument(this.getDocPath());
        });
    }
    /**
     * ✅ Assigns Firestore ID after retrieval.
     */
    _setId(id) {
        this._id = id;
    }
    withId(id) {
        this._id = id;
        return this;
    }
    /**
     * ✅ Fetches a document from Firestore and instantiates the model.
     */
    static get(docPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const docData = yield firestoreService_1.default.getDocument(docPath);
            if (!docData)
                return null;
            console.log(`📄 Retrieved from Firestore: ${docPath}`, docData);
            const instance = new this(docData.data);
            instance._setId(docData.id);
            return instance;
        });
    }
    /**
     * ✅ Creates and saves a new Firestore document, returning an instance.
     */
    static create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = new this(data);
            const newId = yield firestoreService_1.default.addDocument(instance.getColPath(), instance);
            if (!newId)
                throw new Error("Failed to save to Firestore");
            instance._setId(newId);
            return instance;
        });
    }
}
exports.FirestoreModel = FirestoreModel;
//# sourceMappingURL=firestoreModel.js.map