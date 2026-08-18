import { useEffect, useState } from "react";
import { IconFileTypePpt } from "@tabler/icons-react";
import {
  loadPptxSlides,
  type PptxPreviewData,
} from "@/services/pptx-preview.service";
import { AttachmentDownloadButton } from "@/components/AttachmentCard/AttachmentDownloadButton";
import { useT } from "@/i18n";

interface PptxPreviewProps {
  base64?: string;
  localPath?: string;
  name: string;
  mimeType: string;
  className?: string;
  /** Render every slide (full-screen viewer) instead of just the first. */
  full?: boolean;
}

function SlideCard({
  slide,
  label,
}: {
  slide: { lines: string[] };
  label: string;
}) {
  return (
    <div className="rounded-lg border border-orange-100 bg-white shadow-sm">
      <div className="border-b border-orange-100 px-3 py-1.5">
        <span className="text-[11px] font-medium text-orange-700">{label}</span>
      </div>
      <div className="aspect-video overflow-hidden px-4 py-3">
        {slide.lines.length > 0 ? (
          <div className="space-y-1.5">
            {slide.lines.map((line, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-sm font-semibold text-text line-clamp-2"
                    : "text-xs text-text-secondary line-clamp-2"
                }
              >
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-text-secondary/60">—</p>
        )}
      </div>
    </div>
  );
}

export function PptxPreview({
  base64,
  localPath,
  name,
  mimeType,
  className,
  full = false,
}: PptxPreviewProps) {
  const t = useT();
  const [data, setData] = useState<PptxPreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    loadPptxSlides(base64, localPath)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [base64, localPath, name]);

  const header = (
    <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50 px-3 py-2">
      <div className="flex items-center gap-2">
        <IconFileTypePpt size={16} className="text-orange-600" />
        <span className="text-xs font-medium text-orange-700">
          {data && data.totalSlides > 0 && full
            ? t("attachment.pptxSlides").replace(
                "{{n}}",
                String(data.totalSlides),
              )
            : "PowerPoint"}
        </span>
      </div>
      <AttachmentDownloadButton
        name={name}
        mimeType={mimeType}
        base64={base64}
        localPath={localPath}
        className="text-orange-700 hover:bg-orange-100"
      />
    </div>
  );

  const shellClass = `overflow-hidden rounded-xl border border-orange-100 bg-white ${full ? "flex h-full min-h-0 flex-col" : ""} ${className ?? ""}`;
  const scrollClass = full
    ? "file-preview-scroll-full"
    : "file-preview-scroll";

  if (loading) {
    return (
      <div className={shellClass}>
        {header}
        <div
          className={`${scrollClass} ${full ? "" : "h-48"} animate-pulse bg-orange-50/40`}
        />
      </div>
    );
  }

  const slides = data?.slides ?? [];
  if (slides.length === 0) {
    return (
      <div className={shellClass}>
        {header}
        <div
          className={`${scrollClass} flex ${full ? "" : "h-48"} items-center justify-center gap-2 bg-orange-50/50`}
        >
          <IconFileTypePpt size={24} className="text-orange-600" />
          <span className="text-xs text-orange-700">
            {t("attachment.powerpoint")}
          </span>
        </div>
      </div>
    );
  }

  const visibleSlides = full ? slides : slides.slice(0, 1);

  return (
    <div className={shellClass}>
      {header}
      <div className={scrollClass}>
        <div className="space-y-3 bg-orange-50/30 p-3">
          {visibleSlides.map((slide) => (
            <SlideCard
              key={slide.index}
              slide={slide}
              label={t("attachment.slideLabel").replace(
                "{{n}}",
                String(slide.index),
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
