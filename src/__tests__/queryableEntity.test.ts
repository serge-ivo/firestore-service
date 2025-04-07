// tests/QueryableEntity.test.ts

import { firestoreService } from "./setup"; // Import the instance
import {
  QueryableEntityData,
  // QueryableEntity removed as it's not instantiated directly in tests anymore
} from "../examples/QueryableEntity";
import { Timestamp } from "firebase/firestore"; // Import Timestamp for date handling

const userId = "test-user-queries";
const subcollectionPath = `users/${userId}/items`;

// Define shared test data to be created before each test
const now = Date.now();
const testDocuments: QueryableEntityData[] = [
  {
    userId,
    status: "active",
    category: "catA",
    createdAt: new Date(now - 2 * 86400000),
  }, // Doc 1 (oldest)
  {
    userId,
    status: "active",
    category: "catB",
    createdAt: new Date(now - 1 * 86400000),
  }, // Doc 2
  { userId, status: "inactive", category: "catA", createdAt: new Date(now) }, // Doc 3 (inactive)
  {
    userId,
    status: "active",
    category: "catA",
    createdAt: new Date(now + 1 * 86400000),
  }, // Doc 4
  {
    userId,
    status: "active",
    category: "catC",
    createdAt: new Date(now + 2 * 86400000),
  }, // Doc 5 (newest)
];

describe("🔥 FirestoreService - Querying Subcollections (QueryableEntity)", () => {
  // Setup: Clean and populate the subcollection before each test
  beforeEach(async () => {
    // 1. Clean up existing test documents
    const docs = await firestoreService.fetchCollection<{ id: string }>(
      subcollectionPath
    );
    for (const doc of docs) {
      await firestoreService.deleteDocument(`${subcollectionPath}/${doc.id}`);
    }

    // 2. Add fresh test documents
    for (const data of testDocuments) {
      await firestoreService.addDocument(subcollectionPath, data);
    }
  });

  it("should find entities by status", async () => {
    const activeEntities =
      await firestoreService.queryCollection<QueryableEntityData>(
        subcollectionPath,
        { where: [{ field: "status", op: "==", value: "active" }] }
      );
    // Expect Docs 1, 2, 4, 5
    expect(activeEntities).toHaveLength(4);
    expect(activeEntities.every((doc) => doc.status === "active")).toBe(true);
  });

  it("should find entities by status and category", async () => {
    const entities =
      await firestoreService.queryCollection<QueryableEntityData>(
        subcollectionPath,
        {
          where: [
            { field: "status", op: "==", value: "active" },
            { field: "category", op: "==", value: "catA" },
          ],
        }
      );
    // Expect Docs 1, 4
    expect(entities).toHaveLength(2);
    expect(
      entities.every(
        (doc) => doc.status === "active" && doc.category === "catA"
      )
    ).toBe(true);
  });

  it("should find items ordered by creation date descending", async () => {
    const recentItems =
      await firestoreService.queryCollection<QueryableEntityData>(
        subcollectionPath,
        {
          // No status filter here, get all ordered
          orderBy: [{ field: "createdAt", direction: "desc" }],
        }
      );
    // Expect all 5 docs, ordered 5, 4, 3, 2, 1
    expect(recentItems).toHaveLength(5);
    expect(recentItems[0].createdAt.getTime()).toBe(
      testDocuments[4].createdAt.getTime()
    );
    expect(recentItems[1].createdAt.getTime()).toBe(
      testDocuments[3].createdAt.getTime()
    );
    expect(recentItems[2].createdAt.getTime()).toBe(
      testDocuments[2].createdAt.getTime()
    );
    expect(recentItems[3].createdAt.getTime()).toBe(
      testDocuments[1].createdAt.getTime()
    );
    expect(recentItems[4].createdAt.getTime()).toBe(
      testDocuments[0].createdAt.getTime()
    );
  });

  it("should find recent active items ordered by creation date", async () => {
    const recentItems =
      await firestoreService.queryCollection<QueryableEntityData>(
        subcollectionPath,
        {
          where: [{ field: "status", op: "==", value: "active" }],
          orderBy: [{ field: "createdAt", direction: "desc" }],
        }
      );
    // Expect Docs 5, 4, 2, 1 (Active only, ordered descending)
    expect(recentItems).toHaveLength(4);
    expect(recentItems[0].createdAt.getTime()).toBe(
      testDocuments[4].createdAt.getTime()
    ); // Doc 5
    expect(recentItems[1].createdAt.getTime()).toBe(
      testDocuments[3].createdAt.getTime()
    ); // Doc 4
    expect(recentItems[2].createdAt.getTime()).toBe(
      testDocuments[1].createdAt.getTime()
    ); // Doc 2
    expect(recentItems[3].createdAt.getTime()).toBe(
      testDocuments[0].createdAt.getTime()
    ); // Doc 1
    expect(recentItems.every((doc) => doc.status === "active")).toBe(true);
  });

  it("should find recent active items with category filter, ordered", async () => {
    const recentItems =
      await firestoreService.queryCollection<QueryableEntityData>(
        subcollectionPath,
        {
          where: [
            { field: "status", op: "==", value: "active" },
            { field: "category", op: "==", value: "catA" },
          ],
          orderBy: [{ field: "createdAt", direction: "desc" }],
        }
      );
    // Expect Docs 4, 1 (Active, catA, ordered descending)
    expect(recentItems).toHaveLength(2);
    expect(recentItems[0].createdAt.getTime()).toBe(
      testDocuments[3].createdAt.getTime()
    ); // Doc 4
    expect(recentItems[1].createdAt.getTime()).toBe(
      testDocuments[0].createdAt.getTime()
    ); // Doc 1
    expect(
      recentItems.every(
        (doc) => doc.status === "active" && doc.category === "catA"
      )
    ).toBe(true);
  });

  it("should respect the limit option", async () => {
    const recentItems =
      await firestoreService.queryCollection<QueryableEntityData>(
        subcollectionPath,
        {
          where: [{ field: "status", op: "==", value: "active" }],
          orderBy: [{ field: "createdAt", direction: "desc" }],
          limit: 3,
        }
      );
    // Expect Docs 5, 4, 2 (Top 3 active, ordered descending)
    expect(recentItems).toHaveLength(3);
    expect(recentItems[0].createdAt.getTime()).toBe(
      testDocuments[4].createdAt.getTime()
    ); // Doc 5
    expect(recentItems[1].createdAt.getTime()).toBe(
      testDocuments[3].createdAt.getTime()
    ); // Doc 4
    expect(recentItems[2].createdAt.getTime()).toBe(
      testDocuments[1].createdAt.getTime()
    ); // Doc 2
  });
});
