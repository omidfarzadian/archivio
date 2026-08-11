import { IconDownload } from '@tabler/icons-react';
import { downloadAttachment, type DownloadAttachmentOptions } from '@/services/file.service';
import { useT } from '@/i18n';

interface AttachmentDownloadButtonProps extends DownloadAttachmentOptions {
  className?: string;
  size?: number;
}

export function AttachmentDownloadButton({
  className,
  size = 16,
  ...options
}: AttachmentDownloadButtonProps) {
  const t = useT();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        void downloadAttachment(options).catch(() => {
          alert(t('attachment.downloadError'));
        });
      }}
      className={`flex h-7 w-7 items-center justify-center rounded-lg hover:bg-black/5 transition-colors ${className ?? ''}`}
      aria-label={t('attachment.download')}
    >
      <IconDownload size={size} stroke={1.75} className="text-current" />
    </button>
  );
}
