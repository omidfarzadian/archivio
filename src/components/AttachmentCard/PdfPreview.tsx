import { useEffect, useRef, useState } from "react";
import { IconFileTypePdf } from "@tabler/icons-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  loadPdfDocument,
  renderPdfPageToCanvas,
} from "@/services/pdf-preview.service";
import { AttachmentDownloadButton } from "@/components/AttachmentCard/AttachmentDownloadButton";
import { useT } from "@/i18n";

interface PdfPreviewProps {
  base64?: string;
  localPath?: string;
  name: string;
  mimeType: string;
  className?: string;
  /** Render every page in a tall scroll area (full-screen viewer) instead of just the first. */
  full?: boolean;
}

type Status = "loading" | "ready" | "failed";

export function PdfPreview({
  base64,
  localPath,
  name,
  mimeType,
  className,
  full = false,
}: PdfPreviewProps) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let doc: PDFDocumentProxy | null = null;

    async function load() {
      const container = containerRef.current;
      if (!container) return;

      setStatus("loading");
      setPageCount(0);
      container.innerHTML = "";

      try {
        doc = await loadPdfDocument(base64, localPath);
        if (!doc) {
          if (!cancelled) setStatus("failed");
          return;
        }
        if (cancelled) return;

        const totalPages = full ? doc.numPages : 1;
        const width = Math.min(container.clientWidth || 320, full ? 900 : 320);

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const canvas = await renderPdfPageToCanvas(doc, pageNum, width);
          if (cancelled) return;
          canvas.className =
            "w-full block mx-auto" + (pageNum > 1 ? " mt-3" : "");
          container.appendChild(canvas);
        }

        if (!cancelled) {
          setPageCount(doc.numPages);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("failed");
      }
    }

    const frame = requestAnimationFrame(() => void load());

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      if (containerRef.current) containerRef.current.innerHTML = "";
      void doc?.destroy();
    };
  }, [base64, localPath, name, full]);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-red-100 bg-white ${full ? "flex h-full min-h-0 flex-col" : ""} ${className ?? ""}`}
    >
      <div className="flex items-center justify-between border-b border-red-100 bg-red-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <IconFileTypePdf size={16} className="text-red-500" />
          <span className="text-xs font-medium text-red-700">
            {pageCount > 0 && full
              ? t("attachment.pdfPages").replace("{{n}}", String(pageCount))
              : "PDF"}
          </span>
        </div>
        <AttachmentDownloadButton
          name={name}
          mimeType={mimeType}
          base64={base64}
          localPath={localPath}
          className="text-red-700 hover:bg-red-100"
        />
      </div>

      <div
        className={`relative bg-neutral-100 ${full ? "file-preview-scroll-full" : "file-preview-scroll"}`}
      >
        <div
          ref={containerRef}
          className={`p-3 ${status === "ready" ? "" : "opacity-0"}`}
        />

        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50/50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
          </div>
        )}

        {status === "failed" && (
          <div className="flex h-48 items-center justify-center gap-2 bg-red-50/50">
            <IconFileTypePdf size={24} className="text-red-500" />
            <span className="text-xs text-red-700">{t("attachment.pdf")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
