declare class RequestLimiter {
    private static requestTimestamps;
    private static maxRequestsPerMinute;
    private static documentRequestLog;
    private static collectionFetchRequestLog;
    private static subscriptionRequestLog;
    private static maxDocumentRequestsPerMinute;
    private static maxSubscriptionRequestsPerMinute;
    private static maxCollectionFetchRequestsPerMinute;
    static logGeneralRequest(): void;
    private static logSpecificRequest;
    static logDocumentRequest(docPath: string): void;
    static logCollectionFetchRequest(collectionPath: string): void;
    static logSubscriptionRequest(subPath: string): void;
}
export default RequestLimiter;
