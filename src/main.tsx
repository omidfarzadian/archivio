import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { bootstrapApp } from "@/app/bootstrap";
import "./index.css";

function LoadingScreen() {
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-2xl gradient-accent animate-pulse" />
        <p className="text-sm text-text-secondary">در حال بارگذاری...</p>
      </div>
    </div>
  );
}

function Root() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bootstrapApp()
      .then(() => setReady(true))
      .catch((err) => {
        console.error("[Archivio] Init failed:", err);
        setError(
          "خطا در راه‌اندازی برنامه. لطفاً صفحه را مجدداً بارگذاری کنید.",
        );
      });
  }, []);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6">
        <p className="text-danger text-center">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-2xl bg-accent px-5 py-2.5 text-sm text-white"
        >
          بارگذاری مجدد
        </button>
      </div>
    );
  }

  if (!ready) return <LoadingScreen />;
  return <App />;
}

createRoot(document.getElementById("root")!).render(<Root />);
