import { useEffect, useState } from "react";
import { IconFileTypePpt } from "@tabler/icons-react";
import {
  loadPptxSlides,
  type PptxPreviewData,
  type PptxSlide,
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

function SlideVisual({ slide, full }: { slide: PptxSlide; full: boolean }) {
  const ratio = slide.width > 0 && slide.height > 0 ? slide.width / slide.height : 16 / 9;
  const hasVisual = slide.images.length > 0 || slide.texts.length > 0;

  return (
    <div
      className="relative w-full overflow-hidden bg-white"
      style={{
        aspectRatio: `${ratio}`,
        background: slide.background,
        containerType: "size",
      }}
    >
      {slide.images.map((image, i) => (
        <img
          key={`img-${i}`}
          src={image.src}
          alt=""
          className="absolute object-fill"
          style={{
            left: `${image.x}%`,
            top: `${image.y}%`,
            width: `${image.w}%`,
            height: `${image.h}%`,
          }}
        />
      ))}

      {slide.texts.map((block, i) => (
        <div
          key={`txt-${i}`}
          className="absolute overflow-hidden"
          style={{
            left: `${block.x}%`,
            top: `${block.y}%`,
            width: `${block.w}%`,
            height: `${block.h}%`,
            color: block.color,
            fontSize: `${block.fontSize}cqh`,
            fontWeight: block.bold ? 700 : 500,
            lineHeight: 1.25,
            textAlign: "start",
          }}
        >
          {block.lines.map((line, li) => (
            <p
              key={li}
              className={full ? "whitespace-pre-wrap break-words" : "line-clamp-3"}
            >
              {line}
            </p>
          ))}
        </div>
      ))}

      {!hasVisual && slide.lines.length > 0 && (
        <div className="absolute inset-0 overflow-auto space-y-1.5 p-[6%]">
          {slide.lines.map((line, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-[5cqh] font-semibold text-text"
                  : "text-[3.2cqh] text-text-secondary"
              }
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function SlideCard({
  slide,
  label,
  full,
}: {
  slide: PptxSlide;
  label: string;
  full: boolean;
}) {
  const empty =
    slide.images.length === 0 &&
    slide.texts.length === 0 &&
    slide.lines.length === 0;

  return (
    <div className="overflow-hidden rounded-lg border border-orange-100 bg-white shadow-sm">
      <div className="border-b border-orange-100 px-3 py-1.5">
        <span className="text-[11px] font-medium text-orange-700">{label}</span>
      </div>
      {empty ? (
        <div className="flex aspect-video items-center justify-center bg-orange-50/40">
          <p className="text-xs italic text-text-secondary/60">—</p>
        </div>
      ) : (
        <SlideVisual slide={slide} full={full} />
      )}
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
              full={full}
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
