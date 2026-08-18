import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons-react";
import type { Attachment } from "@/features/categories/types";
import { AttachmentDownloadButton } from "@/components/AttachmentCard/AttachmentDownloadButton";
import { PdfPreview } from "@/components/AttachmentCard/PdfPreview";
import { PptxPreview } from "@/components/AttachmentCard/PptxPreview";
import { DocxPreview } from "@/components/AttachmentCard/DocxPreview";
import { ExcelPreview } from "@/components/AttachmentCard/ExcelPreview";
import { isPdfFile } from "@/services/pdf-preview.service";
import { isPptxFile } from "@/services/pptx-preview.service";
import { isDocxFile } from "@/services/docx-preview.service";
import { isExcelFile } from "@/services/xlsx-preview.service";
import { readFileAsBlobUrl } from "@/services/file.service";
import { useT } from "@/i18n";

interface AttachmentViewerProps {
  attachment: Attachment;
  onClose: () => void;
}

function ImageView({ attachment }: { attachment: Attachment }) {
  const [url, setUrl] = useState<string | null>(
    attachment.localPath.startsWith("data:") ? attachment.localPath : null,
  );

  useEffect(() => {
    if (attachment.localPath.startsWith("data:")) return;

    let revoked = false;
    let objectUrl: string | null = null;
    readFileAsBlobUrl(attachment.localPath, attachment.mimeType)
      .then((u) => {
        objectUrl = u;
        if (!revoked) setUrl(u);
      })
      .catch(() => setUrl(null));

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.localPath, attachment.mimeType]);

  if (!url) {
    return <div className="h-40 w-40 animate-pulse rounded-2xl bg-white/10" />;
  }

  return (
    <img
      src={url}
      alt={attachment.name}
      className="max-h-full max-w-full rounded-lg object-contain"
    />
  );
}

function AttachmentBody({ attachment }: { attachment: Attachment }) {
  const { mimeType, name, localPath } = attachment;

  if (attachment.type === "image") {
    return (
      <div className="flex h-full min-h-0 items-center justify-center overflow-auto p-4">
        <ImageView attachment={attachment} />
      </div>
    );
  }

  const commonProps = {
    name,
    mimeType,
    localPath,
    className: "shadow-lg min-h-0 flex-1",
  };

  if (isPdfFile(mimeType, name)) {
    return (
      <div className="flex h-full min-h-0 flex-col p-3 sm:p-4">
        <PdfPreview {...commonProps} full />
      </div>
    );
  }

  if (isPptxFile(mimeType, name)) {
    return (
      <div className="flex h-full min-h-0 flex-col p-3 sm:p-4">
        <PptxPreview {...commonProps} full />
      </div>
    );
  }

  if (isExcelFile(mimeType, name)) {
    return (
      <div className="flex h-full min-h-0 flex-col p-3 sm:p-4">
        <ExcelPreview {...commonProps} full />
      </div>
    );
  }

  if (isDocxFile(mimeType, name)) {
    return (
      <div className="flex h-full min-h-0 flex-col p-3 sm:p-4">
        <DocxPreview {...commonProps} full />
      </div>
    );
  }

  return null;
}

export function AttachmentViewer({
  attachment,
  onClose,
}: AttachmentViewerProps) {
  const t = useT();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/90 animate-fade-in">
      <div className="shrink-0 border-b border-white/10 bg-black/40 safe-top-viewer">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label={t("common.close")}
          >
            <IconX size={22} className="text-white" />
          </button>
          <p
            className="flex-1 min-w-0 truncate text-sm font-medium text-white"
            style={{ direction: "ltr" }}
          >
            {attachment.name}
          </p>
          <AttachmentDownloadButton
            name={attachment.name}
            mimeType={attachment.mimeType}
            localPath={attachment.localPath}
            size={20}
            className="h-9 w-9 text-white hover:bg-white/10"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden overscroll-contain safe-bottom">
        <AttachmentBody attachment={attachment} />
      </div>
    </div>
  );
}
