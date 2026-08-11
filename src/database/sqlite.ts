import { Capacitor } from '@capacitor/core';
import {
  initWebDatabase,
  persistWebDatabase,
  webRunWrite,
  webQuery,
  clearWebDatabase,
} from './web-db';

export const DB_NAME = 'mava_db';

let initPromise: Promise<void> | null = null;
let nativeModule: typeof import('./native-db') | null = null;

const isWeb = () => Capacitor.getPlatform() === 'web';

async function getNativeModule() {
  if (!nativeModule) {
    nativeModule = await import('./native-db');
  }
  return nativeModule;
}

export async function initDatabase(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (isWeb()) {
      await initWebDatabase();
    } else {
      const native = await getNativeModule();
      await native.initNativeDatabase();
    }
  })();

  try {
    await initPromise;
  } catch (err) {
    initPromise = null;
    throw err;
  }
}

export async function query(
  statement: string,
  values: (string | number | null)[] = [],
): Promise<Record<string, unknown>[]> {
  await initDatabase();

  if (isWeb()) {
    return webQuery(statement, values);
  }

  const native = await getNativeModule();
  return native.nativeQuery(statement, values);
}

export async function persistDatabase(): Promise<void> {
  if (isWeb()) {
    await persistWebDatabase();
  }
}

export async function runWrite(
  statement: string,
  values: (string | number | null)[] = [],
): Promise<void> {
  await initDatabase();

  if (isWeb()) {
    await webRunWrite(statement, values);
    await persistWebDatabase();
    return;
  }

  const native = await getNativeModule();
  await native.nativeRunWrite(statement, values);
}

export async function closeDatabase(): Promise<void> {
  if (isWeb()) return;
  const native = await getNativeModule();
  await native.closeNativeDatabase();
  initPromise = null;
}

export async function clearAllTables(): Promise<void> {
  if (isWeb()) {
    await clearWebDatabase();
    return;
  }
  await runWrite('DELETE FROM attachments');
  await runWrite('DELETE FROM posts');
  await runWrite('DELETE FROM categories');
}

export async function getSqliteConnection() {
  if (isWeb()) return null;
  const native = await getNativeModule();
  return native.getSqliteConnection();
}
