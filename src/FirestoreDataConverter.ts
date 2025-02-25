import {
  FirestoreDataConverter,
  Timestamp,
  WithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData
} from 'firebase/firestore'

const createFirestoreDataConverter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: WithFieldValue<T>): DocumentData => {
    const transformDates = (obj: any): any => {
      if (obj === null || obj === undefined) return undefined // Ensure undefined is not stored
      if (obj instanceof Date) return Timestamp.fromDate(obj) // Convert Date to Timestamp
      if (obj instanceof Timestamp) return obj // Pass through Timestamp as-is
      if (Array.isArray(obj)) return obj.map(transformDates).filter(val => val !== undefined)
      if (typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
          const transformedValue = transformDates(obj[key])
          if (transformedValue !== undefined) acc[key] = transformedValue // Filter out undefined values
          return acc
        }, {} as any)
      }
      return obj
    }

    return transformDates(data) || {} // Ensure Firestore gets a valid object
  },

  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T => {
    const transformTimestamps = (obj: any): any => {
      if (obj === null || obj === undefined) return obj
      if (obj instanceof Timestamp) return obj.toDate() // Convert Timestamp to Date
      if (Array.isArray(obj)) return obj.map(transformTimestamps)
      if (typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
          acc[key] = transformTimestamps(obj[key])
          return acc
        }, {} as any)
      }
      return obj
    }

    const data = snapshot.data(options)
    return { ...transformTimestamps(data), id: snapshot.id } as T
  }
})

export default createFirestoreDataConverter
