"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RequestLimiter {
    static logGeneralRequest() {
        const now = Date.now();
        RequestLimiter.requestTimestamps.push(now);
        // Remove timestamps older than 1 minute
        RequestLimiter.requestTimestamps = RequestLimiter.requestTimestamps.filter(timestamp => now - timestamp < 60000);
        if (RequestLimiter.requestTimestamps.length > RequestLimiter.maxRequestsPerMinute) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
    }
    static logSpecificRequest(log, path, maxRequests) {
        const now = Date.now();
        if (!log.has(path)) {
            log.set(path, []);
        }
        const timestamps = log.get(path);
        timestamps.push(now);
        // Remove timestamps older than 1 minute
        log.set(path, timestamps.filter(timestamp => now - timestamp < 60000));
        if (timestamps.length > maxRequests) {
            throw new Error(`Rate limit exceeded for path: ${path}. Please try again later.`);
        }
    }
    static logDocumentRequest(docPath) {
        RequestLimiter.logSpecificRequest(RequestLimiter.documentRequestLog, docPath, RequestLimiter.maxDocumentRequestsPerMinute);
    }
    static logCollectionFetchRequest(collectionPath) {
        RequestLimiter.logSpecificRequest(RequestLimiter.collectionFetchRequestLog, collectionPath, RequestLimiter.maxCollectionFetchRequestsPerMinute);
    }
    static logSubscriptionRequest(subPath) {
        RequestLimiter.logSpecificRequest(RequestLimiter.subscriptionRequestLog, subPath, RequestLimiter.maxSubscriptionRequestsPerMinute);
    }
}
RequestLimiter.requestTimestamps = [];
RequestLimiter.maxRequestsPerMinute = 500;
RequestLimiter.documentRequestLog = new Map();
RequestLimiter.collectionFetchRequestLog = new Map();
RequestLimiter.subscriptionRequestLog = new Map();
RequestLimiter.maxDocumentRequestsPerMinute = 30;
RequestLimiter.maxSubscriptionRequestsPerMinute = 30;
RequestLimiter.maxCollectionFetchRequestsPerMinute = 20;
exports.default = RequestLimiter;
//# sourceMappingURL=RequestLimiter.js.map