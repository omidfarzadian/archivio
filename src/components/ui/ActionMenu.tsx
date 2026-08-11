import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  icon?: ReactNode;
}

interface ActionMenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  items: ActionMenuItem[];
}

export function ActionMenu({ open, onClose, anchorRef, items }: ActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !anchorRef.current) return null;

  const rect = anchorRef.current.getBoundingClientRect();
  const menuWidth = 160;
  const left = Math.min(
    Math.max(rect.left, 12),
    window.innerWidth - menuWidth - 12,
  );

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" aria-hidden />
      <div
        ref={menuRef}
        role="menu"
        className="fixed z-50 min-w-[160px] overflow-hidden rounded-2xl border border-border bg-surface py-1.5 shadow-elevated animate-fade-in"
        style={{ top: rect.bottom + 6, left }}
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-background ${
              item.variant === 'danger' ? 'text-danger' : 'text-text'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </>,
    document.body,
  );
}
