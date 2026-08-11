import { useMemo, useState } from "react";
import { IconFolderPlus, IconSearch } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { AppLayout, PageHeader } from "@/components/ui/Layout";
import { CategoryCard } from "@/components/CategoryCard/CategoryCard";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { CategoryFormModal } from "@/features/categories/components/CategoryFormModal";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useT } from "@/i18n";
import type { Category } from "@/features/categories/types";

export function HomePage() {
  const navigate = useNavigate();
  const t = useT();
  const { categories, loading, add, edit, remove } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.trim().toLowerCase();
    return categories.filter((category) =>
      category.name.toLowerCase().includes(q),
    );
  }, [categories, searchQuery]);

  function openCreate() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setModalOpen(true);
  }

  async function handleSubmit(name: string, color: string) {
    if (editingCategory) {
      await edit(editingCategory.id, name, color);
    } else {
      await add(name, color);
    }
  }

  async function handleDelete(category: Category) {
    if (confirm(t("home.deleteConfirm", { name: category.name }))) {
      await remove(category.id);
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title={t("app.name")}
        rightAction={
          <button
            onClick={openCreate}
            className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-accent shadow-elevated active:scale-95 transition-transform"
            aria-label={t("home.newCategory")}
          >
            <IconFolderPlus size={22} className="text-white" stroke={2.5} />
          </button>
        }
      />

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-3xl bg-surface animate-pulse shadow-card"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState onCreateCategory={openCreate} />
        ) : (
          <>
            <div className="relative mb-4">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("home.searchPlaceholder")}
                className="w-full rounded-2xl border border-border bg-surface py-3 pe-11 ps-4 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <IconSearch
                size={20}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-text-secondary"
              />
            </div>

            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary text-sm">
                  {t("home.noSearchResults")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={() => navigate(`/category/${category.id}`)}
                    onEdit={() => openEdit(category)}
                    onDelete={() => handleDelete(category)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editing={editingCategory}
      />
    </AppLayout>
  );
}
