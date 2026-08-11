import { query, runWrite } from '../sqlite';
import type { Attachment } from '@/features/categories/types';
import { generateId } from '@/utils/format';

function mapAttachment(row: Record<string, unknown>): Attachment {
  return {
    id: String(row.id),
    postId: String(row.postId),
    type: row.type as 'image' | 'document',
    name: String(row.name),
    mimeType: String(row.mimeType),
    size: Number(row.size),
    localPath: String(row.localPath),
    createdAt: String(row.createdAt),
  };
}

export async function getAttachmentsByPost(postId: string): Promise<Attachment[]> {
  const rows = await query(
    'SELECT * FROM attachments WHERE postId = ? ORDER BY createdAt ASC',
    [postId],
  );
  return rows.map(mapAttachment);
}

export async function createAttachment(
  postId: string,
  type: 'image' | 'document',
  name: string,
  mimeType: string,
  size: number,
  localPath: string,
): Promise<Attachment> {
  const attachment: Attachment = {
    id: generateId(),
    postId,
    type,
    name,
    mimeType,
    size,
    localPath,
    createdAt: new Date().toISOString(),
  };

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

  return attachment;
}

export async function deleteAttachment(id: string): Promise<Attachment | null> {
  const rows = await query('SELECT * FROM attachments WHERE id = ?', [id]);
  const row = rows[0];
  if (!row) return null;

  await runWrite('DELETE FROM attachments WHERE id = ?', [id]);
  return mapAttachment(row);
}

export async function getAllAttachments(): Promise<Attachment[]> {
  const rows = await query('SELECT * FROM attachments ORDER BY createdAt ASC');
  return rows.map(mapAttachment);
}
