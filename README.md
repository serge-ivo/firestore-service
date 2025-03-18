# @serge-ivo/firestore-client

A TypeScript/JavaScript library for simplified Firestore data management.

## Installation

```bash
npm install @serge-ivo/firestore-client
# or
yarn add @serge-ivo/firestore-client
```

## Features

- Simplified Firestore operations
- TypeScript support with full type definitions
- Works with both Firebase Admin SDK and Firebase Client SDK
- Built-in Firebase emulator support for testing

## Usage

```typescript
import { FirestoreService } from '@serge-ivo/firestore-client';

// Initialize your service
const firestoreService = new FirestoreService();

// Use the service methods
// (Documentation for specific methods coming soon)
```

## Development

1. Clone the repository:
```bash
git clone https://github.com/serge-ivo/firestore-service.git
```

2. Install dependencies:
```bash
yarn install
```

3. Run tests (requires Firebase emulators):
```bash
yarn test
```

4. Build the package:
```bash
yarn build
```

## Testing

Tests are run against Firebase emulators. To run the test suite:

1. Start the emulators:
```bash
yarn start:emulators
```

2. In a separate terminal, run the tests:
```bash
yarn test
```

## License

MIT © Serge Ivo

