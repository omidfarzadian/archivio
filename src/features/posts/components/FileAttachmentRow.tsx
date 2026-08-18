import { IconX } from "@tabler/icons-react";
import { formatFileSize } from "@/utils/format";
import { getFileIcon } from "@/services/picker.service";
import { FilePreviewThumbnail } from "@/components/AttachmentCard/FilePreviewThumbnail";
import type { Attachment } from "@/features/categories/types";
import type { PickedFile } from "@/services/picker.service";
import { useI18n, useT } from "@/i18n";

interface FileAttachmentRowProps {
  name: string;
  mimeType: string;
  size: number;
  base64?: string;
  localPath?: string;
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

export function FileAttachmentRow({
  name,
  mimeType,
  size,
  base64,
  localPath,
  onRemove,
}: FileAttachmentRowProps) {
  const t = useT();
  const { locale } = useI18n();

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="flex flex-col-reverse gap-3 p-3">
        <FilePreviewThumbnail
          mimeType={mimeType}
          name={name}
          base64={base64}
          localPath={localPath}
        />

        <div className="w-full flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium text-text truncate"
              style={{ direction: "ltr" }}
            >
              {name}
            </p>
            <p
              className="text-start text-xs text-text-secondary mt-0.5"
              style={{ direction: "ltr" }}
            >
              {getFileTypeLabel(mimeType, name, t("common.file"))} ·{" "}
              {formatFileSize(size, locale, t)}
            </p>
          </div>

          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-background transition-colors"
              aria-label={t("post.editor.deleteFile")}
            >
              <IconX size={18} className="text-text-secondary" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function pickedFileToAttachment(
  file: PickedFile,
  index: number,
): Attachment {
  return {
    id: `temp-${index}`,
    postId: "",
    type: file.mimeType.startsWith("image/") ? "image" : "document",
    name: file.name,
    mimeType: file.mimeType,
    size: file.size,
    localPath: `data:${file.mimeType};base64,${file.base64}`,
    createdAt: "",
  };
}
