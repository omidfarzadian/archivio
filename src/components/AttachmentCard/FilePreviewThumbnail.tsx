import { isDocxFile } from '@/services/docx-preview.service';
import { isExcelFile } from '@/services/xlsx-preview.service';
import { DocxPreview } from '@/components/AttachmentCard/DocxPreview';
import { ExcelPreview } from '@/components/AttachmentCard/ExcelPreview';
import { AttachmentDownloadButton } from '@/components/AttachmentCard/AttachmentDownloadButton';
import {
  IconFile,
  IconFileTypePdf,
  IconFileSpreadsheet,
  IconFileTypeDocx,
} from '@tabler/icons-react';
import { getFileIcon } from '@/services/picker.service';

interface FilePreviewThumbnailProps {
  mimeType: string;
  name: string;
  base64?: string;
  localPath?: string;
  className?: string;
}

function FileTypeIcon({ mimeType, name }: { mimeType: string; name: string }) {
  const type = getFileIcon(mimeType, name);
  const iconProps = { size: 22, stroke: 1.5 as const };

  switch (type) {
    case 'excel':
      return <IconFileSpreadsheet {...iconProps} className="text-green-600" />;
    case 'word':
      return <IconFileTypeDocx {...iconProps} className="text-blue-600" />;
    case 'pdf':
      return <IconFileTypePdf {...iconProps} className="text-red-500" />;
    default:
      return <IconFile {...iconProps} className="text-text-secondary" />;
  }
}

function getFileTypeLabel(mimeType: string, name: string): string {
  const type = getFileIcon(mimeType, name);
  switch (type) {
    case 'excel':
      return 'Excel';
    case 'word':
      return 'Word';
    case 'pdf':
      return 'PDF';
    default:
      return 'فایل';
  }
}

export function FilePreviewThumbnail({
  mimeType,
  name,
  base64,
  localPath,
  className,
}: FilePreviewThumbnailProps) {
  if (isExcelFile(mimeType, name)) {
    return (
      <ExcelPreview
        base64={base64}
        localPath={localPath}
        name={name}
        mimeType={mimeType}
        className={className}
      />
    );
  }

  if (isDocxFile(mimeType, name)) {
    return (
      <DocxPreview
        base64={base64}
        localPath={localPath}
        name={name}
        mimeType={mimeType}
        className={className}
      />
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-background ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2">
        <div className="flex items-center gap-2">
          <FileTypeIcon mimeType={mimeType} name={name} />
          <span className="text-xs font-medium text-text-secondary">
            {getFileTypeLabel(mimeType, name)}
          </span>
        </div>
        <AttachmentDownloadButton
          name={name}
          mimeType={mimeType}
          base64={base64}
          localPath={localPath}
        />
      </div>
      <div className="flex h-14 items-center justify-center px-3">
        <FileTypeIcon mimeType={mimeType} name={name} />
      </div>
    </div>
  );
}

export function hasFilePreview(mimeType: string, name: string): boolean {
  return isExcelFile(mimeType, name) || isDocxFile(mimeType, name);
}
