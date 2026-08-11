import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { STORAGE_DIRS } from '@/theme/constants';
import { base64ToUint8Array } from './file-bytes.service';

export interface DownloadAttachmentOptions {
  name: string;
  mimeType: string;
  localPath?: string;
  base64?: string;
}

const BASE_PATH = 'archivio';

async function ensureDir(path: string): Promise<void> {
  try {
    await Filesystem.mkdir({
      path,
      directory: Directory.Data,
      recursive: true,
    });
  } catch {
    // Directory may already exist
  }
}

export async function initFileStorage(): Promise<void> {
  await ensureDir(BASE_PATH);
  await ensureDir(`${BASE_PATH}/${STORAGE_DIRS.images}`);
  await ensureDir(`${BASE_PATH}/${STORAGE_DIRS.documents}`);
  await ensureDir(`${BASE_PATH}/${STORAGE_DIRS.backups}`);
}

function getSubDir(mimeType: string): string {
  if (mimeType.startsWith('image/')) return STORAGE_DIRS.images;
  return STORAGE_DIRS.documents;
}

export async function saveFile(
  fileName: string,
  data: string,
  mimeType: string,
): Promise<string> {
  const subDir = getSubDir(mimeType);
  const uniqueName = `${Date.now()}_${fileName}`;
  const relativePath = `${BASE_PATH}/${subDir}/${uniqueName}`;

  await Filesystem.writeFile({
    path: relativePath,
    data,
    directory: Directory.Data,
  });

  return relativePath;
}

export async function readFileAsBase64(localPath: string): Promise<string> {
  const result = await Filesystem.readFile({
    path: localPath,
    directory: Directory.Data,
  });
  return result.data as string;
}

export async function readFileAsBlobUrl(localPath: string, mimeType: string): Promise<string> {
  const base64 = await readFileAsBase64(localPath);
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
}

export async function deleteFile(localPath: string): Promise<void> {
  try {
    await Filesystem.deleteFile({
      path: localPath,
      directory: Directory.Data,
    });
  } catch {
    // File may already be deleted
  }
}

export async function fileExists(localPath: string): Promise<boolean> {
  try {
    await Filesystem.stat({
      path: localPath,
      directory: Directory.Data,
    });
    return true;
  } catch {
    return false;
  }
}

export async function listAllFiles(): Promise<Array<{ path: string; subDir: string }>> {
  const files: Array<{ path: string; subDir: string }> = [];

  for (const subDir of [STORAGE_DIRS.images, STORAGE_DIRS.documents]) {
    try {
      const result = await Filesystem.readdir({
        path: `${BASE_PATH}/${subDir}`,
        directory: Directory.Data,
      });
      for (const file of result.files) {
        if (file.type === 'file') {
          files.push({
            path: `${BASE_PATH}/${subDir}/${file.name}`,
            subDir,
          });
        }
      }
    } catch {
      // Directory empty or missing
    }
  }

  return files;
}

export async function clearAllFiles(): Promise<void> {
  for (const subDir of [STORAGE_DIRS.images, STORAGE_DIRS.documents]) {
    try {
      const result = await Filesystem.readdir({
        path: `${BASE_PATH}/${subDir}`,
        directory: Directory.Data,
      });
      for (const file of result.files) {
        if (file.type === 'file') {
          await Filesystem.deleteFile({
            path: `${BASE_PATH}/${subDir}/${file.name}`,
            directory: Directory.Data,
          });
        }
      }
    } catch {
      // ignore
    }
  }
}

export function getFileUri(localPath: string): string {
  if (Capacitor.isNativePlatform()) {
    return Capacitor.convertFileSrc(
      `file://${Directory.Data}/${localPath}`,
    );
  }
  return '';
}

export async function writeBackupFile(fileName: string, data: string): Promise<string> {
  const path = `${BASE_PATH}/${STORAGE_DIRS.backups}/${fileName}`;
  await Filesystem.writeFile({
    path,
    data,
    directory: Directory.Data,
  });
  return path;
}

export async function readBackupFile(path: string): Promise<string> {
  const result = await Filesystem.readFile({
    path,
    directory: Directory.Data,
    encoding: Encoding.UTF8,
  });
  return result.data as string;
}

export async function readFileBinary(localPath: string): Promise<Uint8Array> {
  const base64 = await readFileAsBase64(localPath);
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Uint8Array(byteNumbers);
}

export async function writeBinaryFile(path: string, data: Uint8Array): Promise<void> {
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  await Filesystem.writeFile({
    path,
    data: btoa(binary),
    directory: Directory.Data,
  });
}

export async function downloadAttachment({
  name,
  mimeType,
  localPath,
  base64,
}: DownloadAttachmentOptions): Promise<void> {
  let blobUrl: string;
  let shouldRevoke = false;

  if (base64) {
    const bytes = base64ToUint8Array(base64);
    blobUrl = URL.createObjectURL(new Blob([bytes.slice()], { type: mimeType }));
    shouldRevoke = true;
  } else if (localPath?.startsWith('data:')) {
    const base64Part = localPath.split(',')[1];
    if (!base64Part) throw new Error('Invalid data URL');
    const bytes = base64ToUint8Array(base64Part);
    blobUrl = URL.createObjectURL(new Blob([bytes.slice()], { type: mimeType }));
    shouldRevoke = true;
  } else if (localPath) {
    blobUrl = await readFileAsBlobUrl(localPath, mimeType);
    shouldRevoke = true;
  } else {
    throw new Error('No file data');
  }

  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = name;
  anchor.click();

  if (shouldRevoke) {
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }
}
