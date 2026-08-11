import { IconX } from "@tabler/icons-react";
import type { FormEvent, ReactNode } from "react";
import { useT } from "@/i18n";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const t = useT();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative z-10 w-full max-w-lg animate-slide-up rounded-t-3xl bg-surface !p-6 shadow-elevated safe-bottom sm:rounded-3xl sm:m-4"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-background transition-colors"
              aria-label={t("common.close")}
            >
              <IconX size={20} className="text-text-secondary" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {children}
    </Modal>
  );
}

export function stopFormSubmit(e: FormEvent) {
  e.preventDefault();
}
