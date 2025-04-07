// tests/QueryableEntity.test.ts

import { FirestoreService } from "../firestoreService";
import {
  QueryableEntity,
  QueryableEntityData,
} from "../examples/QueryableEntity";

const testCollection = "queryable-entities";
const userId = "test-user";

describe("QueryableEntity", () => {
  beforeEach(async () => {
    // Clean up existing test documents in the subcollection
    const subcollectionPath = `users/${userId}/items`;
    // Provide a type for the fetched documents, we only need the id
    const docs = await FirestoreService.fetchCollection<{ id: string }>(
      subcollectionPath
    );
    for (const doc of docs) {
      await FirestoreService.deleteDocument(`${subcollectionPath}/${doc.id}`);
    }
  });

  it("should find entities by status", async () => {
    // Create test entities
    const activeEntityData: QueryableEntityData = {
      userId,
      status: "active",
      category: "test",
      createdAt: new Date(),
    };

    const inactiveEntityData: QueryableEntityData = {
      userId,
      status: "inactive",
      category: "test",
      createdAt: new Date(),
    };

    await QueryableEntity.create(activeEntityData);
    await QueryableEntity.create(inactiveEntityData);

    // Find active entities
    const activeEntities = await QueryableEntity.findByStatus(userId, "active");
    expect(activeEntities).toHaveLength(1);
    expect(activeEntities[0].status).toBe("active");
  });

  it("should find entities by status and category", async () => {
    // Create test entities
    const entity1Data: QueryableEntityData = {
      userId,
      status: "active",
      category: "category1",
      createdAt: new Date(),
    };

    const entity2Data: QueryableEntityData = {
      userId,
      status: "active",
      category: "category2",
      createdAt: new Date(),
    };

    await QueryableEntity.create(entity1Data);
    await QueryableEntity.create(entity2Data);

    // Find entities by status and category
    const entities = await QueryableEntity.findByStatusAndCategory(
      userId,
      "active",
      "category1"
    );
    expect(entities).toHaveLength(1);
    expect(entities[0].category).toBe("category1");
  });

  it("should find recent active items ordered by creation date", async () => {
    // Create test entities
    const now = new Date();
    const entity1Data: QueryableEntityData = {
      userId,
      status: "active",
      category: "test",
      createdAt: new Date(now.getTime() - 1000),
    };

    const entity2Data: QueryableEntityData = {
      userId,
      status: "active",
      category: "test",
      createdAt: now,
    };

    await QueryableEntity.create(entity1Data);
    await QueryableEntity.create(entity2Data);

    // Find recent active items
    const recentItems = await QueryableEntity.findRecentActiveItems(userId);
    expect(recentItems).toHaveLength(2);
    expect(recentItems[0].createdAt.getTime()).toBeGreaterThanOrEqual(
      recentItems[1].createdAt.getTime()
    );
  });

  it("should find recent active items with category filter", async () => {
    // Create test entities
    const now = new Date();
    const entity1Data: QueryableEntityData = {
      userId,
      status: "active",
      category: "category1",
      createdAt: new Date(now.getTime() - 1000),
    };

    const entity2Data: QueryableEntityData = {
      userId,
      status: "active",
      category: "category2",
      createdAt: now,
    };

    await QueryableEntity.create(entity1Data);
    await QueryableEntity.create(entity2Data);

    // Find recent active items with category filter
    const recentItems = await QueryableEntity.findRecentActiveItems(
      userId,
      "category1"
    );
    expect(recentItems).toHaveLength(1);
    expect(recentItems[0].category).toBe("category1");
  });

  it("should respect the maxResults limit", async () => {
    // Create multiple test entities
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const entityData: QueryableEntityData = {
        userId,
        status: "active",
        category: "test",
        createdAt: new Date(now.getTime() - i * 1000),
      };
      await QueryableEntity.create(entityData);
    }

    // Find recent active items with limit
    const recentItems = await QueryableEntity.findRecentActiveItems(
      userId,
      undefined,
      3
    );
    expect(recentItems).toHaveLength(3);
  });
});
