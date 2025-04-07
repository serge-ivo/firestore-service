// tests/QueryableEntity.test.ts

import { getApp, deleteApp, initializeApp } from "firebase/app";
import FirestoreService from "../src/firestoreService";
import {
  QueryableEntity,
  QueryableEntityData,
} from "../src/examples/QueryableEntity";
import { getFirestore } from "firebase/firestore";
jest.setTimeout(20000);

// 1️⃣ Global init + emulator connection
beforeAll(() => {
  const app = initializeApp({
    apiKey: "test-api-key",
    authDomain: "test-auth-domain",
    projectId: "test-project-id", // must match your emulator config
    storageBucket: "test-storage-bucket",
    messagingSenderId: "test-messaging-sender-id",
    appId: "test-app-id",
  });

  // Initialize Firestore with the Firebase app
  const firestore = getFirestore(app);
  FirestoreService.initialize(firestore);
  FirestoreService.connectEmulator(9098);
});

// 2️⃣ Global teardown
afterAll(async () => {
  await deleteApp(getApp());
});

describe("QueryableEntity", () => {
  const userId = "test-user-123";
  const testData: QueryableEntityData[] = [
    {
      userId,
      status: "active",
      category: "work",
      createdAt: new Date(2024, 2, 1),
    },
    {
      userId,
      status: "active",
      category: "personal",
      createdAt: new Date(2024, 2, 15),
    },
    {
      userId,
      status: "inactive",
      category: "work",
      createdAt: new Date(2024, 2, 10),
    },
    {
      userId,
      status: "active",
      category: "work",
      createdAt: new Date(2024, 2, 20),
    },
  ];

  // Before each test, insert the test docs
  beforeEach(async () => {
    for (const data of testData) {
      await QueryableEntity.create(data);
    }
  });

  // After each test, clean up
  afterEach(async () => {
    // We can’t just call entity.id if we never stored it,
    // so we rely on queries or build a new instance to get the doc path.
    // Alternatively, we could store the IDs in an array.
    // For simplicity, let's query and delete each matching doc.

    const colPath = `users/${userId}/items`;
    const snapshot = await FirestoreService.fetchCollection<QueryableEntity>(
      colPath
    );

    // Each doc is just raw data. We'll reconstruct enough to get the doc path
    // if needed, or directly delete via doc path if you have it.
    // Another approach is to run deleteCollection or a query to get doc refs.
    // For brevity, let's do a quick approach:
    for (const docData of snapshot) {
      // docData won't have .getDocPath() since it's plain data. If you want
      // to keep them as model instances, you can use `subscribeToCollection2`
      // or `queryCollection(QueryableEntity,...)`.
      // Let's do a simpler approach: delete the entire collection.
      // But that might delete docs not in testData.
      // If you only ever store test data in this userId, it's fine.
      // Or if you want partial approach:
      // await FirestoreService.deleteDocument(`${colPath}/${docId}`);
    }
    // Alternatively:
    await FirestoreService.deleteCollection(colPath);
  });

  it("should find entities by status", async () => {
    const activeItems = await QueryableEntity.findByStatus(userId, "active");
    expect(activeItems).toHaveLength(3);

    const inactiveItems = await QueryableEntity.findByStatus(
      userId,
      "inactive"
    );
    expect(inactiveItems).toHaveLength(1);
  });

  it("should find entities by status and category", async () => {
    const activeWorkItems = await QueryableEntity.findByStatusAndCategory(
      userId,
      "active",
      "work"
    );
    expect(activeWorkItems).toHaveLength(2);

    const inactivePersonalItems = await QueryableEntity.findByStatusAndCategory(
      userId,
      "inactive",
      "personal"
    );
    expect(inactivePersonalItems).toHaveLength(0);
  });

  it("should find recent active items ordered by creation date", async () => {
    const recentItems = await QueryableEntity.findRecentActiveItems(userId);
    expect(recentItems).toHaveLength(3);
    // Check descending
    const timestamps = recentItems.map((r) => r.createdAt.getTime());
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });

  it("should find recent active items with category filter", async () => {
    const recentWorkItems = await QueryableEntity.findRecentActiveItems(
      userId,
      "work"
    );
    expect(recentWorkItems).toHaveLength(2);

    // Confirm each is 'active' & 'work'
    expect(
      recentWorkItems.every(
        (item) => item.status === "active" && item.category === "work"
      )
    ).toBe(true);

    // Check descending
    const timestamps = recentWorkItems.map((r) => r.createdAt.getTime());
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });

  it("should respect the maxResults limit", async () => {
    const limitedItems = await QueryableEntity.findRecentActiveItems(
      userId,
      undefined,
      2
    );
    expect(limitedItems).toHaveLength(2);

    // Confirm each is 'active'
    expect(limitedItems.every((item) => item.status === "active")).toBe(true);

    // Check descending
    const timestamps = limitedItems.map((r) => r.createdAt.getTime());
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });
});
