// src/lib/db/fileStore.ts
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "app", "data");
const JSON_SPACE = 2;

const locks: Record<string, Promise<void> | null> = {};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function filePathFor(collectionName: string) {
  const filename = `${collectionName}.json`;
  return path.join(DATA_DIR, filename);
}

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

async function readRawFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (err) {
    if (err && typeof err === "object" && (err as { code?: string }).code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

function snakeToCamel(s: string) {
  return s.replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
}

function convertKeysToCamel<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((o) => convertKeysToCamel(o)) as unknown as T;
  }
  if (obj === null || typeof obj !== "object") return obj as T;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const camel = snakeToCamel(key);
    out[camel] = convertKeysToCamel((obj as Record<string, unknown>)[key]);
  }
  return out as T;
}

function isNumericId(id: unknown): id is number {
  return typeof id === "number" && Number.isFinite(id);
}
function normalizeId(id: string | number) {
  return isNumericId(id) ? id : String(id);
}

export async function readCollection<T>(name: string): Promise<T[]> {
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

export async function writeCollection<T>(name: string, data: T[]): Promise<void> {
  await ensureDataDir();
  const file = filePathFor(name);
  const release = await acquireLock(file);
  try {
    const json = JSON.stringify(data, null, JSON_SPACE);
    await fs.writeFile(file, json, "utf-8");
  } finally {
    release();
  }
}

export async function getById<T>(name: string, id: string | number): Promise<T | null> {
  const collection = await readCollection<T>(name);
  const nid = normalizeId(id);
  return (
    collection.find((item) => {
      const obj = item as Record<string, unknown>;
      return obj && (obj["id"] === nid || String(obj["id"]) === String(nid));
    }) ?? null
  );
}

export async function upsert<T extends { id?: string | number }>(name: string, item: T): Promise<T> {
  if (!item) throw new Error("upsert: item is required");
  await ensureDataDir();
  const file = filePathFor(name);
  const release = await acquireLock(file);
  try {
    const raw = await readRawFile(file);
    const collectionRaw: Record<string, unknown>[] = raw ? JSON.parse(raw) : [];
    const existing = convertKeysToCamel<T[]>(collectionRaw);

    let nid = item.id ? normalizeId(item.id) : undefined;
    if (!nid) {
      const ids = existing.map((it) => (it as Record<string, unknown>)["id"]).filter(Boolean);
      const stringIds = ids.filter((v) => typeof v === "string") as string[];
      if (stringIds.length > 0) {
        const match = stringIds[0].match(/^([a-zA-Z]+[_-]?)/);
        const prefix = match ? match[1] : "id_";
        const numbers = stringIds
          .map((s) => {
            const m = s.match(/(\d+)$/);
            return m ? parseInt(m[1], 10) : NaN;
          })
          .filter((n) => !isNaN(n));
        const next = (numbers.length ? Math.max(...numbers) + 1 : 1).toString().padStart(3, "0");
        nid = `${prefix}${next}`;
      } else {
        const numeric = ids.filter((id) => typeof id === "number") as number[];
        nid = numeric.length ? Math.max(...numeric) + 1 : 1;
      }
      item.id = nid;
    }

    const idx = existing.findIndex((it) => String((it as Record<string, unknown>)["id"]) === String(item.id));
    if (idx >= 0) {
      const merged = { ...(existing[idx] as object), ...item };
      existing[idx] = merged as T;
      collectionRaw[idx] = merged;
    } else {
      existing.push(item);
      collectionRaw.push(item);
    }

    await fs.writeFile(file, JSON.stringify(collectionRaw, null, JSON_SPACE), "utf-8");
    return item;
  } finally {
    release();
  }
}

export async function deleteById(name: string, id: string | number): Promise<boolean> {
  await ensureDataDir();
  const file = filePathFor(name);
  const release = await acquireLock(file);
  try {
    const raw = await readRawFile(file);
    if (!raw) return false;
    const collection = JSON.parse(raw) as Record<string, unknown>[];
    const initialLen = collection.length;
    const filtered = collection.filter((it) => String(it["id"]) !== String(id));
    if (filtered.length === initialLen) return false;
    await fs.writeFile(file, JSON.stringify(filtered, null, JSON_SPACE), "utf-8");
    return true;
  } finally {
    release();
  }
}
