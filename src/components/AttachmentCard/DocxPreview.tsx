import { useEffect, useRef, useState } from "react";
import { IconFileTypeDocx } from "@tabler/icons-react";
import { loadFileBytes } from "@/services/file-bytes.service";
import { extractDocxPlainText } from "@/services/docx-preview.service";
import { AttachmentDownloadButton } from "@/components/AttachmentCard/AttachmentDownloadButton";
import { useT } from "@/i18n";

interface DocxPreviewProps {
  base64?: string;
  localPath?: string;
  name: string;
  mimeType: string;
  className?: string;
  /** Render every slide (full-screen viewer) instead of just the first. */
  full?: boolean;
}

type PreviewStatus = "loading" | "ready" | "text" | "failed";

export function DocxPreview({
  base64,
  localPath,
  name,
  mimeType,
  className,
  full = false,
}: DocxPreviewProps) {
  const t = useT();
  const bodyRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<PreviewStatus>("loading");
  const [plainText, setPlainText] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const body = bodyRef.current;
      const style = styleRef.current;
      if (!body || !style) return;

      setStatus("loading");
      setPlainText("");
      body.innerHTML = "";
      style.innerHTML = "";

      try {
        const bytes = await loadFileBytes(base64, localPath);
        if (!bytes) {
          if (!cancelled) setStatus("failed");
          return;
        }

        const { renderAsync } = await import("docx-preview");
        if (cancelled) return;

        await renderAsync(bytes, body, style, {
          className: "docx-thumb",
          inWrapper: true,
          ignoreWidth: true,
          ignoreHeight: true,
          breakPages: false,
          ignoreFonts: true,
          renderHeaders: false,
          renderFooters: false,
          renderFootnotes: false,
          renderEndnotes: false,
          useBase64URL: true,
        });

        if (cancelled) return;

        const renderedText = body.textContent?.trim() ?? "";
        if (renderedText.length > 0) {
          setStatus("ready");
          return;
        }

        const fallbackText = await extractDocxPlainText(bytes);
        if (cancelled) return;

        if (fallbackText.length > 0) {
          setPlainText(fallbackText);
          setStatus("text");
          return;
        }

        setStatus("failed");
      } catch {
        if (cancelled) return;

        try {
          const bytes = await loadFileBytes(base64, localPath);
          if (bytes) {
            const fallbackText = await extractDocxPlainText(bytes);
            if (!cancelled && fallbackText.length > 0) {
              setPlainText(fallbackText);
              setStatus("text");
              return;
            }
          }
        } catch {
          // ignore
        }

        if (!cancelled) setStatus("failed");
      }
    }

    const frame = requestAnimationFrame(() => {
      void load();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      if (bodyRef.current) bodyRef.current.innerHTML = "";
      if (styleRef.current) styleRef.current.innerHTML = "";
    };
  }, [base64, localPath, name]);

  const scrollClass = full
    ? "file-preview-scroll-full"
    : "file-preview-scroll";

  return (
    <div
      className={`overflow-hidden rounded-xl border border-blue-100 bg-white ${full ? "flex h-full min-h-0 flex-col" : ""} ${className ?? ""}`}
    >
      <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <IconFileTypeDocx size={16} className="text-blue-600" />
          <span className="text-xs font-medium text-blue-700">Word</span>
        </div>
        <AttachmentDownloadButton
          name={name}
          mimeType={mimeType}
          base64={base64}
          localPath={localPath}
          className="text-blue-700 hover:bg-blue-100"
        />
      </div>

      <div
        className={`relative bg-white ${full ? "flex min-h-0 flex-1 flex-col" : ""}`}
      >
        <div ref={styleRef} className="docx-thumb-styles" aria-hidden />

        <div
          className={`${scrollClass} docx-preview-body ${
            status === "text" || status === "failed" ? "hidden" : ""
          } ${status === "loading" ? "opacity-0" : ""}`}
        >
          <div ref={bodyRef} className="docx-preview-content" />
        </div>

        {status === "text" && (
          <div className={`${scrollClass} p-4`}>
            <p className="text-sm leading-relaxed text-text whitespace-pre-wrap">
              {plainText}
            </p>
          </div>
        )}

        {status === "failed" && (
          <div
            className={`${scrollClass} flex ${full ? "" : "h-48"} items-center justify-center gap-2 bg-blue-50/50`}
          >
            <IconFileTypeDocx size={24} className="text-blue-600" />
            <span className="text-xs text-blue-700">
              {t("attachment.word")}
            </span>
          </div>
        )}

        {status === "loading" && (
          <div className="absolute inset-0 animate-pulse bg-blue-50/50 pointer-events-none" />
        )}
      </div>
    </div>
  );
}
