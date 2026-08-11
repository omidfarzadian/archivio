import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { bootstrapApp } from "@/app/bootstrap";
import {
  applyDocumentLocale,
  I18nProvider,
  resolveInitialLocale,
  useT,
} from "@/i18n";
import "./index.css";

const initialLocale = resolveInitialLocale();
applyDocumentLocale(initialLocale);

function LoadingScreen() {
  const t = useT();
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 overflow-hidden rounded-2xl animate-pulse">
          <img src="/favicon.svg" alt={t("app.name")} className="h-full w-full" />
        </div>
        <p className="text-sm text-text-secondary">{t("app.loading")}</p>
      </div>
    </div>
  );
}

function BootstrapError({ message }: { message: string }) {
  const t = useT();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6">
      <p className="text-danger text-center">{message}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-2xl bg-accent px-5 py-2.5 text-sm text-white"
      >
        {t("app.reload")}
      </button>
    </div>
  );
}

function Root() {
  const t = useT();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bootstrapApp()
      .then(() => setReady(true))
      .catch((err) => {
        console.error("[Mava] Init failed:", err);
        setError(t("app.initError"));
      });
  }, [t]);

  if (error) return <BootstrapError message={error} />;
  if (!ready) return <LoadingScreen />;
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <I18nProvider initialLocale={initialLocale}>
    <Root />
  </I18nProvider>,
);
