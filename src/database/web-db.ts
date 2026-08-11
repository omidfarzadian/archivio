import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { MIGRATION_V1 } from './migrations/001_initial';

const IDB_NAME = 'mava_web';
const IDB_STORE = 'database';
const IDB_KEY = 'main';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
    request.onblocked = () =>
      reject(new Error('IndexedDB is blocked. Close other Mava tabs and reload.'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(IDB_STORE);
    };
  });
}

async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, 'readonly');
    const request = tx.objectStore(IDB_STORE).get(IDB_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve((request.result as Uint8Array) ?? null);
  });
}

async function saveToIndexedDB(data: Uint8Array): Promise<void> {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(data, IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function initWebDatabase(): Promise<Database> {
  if (db) return db;

  SQL = await initSqlJs({
    locateFile: () => wasmUrl,
  });

  const saved = await loadFromIndexedDB();
  db = saved ? new SQL.Database(saved) : new SQL.Database();

  for (const migration of MIGRATION_V1) {
    db.run(migration);
  }

  await persistWebDatabase();
  return db;
}

export async function getWebDatabase(): Promise<Database> {
  if (!db) return initWebDatabase();
  return db;
}

export async function persistWebDatabase(): Promise<void> {
  if (!db) return;
  await saveToIndexedDB(db.export());
}

export function webRun(
  statement: string,
  values: (string | number | null)[] = [],
): void {
  if (!db) throw new Error('Web database not initialized');
  const stmt = db.prepare(statement);
  if (values.length) stmt.bind(values);
  stmt.step();
  stmt.free();
}

export function webQuery(
  statement: string,
  values: (string | number | null)[] = [],
): Record<string, unknown>[] {
  if (!db) throw new Error('Web database not initialized');
  const stmt = db.prepare(statement);
  if (values.length) stmt.bind(values);
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as Record<string, unknown>);
  }
  stmt.free();
  return rows;
}

export async function webRunWrite(
  statement: string,
  values: (string | number | null)[] = [],
): Promise<void> {
  webRun(statement, values);
  await persistWebDatabase();
}

export async function clearWebDatabase(): Promise<void> {
  if (!db) return;
  db.run('DELETE FROM attachments');
  db.run('DELETE FROM posts');
  db.run('DELETE FROM categories');
  await persistWebDatabase();
}

export async function importWebDatabase(data: Uint8Array): Promise<void> {
  if (!SQL) {
    SQL = await initSqlJs({ locateFile: () => wasmUrl });
  }
  db = new SQL.Database(data);
  await persistWebDatabase();
}
