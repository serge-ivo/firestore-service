"use strict";
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
exports.ExampleEntity = void 0;
const firestoreModel_1 = require("../firestoreModel");
const firestoreService_1 = __importDefault(require("../firestoreService"));
class ExampleEntity extends firestoreModel_1.FirestoreModel {
    constructor(data, id) {
        super(id !== null && id !== void 0 ? id : ""); // Ensure Firestore ID is handled properly
        this.title = data.title;
        this.description = data.description;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.owner = data.owner;
    }
    /**
     * ✅ Constructs Firestore collection/document paths.
     */
    static buildPath(entityId) {
        return entityId ? `examples/${entityId}` : `examples`;
    }
    getDocPath() {
        if (!this.id)
            throw new Error("Cannot get document path before saving to Firestore");
        return ExampleEntity.buildPath(this.id);
    }
    getColPath() {
        return ExampleEntity.buildPath();
    }
    /**
     * ✅ Fetches an ExampleEntity by ID from Firestore.
     */
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const docData = yield firestoreService_1.default.getDocument(ExampleEntity.buildPath(id));
            return docData ? new ExampleEntity(docData, id) : null;
        });
    }
    /**
     * ✅ Saves or updates this entity in Firestore.
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.id) {
                const newId = yield firestoreService_1.default.addDocument(this.getColPath(), {
                    title: this.title,
                    description: this.description,
                    createdAt: this.createdAt,
                    updatedAt: this.updatedAt,
                    owner: this.owner,
                });
                if (!newId)
                    throw new Error("Failed to save ExampleEntity");
                this._setId(newId);
            }
            else {
                yield firestoreService_1.default.updateDocument(this.getDocPath(), {
                    title: this.title,
                    description: this.description,
                    updatedAt: new Date(),
                });
            }
            return this;
        });
    }
}
exports.ExampleEntity = ExampleEntity;
//# sourceMappingURL=ExampleEntity.js.map