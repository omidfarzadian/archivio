import { useState, useEffect } from "react";
import { BottomSheet, stopFormSubmit } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IconCheck } from "@tabler/icons-react";
import { CATEGORY_COLORS } from "@/theme/constants";
import { useT } from "@/i18n";
import type { Category } from "@/features/categories/types";

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, color: string) => Promise<void>;
  editing?: Category | null;
}

export function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  editing,
}: CategoryFormModalProps) {
  const t = useT();
  const [name, setName] = useState(editing?.name || "");
  const [color, setColor] = useState(editing?.color || CATEGORY_COLORS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editing?.name || "");
      setColor(editing?.color || CATEGORY_COLORS[0]);
      setError("");
    }
  }, [open, editing]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError(t("category.form.nameRequired"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(name.trim(), color);
      setName("");
      setColor(CATEGORY_COLORS[0]);
      onClose();
    } catch (err) {
      console.error("[Mava] Category save failed:", err);
      setError(t("category.form.saveError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={
        editing ? t("category.form.editTitle") : t("category.form.createTitle")
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          stopFormSubmit(e);
          void handleSubmit();
        }}
      >
        <Input
          label={t("category.form.nameLabel")}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder={t("category.form.namePlaceholder")}
          error={error}
          autoFocus
        />

        <div>
          <label className="mb-3 block text-sm font-medium text-text">
            {t("category.form.colorLabel")}
          </label>
          <div className="flex gap-3 justify-center">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="relative h-10 w-10 rounded-full transition-transform hover:scale-110 active:scale-95 border-2 border-solid border-white outline-1 outline-solid outline-gray-200"
                style={{ backgroundColor: c }}
                aria-label={t("common.color", { color: c })}
              >
                {color === c && (
                  <IconCheck
                    size={20}
                    className="absolute inset-0 m-auto text-white drop-shadow"
                    stroke={2.5}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 whitespace-nowrap "
          >
            {loading
              ? t("common.saving")
              : editing
                ? t("common.save")
                : t("category.form.create")}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
