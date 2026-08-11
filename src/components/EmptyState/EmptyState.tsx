import { EmptyFolderIcon3D } from '@/components/ui/FolderIcon3D';
import { Button } from '@/components/ui/Button';
import { IconPlus } from '@tabler/icons-react';
import { useT } from '@/i18n';

interface EmptyStateProps {
  onCreateCategory: () => void;
}

export function EmptyState({ onCreateCategory }: EmptyStateProps) {
  const t = useT();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <EmptyFolderIcon3D className="mb-8" />
      <h2 className="text-xl font-bold text-text text-center mb-3">
        {t('empty.noCategoriesTitle')}
      </h2>
      <p className="text-sm text-text-secondary text-center leading-relaxed mb-8 max-w-[260px]">
        {t('empty.noCategoriesBody')}
      </p>
      <Button onClick={onCreateCategory} size="lg" className="min-w-[200px]">
        <IconPlus size={20} />
        {t('empty.newCategory')}
      </Button>
    </div>
  );
}
