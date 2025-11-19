// src/lib/db/fileStore.ts
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'app', 'data');
const JSON_SPACE = 2;

// Simple in-process locks per filename to serialize writes within one Node process
const locks: Record<string, Promise<void> | null> = {};

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/**
 * Resolve file path for a collection name (collection -> collection.json)
 */
function filePathFor(collectionName: string) {
  const filename = `${collectionName}.json`;
  return path.join(DATA_DIR, filename);
}

/**
 * Acquire a simple in-process lock for a key (file path).
 * Returns a release function that must be called when the caller is done.
 */
async function acquireLock(key: string) {
  const previous = locks[key] ?? Promise.resolve();
  let release!: () => void;
  const p = new Promise<void>((res) => (release = res));
  locks[key] = previous.then(() => p);
  return () => {
    release();
    if (locks[key] === p) locks[key] = null;
  };
}

/**
 * Read raw file contents or return null if not exists
 */
async function readRawFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (err: any) {
    if (err && err.code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * Helper: convert snake_case keys to camelCase recursively
 */
function snakeToCamel(s: string) {
  return s.replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
}
function convertKeysToCamel<T>(obj: any): T {
  if (Array.isArray(obj)) return obj.map(convertKeysToCamel) as any;
  if (obj === null || typeof obj !== 'object') return obj;
  const out: any = {};
  for (const key of Object.keys(obj)) {
    const camel = snakeToCamel(key);
    out[camel] = convertKeysToCamel(obj[key]);
  }
  return out;
}

/**
 * Normalize id for comparison (keep numbers as numbers, strings as strings)
 */
function isNumericId(id: unknown): id is number {
  return typeof id === 'number' && Number.isFinite(id);
}
function normalizeId(id: string | number) {
  return isNumericId(id) ? id : String(id);
}

/**
 * Public: readCollection
 * Returns [] if file missing or empty.
 */
export async function readCollection<T = any>(name: string): Promise<T[]> {
  await ensureDataDir();
  const file = filePathFor(name);
  const raw = await readRawFile(file);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return convertKeysToCamel<T[]>(parsed);
  } catch (err) {
    throw new Error(`Invalid JSON in ${file}: ${(err as Error).message}`);
  }
}

/**
 * Public: writeCollection
 * Overwrites the collection file with provided array (pretty-printed).
 */
export async function writeCollection<T = any>(name: string, data: T[]): Promise<void> {
  await ensureDataDir();
  const file = filePathFor(name);
  const release = await acquireLock(file);
  try {
    const json = JSON.stringify(data, null, JSON_SPACE);
    await fs.writeFile(file, json, 'utf-8');
  } finally {
    release();
  }
}

/**
 * Public: getById
 * Finds an item by id (loose string/number match). Returns null if not found.
 */
export async function getById<T = any>(name: string, id: string | number): Promise<T | null> {
  const collection = await readCollection<T>(name);
  const nid = normalizeId(id);
  return (
    collection.find((item: any) => item && (item.id === nid || String(item.id) === String(nid))) ?? null
  );
}

/**
 * Public: upsert
 * Inserts or updates an item. If item.id is missing, generates an id.
 * Returns the stored item (with id).
 *
 * Note: id generation strategy:
 * - If existing string ids follow prefixNNN, it continues the numeric suffix.
 * - Otherwise falls back to numeric increment.
 */
export async function upsert<T extends { id?: string | number }>(name: string, item: T): Promise<T> {
  if (!item) throw new Error('upsert: item is required');
  await ensureDataDir();
  const file = filePathFor(name);
  const release = await acquireLock(file);
  try {
    const raw = await readRawFile(file);
    const collectionRaw: any[] = raw ? JSON.parse(raw) : [];
    // Use camel-case converted copy for logic, but persist items as-is
    const existing = convertKeysToCamel<any[]>(collectionRaw);
    let nid = item.id ? normalizeId(item.id) : undefined;

    if (nid === undefined || nid === null || nid === '') {
      // generate id
      const ids = existing.map((it) => it.id).filter(Boolean);
      const stringIds = ids.filter((v) => typeof v === 'string') as string[];
      if (stringIds.length > 0) {
        const match = stringIds[0].match(/^([a-zA-Z]+[_-]?)/);
        const prefix = match ? match[1] : 'id_';
        const numbers = stringIds
          .map((s) => {
            const m = s.match(/(\d+)$/);
            return m ? parseInt(m[1], 10) : NaN;
          })
          .filter((n) => !isNaN(n));
        const next = (numbers.length ? Math.max(...numbers) + 1 : 1).toString().padStart(3, '0');
        nid = `${prefix}${next}`;
      } else {
        const numeric = ids.filter((id) => typeof id === 'number') as number[];
        nid = numeric.length ? Math.max(...numeric) + 1 : 1;
      }
      item.id = nid as any;
    }

    const idx = existing.findIndex((it) => String(it.id) === String(item.id));
    if (idx >= 0) {
      // merge existing with provided (shallow)
      const merged = { ...existing[idx], ...item };
      existing[idx] = merged;
      // replace in raw collection - keep original shapes where possible
      collectionRaw[idx] = merged;
    } else {
      existing.push(item);
      collectionRaw.push(item);
    }

    await fs.writeFile(file, JSON.stringify(collectionRaw, null, JSON_SPACE), 'utf-8');
    return item;
  } finally {
    release();
  }
}

/**
 * Public: deleteById
 * Removes item by id. Returns true if an item was removed.
 */
export async function deleteById(name: string, id: string | number): Promise<boolean> {
  await ensureDataDir();
  const file = filePathFor(name);
  const release = await acquireLock(file);
  try {
    const raw = await readRawFile(file);
    if (!raw) return false;
    const collection = JSON.parse(raw) as any[];
    const initialLen = collection.length;
    const filtered = collection.filter((it) => String(it.id) !== String(id));
    if (filtered.length === initialLen) return false;
    await fs.writeFile(file, JSON.stringify(filtered, null, JSON_SPACE), 'utf-8');
    return true;
  } finally {
    release();
  }
}
