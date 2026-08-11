import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { MIGRATION_V1 } from './migrations/001_initial';

export const DB_NAME = 'mava_db';
const DB_VERSION = 1;

let sqlite: SQLiteConnection | null = null;
let db: SQLiteDBConnection | null = null;

export async function initNativeDatabase(): Promise<void> {
  sqlite = new SQLiteConnection(CapacitorSQLite);

  try {
    await sqlite.checkConnectionsConsistency();
  } catch {
    // Drop stale connection metadata after an app restart.
  }

  const isConn = (await sqlite.isConnection(DB_NAME, false)).result;
  if (isConn) {
    db = await sqlite.retrieveConnection(DB_NAME, false);
  } else {
    db = await sqlite.createConnection(
      DB_NAME,
      false,
      'no-encryption',
      DB_VERSION,
      false,
    );
  }

  await db.open();

  for (const migration of MIGRATION_V1) {
    await db.execute(migration);
  }
}

export async function getNativeDatabase(): Promise<SQLiteDBConnection> {
  if (!db) throw new Error('Native database not initialized');

  const status = await db.isDBOpen();
  if (!status.result) await db.open();
  return db;
}

export async function nativeQuery(
  statement: string,
  values: (string | number | null)[] = [],
): Promise<Record<string, unknown>[]> {
  const database = await getNativeDatabase();
  const result = await database.query(statement, values);
  return (result.values ?? []) as Record<string, unknown>[];
}

export async function nativeRunWrite(
  statement: string,
  values: (string | number | null)[] = [],
): Promise<void> {
  const database = await getNativeDatabase();
  const result = await database.run(statement, values);
  const changeCount =
    typeof result.changes === 'object' && result.changes !== null
      ? Number(result.changes.changes ?? -1)
      : Number(result.changes ?? -1);

  if (changeCount < 0) {
    throw new Error('Native SQLite write failed');
  }
}

export async function persistNativeDatabase(): Promise<void> {
  // Native Android/iOS persist writes automatically.
  // saveToStore is only supported on web/electron.
}

export async function closeNativeDatabase(): Promise<void> {
  if (db && sqlite) {
    await db.close();
    await sqlite.closeConnection(DB_NAME, false);
    db = null;
    sqlite = null;
  }
}

export function getSqliteConnection(): SQLiteConnection | null {
  return sqlite;
}
