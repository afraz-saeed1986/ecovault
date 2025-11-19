import path from "path";
import { getAdapterFromEnv } from "./db/adapters/registry";
import type { CollectionDataSource } from "./db/adapters/registry";

const DEFAULT_DATA_DIR = path.resolve(process.cwd() , 'app', 'data');

/**
 * AppConfig holds environment-driven settings for the data layer.
 * You can extend this with more keys (API_URL, JWT_SECRET, etc.)
 */
export interface AppConfig {
    dataDir: string;
    adapter: CollectionDataSource;
}

/**
 * Load configuration from environment variables with sane defaults.
 */

export function loadConfig(): AppConfig {
    const dataDir = process.env.DATA_DIR || DEFAULT_DATA_DIR;
    const adapter = getAdapterFromEnv();

    return {
        dataDir,
        adapter,
    };
}