import type { CollectionDataSource, ID } from "./index";
import * as fileStore from '../fileStore';

/**
 * createFileAdapter returns an object that implements CollectionDataSource
 * using the fileStore module as the backing implementation.
 *
 * This adapter is intentionally thin: it does not add business logic,
 * it only maps the generic collection operations to fileStore operations.
 */
export function createFileAdapter(): CollectionDataSource {
    return {
            /**
     * Read the full collection from the file store.
     * Returns an empty array if the file is missing.
     */
    async read<T>(collection: string): Promise<T[]> {
        return fileStore.readCollection<T>(collection);
    },

        /**
     * Overwrite the collection file with the provided array.
     */

        async write<T>(collection: string, items: T[]): Promise<void> {
            await fileStore.writeCollection<T>(collection, items);
        },

            /**
     * Get a single item by id. Returns null when not found.
     */

       async get<T>(collection:string , id: ID): Promise<T | null> {
        return fileStore.getById<T>(collection, id as string | number);
       },

           /**
     * Insert or update an item. Returns the stored item (with id).
     * Delegates id generation and merge logic to fileStore.
     */

       async upsert<T extends {id?: ID}>(collection: string, item: T): Promise<T> {
        return fileStore.upsert<T>(collection, item);
       },
       
         /**
     * Delete an item by id. Returns true if an item was removed.
     */

         async delete(collection: string, id: ID): Promise<boolean> {
            return fileStore.deleteById(collection, id as string | number);
         }
    }
}