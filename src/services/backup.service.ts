import JSZip from 'jszip';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { getAllCategories } from '@/database/repositories/category.repository';
import { getAllPostsWithCategories } from '@/database/repositories/post.repository';
import { getAllAttachments } from '@/database/repositories/attachment.repository';
import { clearAllTables, runWrite, persistDatabase } from '@/database/sqlite';
import {
  readFileAsBase64,
  writeBinaryFile,
  clearAllFiles,
  initFileStorage,
} from './file.service';
import { resolveInitialLocale, translate } from '@/i18n';

function tBackup(
  key:
    | 'backup.shareTitle'
    | 'backup.shareText'
    | 'backup.shareDialog'
    | 'backup.invalidFile'
    | 'backup.invalidStructure',
) {
  return translate(resolveInitialLocale(), key);
}

interface BackupData {
  version: number;
  exportedAt: string;
  categories: Array<{
    id: string;
    name: string;
    color: string;
    createdAt: string;
    updatedAt: string;
  }>;
  posts: Array<{
    id: string;
    categoryId: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }>;
  attachments: Array<{
    id: string;
    postId: string;
    type: string;
    name: string;
    mimeType: string;
    size: number;
    localPath: string;
    createdAt: string;
  }>;
}

export async function createBackup(): Promise<Blob> {
  const categories = await getAllCategories();
  const postsData = await getAllPostsWithCategories();
  const attachments = await getAllAttachments();

  const backupData: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories: categories.map(({ id, name, color, createdAt, updatedAt }) => ({
      id,
      name,
      color,
      createdAt,
      updatedAt,
    })),
    posts: postsData.map(({ post }) => post),
    attachments,
  };

  const zip = new JSZip();
  zip.file('database.json', JSON.stringify(backupData, null, 2));

  const filesFolder = zip.folder('files');
  const imagesFolder = filesFolder?.folder('images');
  const documentsFolder = filesFolder?.folder('documents');

  for (const attachment of attachments) {
    try {
      const base64 = await readFileAsBase64(attachment.localPath);
      const fileName = attachment.localPath.split('/').pop() || attachment.name;
      if (attachment.type === 'image') {
        imagesFolder?.file(fileName, base64, { base64: true });
      } else {
        documentsFolder?.file(fileName, base64, { base64: true });
      }
    } catch {
      // skip missing files
    }
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export async function shareBackup(): Promise<void> {
  const blob = await createBackup();
  const fileName = `mava-backup-${new Date().toISOString().slice(0, 10)}.zip`;

  if (Capacitor.isNativePlatform()) {
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve) => {
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });

    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const path = `mava/backups/${fileName}`;
    await Filesystem.writeFile({
      path,
      data: base64,
      directory: Directory.Cache,
    });

    const uri = await Filesystem.getUri({
      path,
      directory: Directory.Cache,
    });

    await Share.share({
      title: tBackup('backup.shareTitle'),
      text: tBackup('backup.shareText'),
      url: uri.uri,
      dialogTitle: tBackup('backup.shareDialog'),
    });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export async function restoreBackup(file: File): Promise<void> {
  const zip = await JSZip.loadAsync(file);
  const dbFile = zip.file('database.json');
  if (!dbFile) {
    throw new Error(tBackup('backup.invalidFile'));
  }

  const jsonStr = await dbFile.async('string');
  const data: BackupData = JSON.parse(jsonStr);

  if (!data.categories || !data.posts || !data.attachments) {
    throw new Error(tBackup('backup.invalidStructure'));
  }

  await clearAllFiles();
  await clearAllTables();
  await initFileStorage();

  for (const category of data.categories) {
    await runWrite(
      'INSERT INTO categories (id, name, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      [category.id, category.name, category.color, category.createdAt, category.updatedAt],
    );
  }

  for (const post of data.posts) {
    await runWrite(
      'INSERT INTO posts (id, categoryId, title, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [post.id, post.categoryId, post.title, post.content, post.createdAt, post.updatedAt],
    );
  }

  for (const attachment of data.attachments) {
    const fileName = attachment.localPath.split('/').pop() || attachment.name;
    const zipPath =
      attachment.type === 'image'
        ? `files/images/${fileName}`
        : `files/documents/${fileName}`;

    const zipEntry = zip.file(zipPath);
    if (zipEntry) {
      const binary = await zipEntry.async('uint8array');
      await writeBinaryFile(attachment.localPath, binary);
    }

    await runWrite(
      `INSERT INTO attachments (id, postId, type, name, mimeType, size, localPath, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        attachment.id,
        attachment.postId,
        attachment.type,
        attachment.name,
        attachment.mimeType,
        attachment.size,
        attachment.localPath,
        attachment.createdAt,
      ],
    );
  }

  await persistDatabase();
}

export async function pickBackupFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = () => {
      resolve(input.files?.[0] || null);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}
