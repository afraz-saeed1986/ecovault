import type { CollectionDataSource } from "./index";
import { createFileAdapter } from "./fileAdapter";

// Export the base types (re-export if you store the interface elsewhere)
export type {CollectionDataSource} from './index';

/**
 * Minimal registry / factory for adapters.
 * Add more branches (http, db, memory) as you implement them.
 */
export function getAdapterFromEnv(): CollectionDataSource {
    const adapter = (process.env.DATA_ADAPTER || 'file').toLowerCase();

    switch (adapter) {
        case 'file':
            return createFileAdapter();
            // case 'memory':
            //     return createMemoryAdapter() // implement later
            // case 'http':
            //     return createHttpAdapter() // implement later 
             // case 'db':
            //     return createDbAdapter() // implement later     
    
        default:
            // fallback to file adapter to keep dev DX simple
            return createFileAdapter();
    }
}

/**
 * Convenience named export for the file adapter factory.
 */
export {createFileAdapter}