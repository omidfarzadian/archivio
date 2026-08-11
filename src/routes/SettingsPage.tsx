import { useState } from "react";
import {
  IconDatabaseExport,
  IconDatabaseImport,
  IconInfoCircle,
  IconChevronLeft,
} from "@tabler/icons-react";
import { AppLayout, PageHeader } from "@/components/ui/Layout";
import {
  shareBackup,
  restoreBackup,
  pickBackupFile,
} from "@/services/backup.service";

export function SettingsPage() {
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleBackup() {
    setBacking(true);
    setMessage(null);
    try {
      await shareBackup();
      setMessage({ type: "success", text: "پشتیبان‌گیری با موفقیت انجام شد" });
    } catch {
      setMessage({ type: "error", text: "خطا در ایجاد پشتیبان" });
    } finally {
      setBacking(false);
    }
  }

  async function handleRestore() {
    const confirmed = confirm(
      "بازیابی اطلاعات تمام داده‌های فعلی را جایگزین می‌کند. آیا مطمئن هستید؟",
    );
    if (!confirmed) return;

    const file = await pickBackupFile();
    if (!file) return;

    setRestoring(true);
    setMessage(null);
    try {
      await restoreBackup(file);
      setMessage({ type: "success", text: "بازیابی با موفقیت انجام شد" });
      window.location.reload();
    } catch {
      setMessage({ type: "error", text: "خطا در بازیابی اطلاعات" });
    } finally {
      setRestoring(false);
    }
  }

  return (
    <AppLayout>
      <PageHeader title="تنظیمات" />

      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {message && (
          <div
            className={`rounded-2xl p-4 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <section>
          <h2 className="text-sm font-bold text-text-secondary mb-3 px-1">
            پشتیبان‌گیری
          </h2>
          <div className="rounded-3xl bg-surface shadow-card overflow-hidden">
            <button
              onClick={handleBackup}
              disabled={backing}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-background transition-colors disabled:opacity-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <IconDatabaseExport size={22} className="text-accent" />
              </div>
              <div className="flex-1 text-right">
                <p className="font-medium text-text">پشتیبان‌گیری</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {backing
                    ? "در حال ایجاد پشتیبان..."
                    : "ایجاد فایل پشتیبان از تمام اطلاعات"}
                </p>
              </div>
              <IconChevronLeft size={18} className="text-text-secondary" />
            </button>

            <div className="h-px bg-border mx-5" />

            <button
              onClick={handleRestore}
              disabled={restoring}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-background transition-colors disabled:opacity-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <IconDatabaseImport size={22} className="text-orange-500" />
              </div>
              <div className="flex-1 text-right">
                <p className="font-medium text-text">بازیابی اطلاعات</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {restoring ? "در حال بازیابی..." : "بازیابی از فایل پشتیبان"}
                </p>
              </div>
              <IconChevronLeft size={18} className="text-text-secondary" />
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-text-secondary mb-3 px-1">
            درباره
          </h2>
          <div className="rounded-3xl bg-surface shadow-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent">
                <IconInfoCircle size={24} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-text">Archivio</p>
                <p className="text-sm text-text-secondary">مدیریت اطلاعات و آمار</p>
                <p className="text-xs text-text-secondary/70 mt-1">
                  نسخه ۱.۰.۰
                </p>
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-4 leading-relaxed">
              تمام اطلاعات شما به صورت محلی و آفلاین روی دستگاه ذخیره می‌شود.
              هیچ داده‌ای به سرور ارسال نمی‌شود.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
