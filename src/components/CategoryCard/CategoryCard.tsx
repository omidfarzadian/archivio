import { IconDotsVertical } from '@tabler/icons-react';
import { FolderIcon3D } from '@/components/ui/FolderIcon3D';
import { formatNumber, formatRelativeDate } from '@/utils/format';
import { useI18n, useT } from '@/i18n';
import type { CategoryWithStats } from '@/features/categories/types';
import { useState, useRef, useEffect } from 'react';

interface CategoryCardProps {
  category: CategoryWithStats;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CategoryCard({ category, onClick, onEdit, onDelete }: CategoryCardProps) {
  const t = useT();
  const { locale } = useI18n();
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
    <div
      className="relative rounded-3xl bg-surface p-4 shadow-card transition-all duration-300 hover:shadow-card-hover active:scale-[0.98] cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute top-3 start-3 z-10" ref={menuRef}>
        <button
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
          <div className="absolute top-full start-0 mt-1 w-36 rounded-2xl bg-surface border border-border shadow-elevated overflow-hidden z-20 animate-fade-in">
            <button
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

      <div className="flex flex-col items-center pt-2 pb-1">
        <FolderIcon3D color={category.color} size="md" />
        <h3 className="mt-3 text-base font-bold text-text text-center line-clamp-2">
          {category.name}
        </h3>
        <div className="mt-2 flex flex-col items-center gap-0.5">
          <span className="text-sm text-text-secondary">
            {t('category.postCount', {
              count: formatNumber(category.postCount, locale),
            })}
          </span>
          <span className="text-xs text-text-secondary/70">
            {t('category.changed', {
              date: formatRelativeDate(category.updatedAt, locale, t),
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
