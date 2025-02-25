// RequestLimiter.ts
type RequestLog = Map<string, number[]>

class RequestLimiter {
  private static requestTimestamps: number[] = []
  private static maxRequestsPerMinute = 500
  private static documentRequestLog: RequestLog = new Map()
  private static collectionFetchRequestLog: RequestLog = new Map()
  private static subscriptionRequestLog: RequestLog = new Map()
  private static maxDocumentRequestsPerMinute = 30
  private static maxSubscriptionRequestsPerMinute = 30
  private static maxCollectionFetchRequestsPerMinute = 20

  public static logGeneralRequest(): void {
    const now = Date.now()
    RequestLimiter.requestTimestamps.push(now)

    // Remove timestamps older than 1 minute
    RequestLimiter.requestTimestamps = RequestLimiter.requestTimestamps.filter(
      timestamp => now - timestamp < 60000
    )

    if (RequestLimiter.requestTimestamps.length > RequestLimiter.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
  }

  private static logSpecificRequest(log: RequestLog, path: string, maxRequests: number): void {
    const now = Date.now()
    if (!log.has(path)) {
      log.set(path, [])
    }

    const timestamps = log.get(path)!
    timestamps.push(now)

    // Remove timestamps older than 1 minute
    log.set(
      path,
      timestamps.filter(timestamp => now - timestamp < 60000)
    )

    if (timestamps.length > maxRequests) {
      throw new Error(`Rate limit exceeded for path: ${path}. Please try again later.`)
    }
  }

  static logDocumentRequest(docPath: string): void {
    RequestLimiter.logSpecificRequest(
      RequestLimiter.documentRequestLog,
      docPath,
      RequestLimiter.maxDocumentRequestsPerMinute
    )
  }

  static logCollectionFetchRequest(collectionPath: string): void {
    RequestLimiter.logSpecificRequest(
      RequestLimiter.collectionFetchRequestLog,
      collectionPath,
      RequestLimiter.maxCollectionFetchRequestsPerMinute
    )
  }

  static logSubscriptionRequest(subPath: string): void {
    RequestLimiter.logSpecificRequest(
      RequestLimiter.subscriptionRequestLog,
      subPath,
      RequestLimiter.maxSubscriptionRequestsPerMinute
    )
  }
}

export default RequestLimiter
