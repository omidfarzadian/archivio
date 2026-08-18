import { IconDotsVertical } from '@tabler/icons-react';
import { FolderIcon3D } from '@/components/ui/FolderIcon3D';
import { formatNumber, formatRelativeDate } from '@/utils/format';
import { useI18n, useT } from '@/i18n';
import type { CategoryWithStats } from '@/features/categories/types';
import { useState, useRef, useEffect } from 'react';

export type CategoryViewMode = 'window' | 'list';

interface CategoryCardProps {
  category: CategoryWithStats;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  variant?: CategoryViewMode;
}

function CategoryMenu({
  onEdit,
  onDelete,
  align,
}: {
  onEdit: () => void;
  onDelete: () => void;
  align: 'start' | 'end';
}) {
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative z-10" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-background transition-colors"
        aria-label={t('common.menu')}
      >
        <IconDotsVertical size={18} className="text-text-secondary" />
      </button>
      {menuOpen && (
        <div
          className={`absolute top-full mt-1 w-36 rounded-2xl bg-surface border border-border shadow-elevated overflow-hidden z-20 animate-fade-in ${
            align === 'end' ? 'end-0' : 'start-0'
          }`}
        >
          <button
            type="button"
            className="w-full px-4 py-3 text-start text-sm hover:bg-background transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              onEdit();
            }}
          >
            {t('common.edit')}
          </button>
          <button
            type="button"
            className="w-full px-4 py-3 text-start text-sm text-danger hover:bg-red-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              onDelete();
            }}
          >
            {t('common.delete')}
          </button>
        </div>
      )}
    </div>
  );
}

export function CategoryCard({
  category,
  onClick,
  onEdit,
  onDelete,
  variant = 'window',
}: CategoryCardProps) {
  const t = useT();
  const { locale } = useI18n();

  const postCount = t('category.postCount', {
    count: formatNumber(category.postCount, locale),
  });
  const changed = t('category.changed', {
    date: formatRelativeDate(category.updatedAt, locale, t),
  });

  if (variant === 'list') {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 shadow-card transition-all duration-200 hover:shadow-card-hover active:scale-[0.99] cursor-pointer"
        onClick={onClick}
      >
        <FolderIcon3D color={category.color} size="xs" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-text">{category.name}</h3>
          <p className="mt-0.5 truncate text-xs text-text-secondary">
            {postCount}
            <span className="mx-1.5 text-text-secondary/40">·</span>
            {changed}
          </p>
        </div>
        <CategoryMenu onEdit={onEdit} onDelete={onDelete} align="end" />
      </div>
    );
  }

  return (
    <div
      className="relative rounded-3xl bg-surface p-4 shadow-card transition-all duration-300 hover:shadow-card-hover active:scale-[0.98] cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute top-3 start-3">
        <CategoryMenu onEdit={onEdit} onDelete={onDelete} align="start" />
      </div>

      <div className="flex flex-col items-center pt-2 pb-1">
        <FolderIcon3D color={category.color} size="md" />
        <h3 className="mt-3 text-base font-bold text-text text-center line-clamp-2">
          {category.name}
        </h3>
        <div className="mt-2 flex flex-col items-center gap-0.5">
          <span className="text-sm text-text-secondary">{postCount}</span>
          <span className="text-xs text-text-secondary/70">{changed}</span>
        </div>
      </div>
    </div>
  );
}
