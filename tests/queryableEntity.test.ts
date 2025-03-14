import {
  QueryableEntity,
  QueryableEntityData,
} from "../src/examples/QueryableEntity";
import { FirestoreService } from "../src/firestoreService";
import {
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getFirestore,
} from "firebase/firestore";

describe("QueryableEntity", () => {
  const userId = "test-user-123";
  const testData: QueryableEntityData[] = [
    {
      userId,
      status: "active",
      category: "work",
      createdAt: new Date(2024, 2, 1), // March 1, 2024
    },
    {
      userId,
      status: "active",
      category: "personal",
      createdAt: new Date(2024, 2, 15), // March 15, 2024
    },
    {
      userId,
      status: "inactive",
      category: "work",
      createdAt: new Date(2024, 2, 10), // March 10, 2024
    },
    {
      userId,
      status: "active",
      category: "work",
      createdAt: new Date(2024, 2, 20), // March 20, 2024
    },
  ];

  beforeEach(async () => {
    // Initialize Firestore with emulator
    FirestoreService.initialize(getFirestore());
    connectFirestoreEmulator(getFirestore(), "localhost", 8080);

    // Create test documents
    for (const data of testData) {
      const entity = new QueryableEntity(data);
      await entity.save();
    }
  });

  afterEach(async () => {
    // Clean up test documents
    for (const data of testData) {
      const entity = new QueryableEntity(data);
      const docRef = doc(getFirestore(), entity.getColPath(), entity.id!);
      await deleteDoc(docRef);
    }
  });

  it("should find entities by status", async () => {
    const activeItems = await QueryableEntity.findByStatus(userId, "active");
    expect(activeItems).toHaveLength(3);
    expect(activeItems.every((item) => item.status === "active")).toBe(true);

    const inactiveItems = await QueryableEntity.findByStatus(
      userId,
      "inactive"
    );
    expect(inactiveItems).toHaveLength(1);
    expect(inactiveItems[0].status).toBe("inactive");
  });

  it("should find entities by status and category", async () => {
    const activeWorkItems = await QueryableEntity.findByStatusAndCategory(
      userId,
      "active",
      "work"
    );
    expect(activeWorkItems).toHaveLength(2);
    expect(activeWorkItems[0].status).toBe("active");
    expect(activeWorkItems[0].category).toBe("work");

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
    expect(recentItems.every((item) => item.status === "active")).toBe(true);

    // Check ordering
    const dates = recentItems.map((item) => item.createdAt.getTime());
    expect(dates).toEqual([...dates].sort((a, b) => b - a)); // Should be in descending order
  });

  it("should find recent active items with category filter", async () => {
    const recentWorkItems = await QueryableEntity.findRecentActiveItems(
      userId,
      "work"
    );
    expect(recentWorkItems).toHaveLength(2);
    expect(
      recentWorkItems.every(
        (item) => item.status === "active" && item.category === "work"
      )
    ).toBe(true);

    // Check ordering
    const dates = recentWorkItems.map((item) => item.createdAt.getTime());
    expect(dates).toEqual([...dates].sort((a, b) => b - a)); // Should be in descending order
  });

  it("should respect the maxResults limit", async () => {
    const limitedItems = await QueryableEntity.findRecentActiveItems(
      userId,
      undefined,
      2
    );
    expect(limitedItems).toHaveLength(2);
    expect(limitedItems.every((item) => item.status === "active")).toBe(true);

    // Check ordering
    const dates = limitedItems.map((item) => item.createdAt.getTime());
    expect(dates).toEqual([...dates].sort((a, b) => b - a)); // Should be in descending order
  });
});
