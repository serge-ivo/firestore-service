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

// Utility Types
type WithId<T> = T & { id: string };
type WithOptionalId<T> = T & { id?: string };
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### Type Usage Examples

```typescript
// Using WithId type
interface User {
  name: string;
  email: string;
}

const user: WithId<User> = {
  id: "123",
  name: "John",
  email: "john@example.com",
};

// Using DeepPartial for updates
const updateData: DeepPartial<User> = {
  name: "John Updated",
};

// Using QueryOptions
const queryOpts: QueryOptions = {
  where: [{ field: "status", op: "==", value: "active" }],
  orderBy: [{ field: "createdAt", direction: "desc" }],
  limit: 10,
};
```

## Development

### Type Management

The library includes several npm scripts for type management:

```bash
# Check types without emitting files
npm run type:check

# Generate only type definition files
npm run type:build

# Watch mode for type generation (useful during development)
npm run type:watch

# Build everything (including types)
npm run build
```

### Updating Types

1. **Add New Types**:

   - Edit `src/types/index.ts`
   - Add your new type definitions
   - Export them from the types file

2. **Modify Existing Types**:

   - Locate the type in `src/types/index.ts`
   - Make your changes
   - Run `npm run type:check` to verify changes

3. **Publish Type Updates**:

   ```bash
   # Update version
   npm version patch  # or minor/major

   # Build and publish
   npm publish
   ```

### Type Categories

Types are organized into categories in `src/types/index.ts`:

- **Query Types**: For query operations and filters
- **Model Types**: Base types for Firestore documents
- **Service Types**: Configuration and service-related types
- **Field Value Types**: Types for Firestore field operations
- **Subscription Types**: Types for real-time subscriptions
- **Error Types**: Custom error types
- **Utility Types**: Helper types for common operations

## Features

### Core Features

- Automatic rate limiting and usage control
- Configurable document read/write limits
- Query result size restrictions
- Protection against costly recursive operations
- Batch operation size controls

### Developer Experience

- Simplified Firestore operations
- Full TypeScript support with comprehensive type definitions
- Works with both Firebase Admin SDK and Firebase Client SDK
- Built-in Firebase emulator support for testing

### Security & Monitoring

- Usage tracking and monitoring
- Automatic request throttling
- Customizable error handling for limit violations

## Usage

### Initialization

```typescript
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { FirestoreService } from "@serge-ivo/firestore-client";

// Initialize Firebase app with your config
const app = initializeApp({
  projectId: "your-project",
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  // ... other Firebase config options
});

// Initialize Firestore with persistent caching enabled
const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Initialize Firestore service with your Firebase app
FirestoreService.initialize(firestore);
```

This initialization code includes:

1. The necessary imports for the caching functionality
2. Initialization of Firestore with persistent local cache
3. Support for multiple tab management
4. Proper initialization of the FirestoreService with the configured Firestore instance

The persistent cache configuration will help improve your application's performance by:

- Enabling offline data persistence
- Allowing data sharing between multiple tabs
- Reducing unnecessary network requests
- Providing a better user experience with faster data access

### Basic Operations

```typescript
// Create a document
const docId = await FirestoreService.addDocument("users", {
  name: "John Doe",
  role: "user",
});

// Read a document
const user = await FirestoreService.getDocument("users/123");

// Update or create document with merge
await FirestoreService.setDocument(
  "users/123",
  {
    lastLogin: new Date(),
  },
  { merge: true }
);

// Update specific fields
await FirestoreService.updateDocument("users/123", {
  lastLogin: new Date(),
});

// Delete a document
await FirestoreService.deleteDocument("users/123");

// Delete an entire collection
await FirestoreService.deleteCollection("users");
```

### Working with Collections

```typescript
// Get collection reference with type safety
const usersCollection = FirestoreService.collection<UserType>("users");

// Get document reference with type safety
const userDoc = FirestoreService.doc<UserType>("users/123");

// Subscribe to document changes
const unsubscribe = FirestoreService.subscribeToDocument<UserType>(
  "users/123",
  (user) => {
    if (user) {
      console.log("User updated:", user);
    }
  }
);

// Subscribe to collection changes
const unsubscribeCollection = FirestoreService.subscribeToCollection<UserType>(
  "users",
  (users) => {
    console.log("Users updated:", users);
  }
);

// Don't forget to unsubscribe when done
unsubscribe();
unsubscribeCollection();
```

### Authentication

```typescript
import { initializeApp } from "firebase/app";
import { AuthService } from "@serge-ivo/firestore-client";

// Initialize Firebase app first
const app = initializeApp({
  // Your Firebase config
});

// Initialize AuthService with your Firebase app
AuthService.initialize(app);

// Sign in with Google
const user = await AuthService.signInWithGoogle();

// Sign in with email/password
const user = await AuthService.signInWithEmailPassword(
  "user@example.com",
  "password"
);

// Listen to auth state changes
const unsubscribe = AuthService.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in:", user);
  } else {
    console.log("User is signed out");
  }
});

// Sign out
await AuthService.signOut();
```

### Advanced Features

#### Batch Operations

```typescript
// Start a batch
const batch = FirestoreService.getBatch();

// Add operations to the batch
FirestoreService.updateInBatch(batch, "users/123", {
  title: "Updated Title",
  updatedAt: new Date(),
});

FirestoreService.setInBatch(batch, "users/456", newData, { merge: true });
FirestoreService.deleteInBatch(batch, "users/789");

// Commit the batch
await batch.commit();
```

#### Field Value Operations

```typescript
// Array operations
const { arrayUnion, arrayRemove } = FirestoreService.getFieldValue();

// Add tags to an array
await FirestoreService.updateDocument("users/123", {
  tags: arrayUnion("firebase", "tutorial"),
});

// Remove tags from an array
await FirestoreService.updateDocument("users/123", {
  tags: arrayRemove("firebase"),
});

// Delete a field
await FirestoreService.updateDocument("users/123", {
  description: FirestoreService.deleteField(),
});
```

#### Real-time Updates

```typescript
// Subscribe to a single document
const unsubscribeDoc = FirestoreService.subscribeToDocument<UserType>(
  "users/123",
  (updatedData) => {
    if (updatedData) {
      console.log("Document changed:", updatedData);
    } else {
      console.log("Document was deleted");
    }
  }
);

// Subscribe to a collection
const unsubscribeCollection = FirestoreService.subscribeToCollection<UserType>(
  "users",
  (allDocs) => {
    console.log("Collection changed. Current docs:", allDocs);
  }
);

// Don't forget to unsubscribe when done
unsubscribeDoc();
unsubscribeCollection();
```

### Best Practices

1. **Use Type Safety**

   ```typescript
   interface UserType {
     name: string;
     role: string;
     lastLogin?: Date;
   }

   // All operations will now be type-safe
   const user = await FirestoreService.getDocument<UserType>("users/123");
   ```

2. **Handle Rate Limits**

   ```typescript
   try {
     await FirestoreService.addDocument("users", userData);
   } catch (error) {
     // RequestLimiter will throw if limits are exceeded
     console.error("Request limit exceeded, try again later");
   }
   ```

3. **Use Emulators for Testing**

   ```typescript
   if (process.env.NODE_ENV === "development") {
     // Connect to Firestore emulator
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

5. **Batch Operations for Better Performance**
   ```typescript
   // Delete all documents in a collection
   await FirestoreService.deleteCollection("users");
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
