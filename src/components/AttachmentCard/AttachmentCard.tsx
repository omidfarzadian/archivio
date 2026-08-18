import { IconX } from "@tabler/icons-react";
import { formatFileSize } from "@/utils/format";
import { getFileIcon } from "@/services/picker.service";
import { FilePreviewThumbnail } from "@/components/AttachmentCard/FilePreviewThumbnail";
import { AttachmentDownloadButton } from "@/components/AttachmentCard/AttachmentDownloadButton";
import { AttachmentViewer } from "@/components/AttachmentCard/AttachmentViewer";
import type { Attachment } from "@/features/categories/types";
import { useEffect, useState, type KeyboardEvent } from "react";
import { readFileAsBlobUrl } from "@/services/file.service";
import { useI18n, useT } from "@/i18n";

interface AttachmentCardProps {
  attachment: Attachment;
  onRemove?: () => void;
}

function getFileTypeLabel(
  mimeType: string,
  name: string,
  fileLabel: string,
): string {
  const type = getFileIcon(mimeType, name);
  switch (type) {
    case "excel":
      return "Excel";
    case "word":
      return "Word";
    case "pdf":
      return "PDF";
    case "powerpoint":
      return "PowerPoint";
    default:
      return fileLabel;
  }
}

function DocumentAttachmentContent({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove?: () => void;
}) {
  const t = useT();
  const { locale } = useI18n();

  return (
    <div className="flex flex-col-reverse gap-3 p-3">
      <FilePreviewThumbnail
        mimeType={attachment.mimeType}
        name={attachment.name}
        localPath={attachment.localPath}
      />
      <div className="w-full flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium text-text truncate"
            style={{ direction: "ltr" }}
          >
            {attachment.name}
          </p>
          <p
            className="text-start text-xs text-text-secondary mt-0.5"
            style={{ direction: "ltr" }}
          >
            {getFileTypeLabel(
              attachment.mimeType,
              attachment.name,
              t("common.file"),
            )}{" "}
            · {formatFileSize(attachment.size, locale, t)}
          </p>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-background transition-colors"
            aria-label={t("post.editor.deleteFile")}
          >
            <IconX size={18} className="text-text-secondary" />
          </button>
        )}
      </div>
    </div>
  );
}

export function AttachmentCard({ attachment, onRemove }: AttachmentCardProps) {
  const t = useT();
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const openViewer = () => setViewerOpen(true);
  const openViewerFromKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setViewerOpen(true);
    }
  };

  useEffect(() => {
    if (attachment.type !== "image") return;

    if (attachment.localPath.startsWith("data:")) {
      setThumbUrl(attachment.localPath);
      return;
    }

    let revoked = false;
    readFileAsBlobUrl(attachment.localPath, attachment.mimeType)
      .then((url) => {
        if (!revoked) setThumbUrl(url);
      })
      .catch(() => setThumbUrl(null));

    return () => {
      revoked = true;
    };
  }, [attachment.localPath, attachment.mimeType, attachment.type]);

  if (attachment.type === "image") {
    return (
      <div className="relative aspect-square group">
        <button
          type="button"
          onClick={openViewer}
          className="h-full w-full rounded-2xl overflow-hidden bg-background border border-border block cursor-pointer"
          aria-label={t("attachment.view")}
        >
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={attachment.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-border" />
          )}
        </button>
        <div className="absolute top-1.5 end-1.5 flex items-center gap-1">
          <AttachmentDownloadButton
            name={attachment.name}
            mimeType={attachment.mimeType}
            localPath={attachment.localPath}
            className="bg-surface/90 border border-border shadow-sm"
          />
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1.5 start-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 border border-border shadow-sm"
            aria-label={t("post.editor.deleteImage")}
          >
            <IconX size={12} className="text-text-secondary" />
          </button>
        )}
        {viewerOpen && (
          <AttachmentViewer
            attachment={attachment}
            onClose={() => setViewerOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openViewer}
        onKeyDown={openViewerFromKey}
        className="rounded-2xl border border-border bg-surface overflow-hidden cursor-pointer transition-colors hover:border-accent/40"
        aria-label={t("attachment.view")}
      >
        <DocumentAttachmentContent attachment={attachment} onRemove={onRemove} />
      </div>
      {viewerOpen && (
        <AttachmentViewer
          attachment={attachment}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}

interface ImageGalleryProps {
  attachments: Attachment[];
  onRemove?: (attachment: Attachment) => void;
}

export function ImageGallery({ attachments, onRemove }: ImageGalleryProps) {
  const images = attachments.filter((a) => a.type === "image");
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {images.map((img) => (
        <AttachmentCard
          key={img.id}
          attachment={img}
          onRemove={onRemove ? () => onRemove(img) : undefined}
        />
      ))}
    </div>
  );
}
