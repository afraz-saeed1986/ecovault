// src/lib/db/adapters/index.ts

export type ID = string | number;

/**
 * CollectionDataSource is a minimal, generic interface that all adapters must implement.
 * It allows consuming code to work with a consistent data API regardless of the backend.
 */
export interface CollectionDataSource {
  /**
   * Read the entire collection (e.g. "products").
   * @param collection collection name
   */
  read<T>(collection: string): Promise<T[]>;

  /**
   * Overwrite the collection with the provided items.
   * @param collection collection name
   * @param items full array to write
   */
  write<T>(collection: string, items: T[]): Promise<void>;

  /**
   * Get a single item by id. Returns null when not found.
   * @param collection collection name
   * @param id item id
   */
  get<T>(collection: string, id: ID): Promise<T | null>;

  /**
   * Insert or update an item (upsert). Adapter should return the stored item,
   * generating an id when necessary.
   * @param collection collection name
   * @param item item to create or update
   */
  upsert<T extends { id?: ID }>(collection: string, item: T): Promise<T>;

  /**
   * Delete an item by id. Returns true if an item was removed.
   * @param collection collection name
   * @param id item id
   */
  delete(collection: string, id: ID): Promise<boolean>;
}

/**
 * DataSourceFactory type: function producing a CollectionDataSource instance.
 * Useful for runtime wiring based on environment or config.
 */
export type DataSourceFactory = () => CollectionDataSource;
