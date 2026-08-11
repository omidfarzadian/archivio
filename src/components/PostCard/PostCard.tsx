import { useState, useRef } from "react";
import {
  IconDotsVertical,
  IconStar,
  IconStarFilled,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import {
  AttachmentCard,
  ImageGallery,
} from "@/components/AttachmentCard/AttachmentCard";
import { ActionMenu } from "@/components/ui/ActionMenu";
import {
  formatDate,
  htmlToPlainText,
  sanitizeRichTextHtml,
} from "@/utils/format";
import { useI18n, useT } from "@/i18n";
import type { PostWithAttachments } from "@/features/categories/types";

interface PostCardProps {
  post: PostWithAttachments;
  onEdit: () => void;
  onDelete: () => void;
  isStarred?: boolean;
  onToggleStar?: () => void;
}

export function PostCard({
  post,
  onEdit,
  onDelete,
  isStarred,
  onToggleStar,
}: PostCardProps) {
  const t = useT();
  const { locale } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const documents = post.attachments.filter((a) => a.type === "document");
  const previewHtml = sanitizeRichTextHtml(post.content);
  const hasPreview = Boolean(htmlToPlainText(post.content));

  async function handleDelete() {
    if (confirm(t("post.confirmDelete"))) {
      onDelete();
    }
  }

  return (
    <div className="rounded-3xl bg-surface p-5 shadow-card transition-all duration-200 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-bold text-text flex-1">{post.title}</h3>
        <div className="flex items-center gap-1 shrink-0">
          {onToggleStar && (
            <button
              type="button"
              onClick={onToggleStar}
              className="p-1"
              aria-label={t("common.star")}
            >
              {isStarred ? (
                <IconStarFilled size={18} className="text-amber-400" />
              ) : (
                <IconStar size={18} className="text-text-secondary/40" />
              )}
            </button>
          )}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="p-1 rounded-lg hover:bg-background transition-colors"
            aria-label={t("common.menu")}
            aria-expanded={menuOpen}
          >
            <IconDotsVertical size={18} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {hasPreview && (
        <div
          className="post-rich-text text-sm text-text-secondary leading-relaxed mb-3 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      )}

      {documents.length > 0 && (
        <div className="space-y-2 mb-3">
          {documents.slice(0, 2).map((doc) => (
            <AttachmentCard key={doc.id} attachment={doc} />
          ))}
        </div>
      )}

      {post.attachments.some((a) => a.type === "image") && (
        <div className="mb-3">
          <ImageGallery attachments={post.attachments} />
        </div>
      )}

      <p className="text-xs text-text-secondary">
        {formatDate(post.createdAt, locale)}
      </p>

      <ActionMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorRef={menuButtonRef}
        items={[
          {
            label: t("common.edit"),
            icon: <IconPencil size={18} stroke={1.75} />,
            onClick: onEdit,
          },
          {
            label: t("common.delete"),
            icon: <IconTrash size={18} stroke={1.75} />,
            variant: "danger",
            onClick: handleDelete,
          },
        ]}
      />
    </div>
  );
}
