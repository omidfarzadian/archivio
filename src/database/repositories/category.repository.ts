import { query, runWrite } from '../sqlite';
import type { Category, CategoryWithStats } from '@/features/categories/types';
import { generateId } from '@/utils/format';

export async function getAllCategories(): Promise<CategoryWithStats[]> {
  const rows = await query(`
    SELECT c.*, COUNT(p.id) as postCount
    FROM categories c
    LEFT JOIN posts p ON p.categoryId = c.id
    GROUP BY c.id
    ORDER BY c.updatedAt DESC
  `);

  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    color: String(row.color),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
    postCount: Number(row.postCount) || 0,
  }));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const rows = await query('SELECT * FROM categories WHERE id = ?', [id]);
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    name: String(row.name),
    color: String(row.color),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export async function createCategory(name: string, color: string): Promise<Category> {
  const now = new Date().toISOString();
  const category: Category = {
    id: generateId(),
    name: name.trim(),
    color,
    createdAt: now,
    updatedAt: now,
  };

  await runWrite(
    'INSERT INTO categories (id, name, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
    [category.id, category.name, category.color, category.createdAt, category.updatedAt],
  );

  return category;
}

export async function updateCategory(id: string, name: string, color: string): Promise<void> {
  const now = new Date().toISOString();
  await runWrite('UPDATE categories SET name = ?, color = ?, updatedAt = ? WHERE id = ?', [
    name.trim(),
    color,
    now,
    id,
  ]);
}

export async function deleteCategory(id: string): Promise<void> {
  await runWrite('DELETE FROM posts WHERE categoryId = ?', [id]);
  await runWrite('DELETE FROM categories WHERE id = ?', [id]);
}

export async function touchCategory(categoryId: string): Promise<void> {
  const now = new Date().toISOString();
  await runWrite('UPDATE categories SET updatedAt = ? WHERE id = ?', [now, categoryId]);
}
