/**
 * ExampleEntity.test.ts
 *
 * Demonstrates creating, updating, fetching, and deleting a Firestore document
 * via ExampleEntity and FirestoreService, connected to the Firestore emulator.
 */

import { FirestoreService } from '../firestoreService';
import { ExampleEntity, ExampleData } from '../examples/ExampleEntity';

describe('🔥 FirestoreService - ExampleEntity Tests', () => {
  const testCollection = 'examples';

  beforeEach(async () => {
    // Clean up any existing test documents
    try {
      await FirestoreService.deleteCollection(testCollection);
    } catch (error) {
      // Ignore errors if collection doesn't exist
    }
  });

  it('should create and save a new example entity', async () => {
    const entityData: ExampleData = {
      title: 'Test Entity',
      description: 'A test entity',
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'test-user',
    };

    const entity = await ExampleEntity.create(entityData);
    expect(entity.id).toBeDefined();

    const retrievedEntity = await ExampleEntity.getById(entity.id!);
    expect(retrievedEntity).toBeDefined();
    expect(retrievedEntity?.title).toBe('Test Entity');
    expect(retrievedEntity?.description).toBe('A test entity');
    expect(retrievedEntity?.owner).toBe('test-user');
  });

  it('should update an existing example entity', async () => {
    const entityData: ExampleData = {
      title: 'Test Entity',
      description: 'A test entity',
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'test-user',
    };

    const entity = await ExampleEntity.create(entityData);
    expect(entity.id).toBeDefined();

    await entity.update({
      title: 'Updated Entity',
      description: 'An updated test entity',
    });

    const updatedEntity = await ExampleEntity.getById(entity.id!);
    expect(updatedEntity).toBeDefined();
    expect(updatedEntity?.title).toBe('Updated Entity');
    expect(updatedEntity?.description).toBe('An updated test entity');
    expect(updatedEntity?.owner).toBe('test-user');
  });

  it('should fetch an example entity by ID', async () => {
    const entityData: ExampleData = {
      title: 'Test Entity',
      description: 'A test entity',
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'test-user',
    };

    const entity = await ExampleEntity.create(entityData);
    expect(entity.id).toBeDefined();

    const retrievedEntity = await ExampleEntity.getById(entity.id!);
    expect(retrievedEntity).toBeDefined();
    expect(retrievedEntity?.title).toBe('Test Entity');
    expect(retrievedEntity?.description).toBe('A test entity');
    expect(retrievedEntity?.owner).toBe('test-user');
  });

  it('should delete an example entity', async () => {
    const entityData: ExampleData = {
      title: 'Test Entity',
      description: 'A test entity',
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'test-user',
    };

    const entity = await ExampleEntity.create(entityData);
    expect(entity.id).toBeDefined();

    await entity.delete();

    const deletedEntity = await ExampleEntity.getById(entity.id!);
    expect(deletedEntity).toBeNull();
  });
});
