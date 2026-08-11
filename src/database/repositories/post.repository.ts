import { query, runWrite } from '../sqlite';
import type { Post, PostWithAttachments } from '@/features/categories/types';
import type { Attachment } from '@/features/categories/types';
import { generateId } from '@/utils/format';

function mapPost(row: Record<string, unknown>): Post {
  return {
    id: String(row.id),
    categoryId: String(row.categoryId),
    title: String(row.title),
    content: String(row.content),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

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

export async function getPostsByCategory(categoryId: string): Promise<PostWithAttachments[]> {
  const posts = (await query(
    'SELECT * FROM posts WHERE categoryId = ? ORDER BY createdAt DESC',
    [categoryId],
  )).map(mapPost);

  const result: PostWithAttachments[] = [];

  for (const post of posts) {
    const attachments = (await query(
      'SELECT * FROM attachments WHERE postId = ? ORDER BY createdAt ASC',
      [post.id],
    )).map(mapAttachment);
    result.push({ ...post, attachments });
  }

  return result;
}

export async function getPostById(id: string): Promise<PostWithAttachments | null> {
  const rows = await query('SELECT * FROM posts WHERE id = ?', [id]);
  const row = rows[0];
  if (!row) return null;

  const post = mapPost(row);
  const attachments = (await query(
    'SELECT * FROM attachments WHERE postId = ? ORDER BY createdAt ASC',
    [id],
  )).map(mapAttachment);

  return { ...post, attachments };
}

export async function createPost(
  categoryId: string,
  title: string,
  content: string,
): Promise<Post> {
  const now = new Date().toISOString();
  const post: Post = {
    id: generateId(),
    categoryId,
    title: title.trim(),
    content,
    createdAt: now,
    updatedAt: now,
  };

  await runWrite(
    'INSERT INTO posts (id, categoryId, title, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
    [post.id, post.categoryId, post.title, post.content, post.createdAt, post.updatedAt],
  );

  return post;
}

export async function updatePost(id: string, title: string, content: string): Promise<void> {
  const now = new Date().toISOString();
  await runWrite('UPDATE posts SET title = ?, content = ?, updatedAt = ? WHERE id = ?', [
    title.trim(),
    content,
    now,
    id,
  ]);
}

export async function deletePost(id: string): Promise<void> {
  await runWrite('DELETE FROM attachments WHERE postId = ?', [id]);
  await runWrite('DELETE FROM posts WHERE id = ?', [id]);
}

export async function searchPosts(queryStr: string): Promise<
  Array<{
    post: Post;
    categoryName: string;
    matchType: 'title' | 'content' | 'filename';
  }>
> {
  const searchTerm = `%${queryStr.trim()}%`;
  const results: Array<{
    post: Post;
    categoryName: string;
    matchType: 'title' | 'content' | 'filename';
  }> = [];
  const seen = new Set<string>();

  for (const [sql, matchType] of [
    [`SELECT p.*, c.name as categoryName FROM posts p JOIN categories c ON c.id = p.categoryId WHERE p.title LIKE ? ORDER BY p.createdAt DESC`, 'title'],
    [`SELECT p.*, c.name as categoryName FROM posts p JOIN categories c ON c.id = p.categoryId WHERE p.content LIKE ? ORDER BY p.createdAt DESC`, 'content'],
    [`SELECT p.*, c.name as categoryName FROM posts p JOIN categories c ON c.id = p.categoryId JOIN attachments a ON a.postId = p.id WHERE a.name LIKE ? ORDER BY p.createdAt DESC`, 'filename'],
  ] as const) {
    const rows = await query(sql, [searchTerm]);
    for (const row of rows) {
      const id = String(row.id);
      if (!seen.has(id)) {
        seen.add(id);
        results.push({
          post: mapPost(row),
          categoryName: String(row.categoryName),
          matchType,
        });
      }
    }
  }

  return results;
}

export async function getAllPostsWithCategories(): Promise<
  Array<{ post: Post; categoryName: string }>
> {
  const rows = await query(
    `SELECT p.*, c.name as categoryName FROM posts p
     JOIN categories c ON c.id = p.categoryId
     ORDER BY p.createdAt DESC`,
  );

  return rows.map((row) => ({
    post: mapPost(row),
    categoryName: String(row.categoryName),
  }));
}
