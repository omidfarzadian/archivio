import { useState, useEffect, useCallback } from 'react';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/database/repositories/category.repository';
import type { Category, CategoryWithStats } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('[Archivio] Failed to load categories:', err);
      setError('خطا در بارگذاری دسته‌بندی‌ها');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function add(name: string, color: string) {
    const category = await createCategory(name, color);
    setCategories((prev) => [{ ...category, postCount: 0 }, ...prev]);
    await refresh();
    return category;
  }

  async function edit(id: string, name: string, color: string) {
    await updateCategory(id, name, color);
    await refresh();
  }

  async function remove(id: string) {
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    await refresh();
  }

  return { categories, loading, error, refresh, add, edit, remove };
}

export type { Category };
