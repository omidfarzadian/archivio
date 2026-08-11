import { useState } from "react";
import {
  IconDatabaseExport,
  IconDatabaseImport,
  IconInfoCircle,
  IconLanguage,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
} from "@tabler/icons-react";
import { AppLayout, PageHeader } from "@/components/ui/Layout";
import {
  shareBackup,
  restoreBackup,
  pickBackupFile,
} from "@/services/backup.service";
import { LOCALE_META, LOCALES, useI18n, useT, type Locale } from "@/i18n";

export function SettingsPage() {
  const t = useT();
  const { locale, setLocale, isRtl } = useI18n();
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const Chevron = isRtl ? IconChevronLeft : IconChevronRight;

  async function handleBackup() {
    setBacking(true);
    setMessage(null);
    try {
      await shareBackup();
      setMessage({ type: "success", text: t("settings.backupSuccess") });
    } catch {
      setMessage({ type: "error", text: t("settings.backupError") });
    } finally {
      setBacking(false);
    }
  }

  async function handleRestore() {
    const confirmed = confirm(t("settings.restoreConfirm"));
    if (!confirmed) return;

    const file = await pickBackupFile();
    if (!file) return;

    setRestoring(true);
    setMessage(null);
    try {
      await restoreBackup(file);
      setMessage({ type: "success", text: t("settings.restoreSuccess") });
      window.location.reload();
    } catch {
      setMessage({ type: "error", text: t("settings.restoreError") });
    } finally {
      setRestoring(false);
    }
  }

  function handleLocaleChange(next: Locale) {
    if (next === locale) return;
    setLocale(next);
  }

  return (
    <AppLayout>
      <PageHeader title={t("settings.title")} />

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
            {t("settings.languageSection")}
          </h2>
          <div className="rounded-3xl bg-surface shadow-card overflow-hidden">
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <IconLanguage size={22} className="text-accent" />
              </div>
              <div className="flex-1 text-start">
                <p className="font-medium text-text">{t("settings.language")}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {t("settings.languageDesc")}
                </p>
              </div>
            </div>
            <div className="h-px bg-border mx-5" />
            <div className="p-3 space-y-2">
              {LOCALES.map((code) => {
                const selected = locale === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleLocaleChange(code)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 transition-colors ${
                      selected
                        ? "bg-accent/10 text-accent"
                        : "hover:bg-background text-text"
                    }`}
                  >
                    <span className="font-medium">
                      {LOCALE_META[code].nativeLabel}
                    </span>
                    {selected && <IconCheck size={18} stroke={2.5} />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-text-secondary mb-3 px-1">
            {t("settings.backupSection")}
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
              <div className="flex-1 text-start">
                <p className="font-medium text-text">{t("settings.backup")}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {backing ? t("settings.backuping") : t("settings.backupDesc")}
                </p>
              </div>
              <Chevron size={18} className="text-text-secondary" />
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
              <div className="flex-1 text-start">
                <p className="font-medium text-text">{t("settings.restore")}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {restoring
                    ? t("settings.restoring")
                    : t("settings.restoreDesc")}
                </p>
              </div>
              <Chevron size={18} className="text-text-secondary" />
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-text-secondary mb-3 px-1">
            {t("settings.aboutSection")}
          </h2>
          <div className="rounded-3xl bg-surface shadow-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent">
                <IconInfoCircle size={24} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-text">{t("app.name")}</p>
                <p className="text-sm text-text-secondary">{t("app.tagline")}</p>
                <p className="text-xs text-text-secondary/70 mt-1">
                  {t("app.version", { version: "1.0.0" })}
                </p>
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-4 leading-relaxed">
              {t("app.aboutBody")}
            </p>
            <p className="text-xs text-text-secondary mt-8 leading-relaxed">
              {t("app.madeWithLove")}
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
