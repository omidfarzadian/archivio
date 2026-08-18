import { useMemo, useState } from "react";
import {
  IconFolderPlus,
  IconLayoutGrid,
  IconList,
  IconSearch,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { AppLayout, PageHeader } from "@/components/ui/Layout";
import {
  CategoryCard,
  type CategoryViewMode,
} from "@/components/CategoryCard/CategoryCard";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { CategoryFormModal } from "@/features/categories/components/CategoryFormModal";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useT } from "@/i18n";
import type { Category } from "@/features/categories/types";
import { cn } from "@/utils/format";

const VIEW_STORAGE_KEY = "mava.categoryView";

function readViewMode(): CategoryViewMode {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === "list"
      ? "list"
      : "window";
  } catch {
    return "window";
  }
}

function persistViewMode(mode: CategoryViewMode) {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  } catch {
    // ignore quota / private mode
  }
}

export function HomePage() {
  const navigate = useNavigate();
  const t = useT();
  const { categories, loading, add, edit, remove } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<CategoryViewMode>(readViewMode);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.trim().toLowerCase();
    return categories.filter((category) =>
      category.name.toLowerCase().includes(q),
    );
  }, [categories, searchQuery]);

  function setMode(mode: CategoryViewMode) {
    setViewMode(mode);
    persistViewMode(mode);
  }

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

  const isList = viewMode === "list";

  return (
    <AppLayout>
      <PageHeader
        title={t("app.name")}
        leftAction={
          categories.length > 0 && (
            <div className="flex h-10 items-center rounded-2xl border border-border bg-surface p-0.5">
              <button
                type="button"
                onClick={() => setMode("window")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  viewMode === "window"
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-background",
                )}
                aria-label={t("home.viewWindow")}
                aria-pressed={viewMode === "window"}
              >
                <IconLayoutGrid
                  size={18}
                  stroke={viewMode === "window" ? 2.25 : 1.75}
                />
              </button>
              <button
                type="button"
                onClick={() => setMode("list")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  isList
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-background",
                )}
                aria-label={t("home.viewList")}
                aria-pressed={isList}
              >
                <IconList size={18} stroke={isList ? 2.25 : 1.75} />
              </button>
            </div>
          )
        }
        rightAction={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-accent shadow-elevated active:scale-95 transition-transform"
              aria-label={t("home.newCategory")}
            >
              <IconFolderPlus size={22} className="text-white" stroke={2.5} />
            </button>
          </div>
        }
      />

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className={isList ? "space-y-2" : "grid grid-cols-2 gap-4"}>
            {Array.from({ length: isList ? 5 : 4 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-3xl bg-surface animate-pulse shadow-card ${
                  isList ? "h-16 rounded-2xl" : "h-44"
                }`}
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
              <div className={isList ? "space-y-2" : "grid grid-cols-2 gap-4"}>
                {filteredCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    variant={viewMode}
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
