# @serge-ivo/firestore-client

A TypeScript/JavaScript library that provides controlled and cost-effective Firestore data management. This library helps prevent abuse and excessive costs in your Firebase applications by implementing configurable rate limiting and usage controls.

## Why Use This Library?

- **Cost Control**: Prevents unexpected Firebase costs by limiting the number of reads and writes
- **Abuse Prevention**: Protects your application from potential abuse by implementing query limits
- **Safe Development**: Helps maintain controlled usage during development and testing
- **Configurable Limits**: Set custom thresholds for:
  - Number of documents read/written per request
  - Query result size limits
  - Rate limiting for operations
  - Batch operation size controls

## Installation

```bash
npm install @serge-ivo/firestore-client
# or
yarn add @serge-ivo/firestore-client
```

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

## API Reference

### Core Methods

#### Initialization

```typescript
// Initialize Firestore service
static initialize(db: Firestore): void

// Connect to Firestore emulator
static connectEmulator(firestoreEmulatorPort: number): void
```

#### Document Operations

```typescript
// Get a single document
static async getDocument<T>(docPath: string): Promise<T | null>

// Add a new document
static async addDocument<T>(collectionPath: string, data: T): Promise<string | undefined>

// Update a document
static async updateDocument(docPath: string, data: Record<string, any>): Promise<void>

// Set a document (create or update)
static async setDocument<T>(docPath: string, data: T, options: { merge?: boolean } = { merge: true }): Promise<void>

// Delete a document
static async deleteDocument(docPath: string): Promise<void>

// Delete an entire collection
static async deleteCollection(collectionPath: string): Promise<void>
```

#### Collection Operations

```typescript
// Fetch collection with query constraints
static async fetchCollection<T>(path: string, ...queryConstraints: QueryConstraint[]): Promise<T[]>

// Query collection with options
static async queryCollection<T>(
  model: new (data: any, id?: string) => T,
  path: string,
  options?: QueryOptions
): Promise<T[]>
```

#### Real-time Subscriptions

```typescript
// Subscribe to document changes
static subscribeToDocument<T>(
  docPath: string,
  callback: (data: T | null) => void
): () => void

// Subscribe to collection changes
static subscribeToCollection<T>(
  collectionPath: string,
  callback: (data: T[]) => void
): () => void

// Subscribe to collection with model instantiation
static subscribeToCollection2<T extends FirestoreModel>(
  model: new (data: any) => T,
  collectionPath: string,
  callback: (data: T[]) => void
): () => void
```

#### Batch Operations

```typescript
// Get a new batch
static getBatch(): WriteBatch

// Update document in batch
static updateInBatch(
  batch: WriteBatch,
  docPath: string,
  data: { [key: string]: FieldValue | Partial<unknown> | undefined }
): void

// Set document in batch
static setInBatch<T>(
  batch: WriteBatch,
  docPath: string,
  data: T,
  options: SetOptions = {}
): void

// Delete document in batch
static deleteInBatch(batch: WriteBatch, docPath: string): void
```

#### Field Value Operations

```typescript
// Get field value operations
static getFieldValue(): {
  arrayUnion: (...elements: any[]) => FieldValue;
  arrayRemove: (...elements: any[]) => FieldValue;
  increment: (n: number) => FieldValue;
  serverTimestamp: () => FieldValue;
}

// Get timestamp
static getTimestamp(): Timestamp

// Get delete field operation
static deleteField(): FieldValue
```

## Usage Examples

### Basic Document Operations

```typescript
// Initialize
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { FirestoreService } from "@serge-ivo/firestore-client";

const app = initializeApp({
  projectId: "your-project",
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
});

const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

FirestoreService.initialize(firestore);

// Create a document
const docId = await FirestoreService.addDocument("users", {
  name: "John Doe",
  email: "john@example.com",
});

// Read a document
const user = await FirestoreService.getDocument("users/123");

// Update a document
await FirestoreService.updateDocument("users/123", {
  lastLogin: new Date(),
});

// Delete a document
await FirestoreService.deleteDocument("users/123");
```

### Collection Queries

```typescript
// Query with filters
const activeUsers = await FirestoreService.queryCollection(User, "users", {
  where: [{ field: "status", op: "==", value: "active" }],
  orderBy: [{ field: "createdAt", direction: "desc" }],
  limit: 10,
});

// Fetch with constraints
const recentPosts = await FirestoreService.fetchCollection<Post>(
  "posts",
  where("published", "==", true),
  orderBy("createdAt", "desc"),
  limit(5)
);
```

### Real-time Subscriptions

```typescript
// Subscribe to document
const unsubscribeDoc = FirestoreService.subscribeToDocument<User>(
  "users/123",
  (user) => {
    if (user) {
      console.log("User updated:", user);
    }
  }
);

// Subscribe to collection
const unsubscribeCollection = FirestoreService.subscribeToCollection2(
  User,
  "users",
  (users) => {
    console.log("Users updated:", users);
  }
);

// Clean up subscriptions
unsubscribeDoc();
unsubscribeCollection();
```

### Batch Operations

```typescript
// Create a batch
const batch = FirestoreService.getBatch();

// Add operations to batch
FirestoreService.updateInBatch(batch, "users/123", {
  lastLogin: new Date(),
});

FirestoreService.setInBatch(batch, "users/456", {
  name: "New User",
  email: "new@example.com",
});

FirestoreService.deleteInBatch(batch, "users/789");

// Commit the batch
await batch.commit();
```

### Field Value Operations

```typescript
const { arrayUnion, arrayRemove, increment, serverTimestamp } =
  FirestoreService.getFieldValue();

// Update array fields
await FirestoreService.updateDocument("users/123", {
  tags: arrayUnion("new-tag"),
  favorites: arrayRemove("old-favorite"),
  points: increment(10),
  lastUpdated: serverTimestamp(),
});
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

MIT © Serge Ivo
