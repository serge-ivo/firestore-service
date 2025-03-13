"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("firebase/firestore");
const createFirestoreDataConverter = () => ({
    toFirestore: (data) => {
        const transformDates = (obj) => {
            if (obj === null || obj === undefined)
                return undefined; // Ensure undefined is not stored
            if (obj instanceof Date)
                return firestore_1.Timestamp.fromDate(obj); // Convert Date to Timestamp
            if (obj instanceof firestore_1.Timestamp)
                return obj; // Pass through Timestamp as-is
            if (Array.isArray(obj))
                return obj.map(transformDates).filter(val => val !== undefined);
            if (typeof obj === 'object') {
                return Object.keys(obj).reduce((acc, key) => {
                    const transformedValue = transformDates(obj[key]);
                    if (transformedValue !== undefined)
                        acc[key] = transformedValue; // Filter out undefined values
                    return acc;
                }, {});
            }
            return obj;
        };
        return transformDates(data) || {}; // Ensure Firestore gets a valid object
    },
    fromFirestore: (snapshot, options) => {
        const transformTimestamps = (obj) => {
            if (obj === null || obj === undefined)
                return obj;
            if (obj instanceof firestore_1.Timestamp)
                return obj.toDate(); // Convert Timestamp to Date
            if (Array.isArray(obj))
                return obj.map(transformTimestamps);
            if (typeof obj === 'object') {
                return Object.keys(obj).reduce((acc, key) => {
                    acc[key] = transformTimestamps(obj[key]);
                    return acc;
                }, {});
            }
            return obj;
        };
        const data = snapshot.data(options);
        return Object.assign(Object.assign({}, transformTimestamps(data)), { id: snapshot.id });
    }
});
exports.default = createFirestoreDataConverter;
//# sourceMappingURL=FirestoreDataConverter.js.map