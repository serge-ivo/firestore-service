# @serge-ivo/firestore-client

A TypeScript/JavaScript library that provides controlled and cost-effective Firestore data management. This library helps prevent abuse and excessive costs in your Firebase applications by implementing configurable rate limiting and usage controls.

**Note:** This library requires instantiation. You must create an instance of `FirestoreService` by passing it a configured Firestore `db` object.

## Why Use This Library?

- **Cost Control**: Prevents unexpected Firebase costs by limiting the number of reads and writes (via `RequestLimiter`, requires separate configuration).
- **Abuse Prevention**: Protects your application from potential abuse by implementing query limits (partially via `QueryOptions` limit, more robust prevention via `RequestLimiter`).
- **Clear Structure**: Provides a consistent, instance-based API for Firestore operations.
- **Type Safety**: Leverages TypeScript for improved development experience.

## Installation

```bash
npm install @serge-ivo/firestore-client firebase
# or
yarn add @serge-ivo/firestore-client firebase
```

## Basic Setup & Usage

1.  **Initialize Firebase and get the `db` object:**

    ```typescript
    // Example: src/firebase.ts
    import { initializeApp } from "firebase/app";
    import { getFirestore, Firestore } from "firebase/firestore";

    const firebaseConfig = {
      // Your Firebase config details here
      apiKey: "...",
      authDomain: "...",
      projectId: "...",
      // ...etc
    };

    const app = initializeApp(firebaseConfig);
    export const db: Firestore = getFirestore(app);
    ```

2.  **Create a `FirestoreService` instance:**

    It's recommended to create a single instance (singleton) and export it for use throughout your application.

    ```typescript
    // Example: src/firestore.ts or integrate into src/firebase.ts
    import { db } from "./firebase"; // Import the db instance
    import { FirestoreService } from "@serge-ivo/firestore-client";

    // Create and export the service instance
    export const firestoreService = new FirestoreService(db);
    ```

3.  **Use the instance in your application:**

    ```typescript
    // Example: In a React component or service file
    import { firestoreService } from "../firestore"; // Adjust path as needed
    import { useEffect, useState } from "react";

    interface UserData {
      // Use an interface for the data shape
      name: string;
      email: string;
    }

    function UserProfile({ userId }: { userId: string }) {
      // State holds the plain data object (or null)
      const [user, setUser] = useState<UserData | null>(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchUser = async () => {
          setLoading(true);
          try {
            // Use the service instance methods, specifying the expected data type
            const userData = await firestoreService.getDocument<UserData>(
              `users/${userId}` // Construct path manually or use a model/helper
            );
            setUser(userData); // The fetched data (with ID added by converter) is stored
          } catch (error) {
            console.error("Failed to fetch user:", error);
          }
          setLoading(false);
        };
        fetchUser();
      }, [userId]);

      if (loading) return <p>Loading...</p>;
      if (!user) return <p>User not found.</p>;

      return (
        <div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          {/* If user object had id: <p>ID: {user.id}</p> */}
        </div>
      );
    }
    ```

## API Reference

All methods (except utility methods like `getTimestamp`) are now **instance methods** called on your created `firestoreService` instance.

### Constructor

```typescript
// Create a new service instance
constructor(db: Firestore)
```

### Document Operations

```typescript
// Get a single document
async getDocument<T>(docPath: string): Promise<T | null>

// Add a new document
async addDocument<T>(collectionPath: string, data: T): Promise<string | undefined>

// Update a document
async updateDocument(docPath: string, data: Record<string, any>): Promise<void>

// Set a document (create or overwrite)
async setDocument<T>(docPath: string, data: T, options?: { merge?: boolean }): Promise<void>

// Delete a document
async deleteDocument(docPath: string): Promise<void>

// Delete an entire collection (use with caution!)
async deleteCollection(collectionPath: string): Promise<void>
```

### Collection Operations

```typescript
// Fetch collection with native Firestore query constraints
async fetchCollection<T>(path: string, ...queryConstraints: QueryConstraint[]): Promise<T[]>

// Query collection with structured options object
async queryCollection<T>(collectionPath: string, options?: QueryOptions): Promise<T[]>
```

_Note: `QueryOptions` allows `where`, `orderBy`, `limit`, `startAfter`, `endBefore`._

### Real-time Subscriptions

```typescript
// Subscribe to document changes
subscribeToDocument<T>(docPath: string, callback: (data: T | null) => void): () => void

// Subscribe to collection changes (raw data)
subscribeToCollection<T>(collectionPath: string, callback: (data: T[]) => void): () => void

// Subscribe to collection with FirestoreModel subclass instantiation
subscribeToCollection2<T extends FirestoreModel>(model: new (...args: any[]) => T, collectionPath: string, callback: (data: T[]) => void): () => void
```

### Batch Operations

```typescript
// Get a new batch instance associated with this service's db
getBatch(): WriteBatch

// Add an update operation to a batch
updateInBatch(batch: WriteBatch, docPath: string, data: { [key: string]: FieldValue | Partial<unknown> | undefined }): void

// Add a set operation to a batch
setInBatch<T>(batch: WriteBatch, docPath: string, data: T, options?: SetOptions): void

// Add a delete operation to a batch
deleteInBatch(batch: WriteBatch, docPath: string): void
```

### Static Utility Methods

These can still be called directly on the `FirestoreService` class.

```typescript
// Get field value constants like arrayUnion, arrayRemove
static getFieldValue(): { arrayUnion: ..., arrayRemove: ... }

// Get a server timestamp
static getTimestamp(): Timestamp

// Get the sentinel value for deleting a field
static deleteField(): FieldValue
```

## FirestoreModel Base Class (Simplified)

The library includes a base class `FirestoreModel` (`src/firestoreModel.ts`) that can be extended. In the current design, its primary purpose is:

1.  **Defining Data Structure:** Child classes define the properties of your entity.
2.  **Encapsulating Path Logic:** Child classes **must** implement `getDocPath()` and `getColPath()` to define how Firestore paths are constructed for that entity type.

Models **do not** handle persistence directly (no `save`, `update`, `delete` methods). All persistence operations are performed using the `firestoreService` instance.

**Example Definition:**

```typescript
// src/models/ExampleEntity.ts
import { FirestoreModel } from "@serge-ivo/firestore-client";

// Interface for the raw data shape
export interface ExampleData {
  title: string;
  description: string;
  owner: string;
  // Timestamps (createdAt, updatedAt) can be handled by Firestore
  // ID is handled automatically by the service/converter and base class
}

export class ExampleEntity extends FirestoreModel {
  // Declare properties for type safety
  title!: string;
  description!: string;
  owner!: string;
  createdAt!: Date; // Assuming converter handles Timestamp -> Date
  updatedAt!: Date;

  // Constructor accepts the data object (including optional id from converter)
  constructor(data: { id?: string } & Partial<ExampleData>) {
    super(data); // Passes data up to base class (which assigns properties)
  }

  // --- Path Logic Implementation ---
  static buildPath(id?: string): string {
    return id ? `examples/${id}` : `examples`;
  }

  getDocPath(): string {
    if (!this.id) throw new Error("Cannot get doc path without ID.");
    return ExampleEntity.buildPath(this.id);
  }

  getColPath(): string {
    return ExampleEntity.buildPath();
  }
}
```

**Example Usage with Service:**

```typescript
import { firestoreService } from "../firestore";
import { ExampleEntity, ExampleData } from "../models/ExampleEntity";

async function workWithExamples() {
  // 1. Create data using the service
  const newData: ExampleData = {
    title: "New Example",
    description: "Desc",
    owner: "me",
  };
  const newId = await firestoreService.addDocument<ExampleData>(
    ExampleEntity.buildPath(), // Use static path builder for collection
    newData
  );
  if (!newId) return;
  console.log("Created document with ID:", newId);

  // 2. Fetch data using the service
  const fetchedData = await firestoreService.getDocument<
    ExampleData & { id: string }
  >(
    ExampleEntity.buildPath(newId) // Use static path builder for document
  );

  if (fetchedData) {
    // 3. Optionally instantiate the model if needed for path logic or other methods
    const exampleInstance = new ExampleEntity(fetchedData);

    console.log("Fetched Title:", exampleInstance.title);
    console.log("Instance ID:", exampleInstance.id);
    console.log("Document Path:", exampleInstance.getDocPath());

    // 4. Update using the service, providing the path and partial data
    await firestoreService.updateDocument(exampleInstance.getDocPath(), {
      description: "Updated Description",
    });

    // 5. Delete using the service, providing the path
    await firestoreService.deleteDocument(exampleInstance.getDocPath());
    console.log("Document deleted.");
  }
}
```

## Request Limiter (Optional)

The `RequestLimiter` class (`src/RequestLimiter.ts`) is included but currently acts mostly as a placeholder or basic logger. To implement actual rate limiting or cost control, you would need to significantly enhance this class or integrate a more robust external library.

## Type System

The library provides comprehensive TypeScript types for all operations. Here's how to work with types:

### Available Types

```typescript
// Query Types
type FilterOperator =
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

interface WhereClause {
  field: string;
  op: FilterOperator;
  value: any;
}

interface OrderByClause {
  field: string;
  direction?: "asc" | "desc";
}

interface QueryOptions {
  where?: WhereClause[];
  orderBy?: OrderByClause[];
  limit?: number;
}

// Model Types
interface FirestoreData {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Service Types
interface FirestoreServiceConfig {
  maxBatchSize?: number;
  maxQueryLimit?: number;
  enablePersistence?: boolean;
}

// Utility Types
type WithId<T> = T & { id: string };
type WithOptionalId<T> = T & { id?: string };
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

## Best Practices

1. **Use Type Safety**

   ```typescript
   interface User {
     name: string;
     email: string;
     lastLogin?: Date;
   }

   const user = await FirestoreService.getDocument<User>("users/123");
   ```

2. **Handle Rate Limits**

   ```typescript
   try {
     await FirestoreService.addDocument("users", userData);
   } catch (error) {
     console.error("Request limit exceeded:", error);
   }
   ```

3. **Use Emulators for Testing**

   ```typescript
   if (process.env.NODE_ENV === "development") {
     FirestoreService.connectEmulator(9098);
   }
   ```

4. **Clean Up Subscriptions**

   ```typescript
   class MyComponent {
     private unsubscribe?: () => void;

     onMount() {
       this.unsubscribe = FirestoreService.subscribeToDocument(...);
     }

     onUnmount() {
       this.unsubscribe?.();
     }
   }
   ```

5. **Use Batch Operations for Better Performance**
   ```typescript
   const batch = FirestoreService.getBatch();
   // Add multiple operations
   await batch.commit();
   ```

## Testing

This library uses Jest for testing. Tests are run against the Firebase Emulator Suite.

1. Start the Firebase emulators:

   ```bash
   npm run start:emulators
   ```

2. In a separate terminal, run the tests:
   ```bash
   npm test
   ```

The tests will verify core functionality including:

- Document operations (create, read, update, delete)
- Collection queries
- Batch operations
- Rate limiting and usage controls

## License

[MIT](./LICENSE)
