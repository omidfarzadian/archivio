import { useState, useEffect, useRef, useCallback } from "react";
import {
  IconX,
  IconBold,
  IconItalic,
  IconUnderline,
  IconLink,
  IconPhoto,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileAttachmentRow } from "@/features/posts/components/FileAttachmentRow";
import { AttachmentDownloadButton } from "@/components/AttachmentCard/AttachmentDownloadButton";
import { type PickedFile } from "@/services/picker.service";
import { readFileAsBlobUrl } from "@/services/file.service";
import { cn } from "@/utils/format";
import { useT } from "@/i18n";
import type { Attachment } from "@/features/categories/types";

type FormatCommand = 'bold' | 'italic' | 'underline';

const FORMAT_COMMANDS = new Set<string>(['bold', 'italic', 'underline']);

const INITIAL_ACTIVE_FORMATS: Record<FormatCommand, boolean> = {
  bold: false,
  italic: false,
  underline: false,
};

interface PostEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    content: string,
    files: PickedFile[],
  ) => Promise<void>;
  existingAttachments?: Attachment[];
  onRemoveExisting?: (id: string) => void;
  mode?: "create" | "edit";
  initialTitle?: string;
  initialContent?: string;
  onDelete?: () => Promise<void>;
}

function ExistingImageThumb({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove?: () => void;
}) {
  const t = useT();
  const [url, setUrl] = useState<string | null>(
    attachment.localPath.startsWith("data:") ? attachment.localPath : null,
  );

  useEffect(() => {
    if (attachment.localPath.startsWith("data:")) {
      setUrl(attachment.localPath);
      return;
    }
    let cancelled = false;
    readFileAsBlobUrl(attachment.localPath, attachment.mimeType)
      .then((blobUrl) => {
        if (!cancelled) setUrl(blobUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [attachment.localPath, attachment.mimeType]);

  return (
    <div className="relative aspect-square">
      {url ? (
        <img
          src={url}
          alt={attachment.name}
          className="h-full w-full rounded-2xl object-cover border border-border"
        />
      ) : (
        <div className="h-full w-full rounded-2xl animate-pulse bg-border" />
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1.5 start-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 border border-border shadow-sm"
          aria-label={t("post.editor.deleteImage")}
        >
          <IconX size={12} className="text-text-secondary" />
        </button>
      )}
      <div className="absolute top-1.5 end-1.5">
        <AttachmentDownloadButton
          name={attachment.name}
          mimeType={attachment.mimeType}
          localPath={attachment.localPath}
          className="bg-surface/90 border border-border shadow-sm"
          size={14}
        />
      </div>
    </div>
  );
}

export function PostEditor({
  open,
  onClose,
  onSave,
  existingAttachments = [],
  onRemoveExisting,
  mode = "create",
  initialTitle = "",
  initialContent = "",
  onDelete,
}: PostEditorProps) {
  const t = useT();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [pickedFiles, setPickedFiles] = useState<PickedFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeFormats, setActiveFormats] = useState(INITIAL_ACTIVE_FORMATS);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateActiveFormats = useCallback(() => {
    const editor = contentRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    if (!editor.contains(selection.anchorNode)) return;

    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    document.addEventListener("selectionchange", updateActiveFormats);
    return () =>
      document.removeEventListener("selectionchange", updateActiveFormats);
  }, [open, updateActiveFormats]);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setContent(initialContent);
      setPickedFiles([]);
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.innerHTML = initialContent;
          updateActiveFormats();
        }
      });
    }
  }, [open, initialTitle, initialContent, updateActiveFormats]);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    const newPicked: PickedFile[] = [];

    for (const file of list) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      newPicked.push({
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        base64,
      });
    }

    setPickedFiles((prev) => [...prev, ...newPicked]);
  }, []);

  if (!open) return null;

  async function handleSave() {
    const htmlContent = contentRef.current?.innerHTML ?? content;
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave(title, htmlContent, pickedFiles);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function handleToolbarAction(command: string) {
    if (command === "attach") {
      fileInputRef.current?.click();
      return;
    }
    if (command === "createLink") {
      const url = prompt(t("post.editor.linkPrompt"));
      if (url) document.execCommand("createLink", false, url);
      return;
    }
    contentRef.current?.focus();
    document.execCommand(command, false);
    requestAnimationFrame(updateActiveFormats);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      void addFiles(e.dataTransfer.files);
    }
  }

  const toolbarItems = [
    { icon: IconBold, label: t("post.editor.toolbar.bold"), command: "bold" },
    { icon: IconItalic, label: t("post.editor.toolbar.italic"), command: "italic" },
    {
      icon: IconUnderline,
      label: t("post.editor.toolbar.underline"),
      command: "underline",
    },
    { icon: IconLink, label: t("post.editor.toolbar.link"), command: "createLink" },
  ] as const;

  const documentFiles = pickedFiles.filter(
    (f) => !f.mimeType.startsWith("image/"),
  );
  const imageFiles = pickedFiles.filter((f) => f.mimeType.startsWith("image/"));
  const existingDocs = existingAttachments.filter((a) => a.type === "document");
  const existingImages = existingAttachments.filter((a) => a.type === "image");
  const hasAttachments =
    documentFiles.length > 0 ||
    imageFiles.length > 0 ||
    existingDocs.length > 0 ||
    existingImages.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background safe-top animate-fade-in">
      <header className="relative flex items-center justify-center px-4 py-4 bg-surface border-b border-border">
        <h1 className="text-base font-bold text-text">
          {mode === "create"
            ? t("post.editor.createTitle")
            : t("post.editor.editTitle")}
        </h1>
        <button
          type="button"
          onClick={onClose}
          className="absolute start-4 flex h-9 w-9 items-center justify-center rounded-full hover:bg-background transition-colors"
          aria-label={t("common.close")}
        >
          <IconX size={22} className="text-text-secondary" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-6">
          <Input
            label={t("post.editor.titleLabel")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("post.editor.titlePlaceholder")}
            className="text-base font-medium"
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              {t("post.editor.contentLabel")}
            </label>
            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              <div className="flex items-center gap-2 px-2 py-2 border-b border-border overflow-x-auto scrollbar-hide ">
                {toolbarItems.map(({ icon: Icon, label, command }) => {
                  const isToggleable = FORMAT_COMMANDS.has(command);
                  const isActive =
                    isToggleable && activeFormats[command as FormatCommand];

                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleToolbarAction(command)}
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                        isActive
                          ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                          : "text-text-secondary hover:bg-background",
                      )}
                      aria-label={label}
                      aria-pressed={isToggleable ? isActive : undefined}
                    >
                      <Icon size={18} stroke={isActive ? 2.25 : 1.75} />
                    </button>
                  );
                })}
              </div>
              <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => {
                  setContent(contentRef.current?.innerHTML ?? "");
                  updateActiveFormats();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    document.execCommand("insertLineBreak");
                    updateActiveFormats();
                  }
                }}
                onKeyUp={updateActiveFormats}
                onMouseUp={updateActiveFormats}
                onFocus={updateActiveFormats}
                data-placeholder={t("post.editor.contentPlaceholder")}
                className="post-editor-content min-h-[180px] px-4 py-3.5 text-sm text-text leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-text-secondary/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-text">
              {t("post.editor.attachmentsLabel")}
            </label>

            <div className="space-y-3">
              {existingDocs.map((doc) => (
                <FileAttachmentRow
                  key={doc.id}
                  name={doc.name}
                  mimeType={doc.mimeType}
                  size={doc.size}
                  localPath={doc.localPath}
                  onRemove={() => onRemoveExisting?.(doc.id)}
                />
              ))}

              {documentFiles.map((file, i) => (
                <FileAttachmentRow
                  key={`doc-${i}-${file.name}`}
                  name={file.name}
                  mimeType={file.mimeType}
                  size={file.size}
                  base64={file.base64}
                  onRemove={() =>
                    setPickedFiles((prev) => prev.filter((f) => f !== file))
                  }
                />
              ))}

              {(existingImages.length > 0 || imageFiles.length > 0) && (
                <div className="grid grid-cols-3 gap-2.5">
                  {existingImages.map((img) => (
                    <ExistingImageThumb
                      key={img.id}
                      attachment={img}
                      onRemove={() => onRemoveExisting?.(img.id)}
                    />
                  ))}
                  {imageFiles.map((file, i) => (
                    <div
                      key={`img-${i}-${file.name}`}
                      className="relative aspect-square"
                    >
                      <img
                        src={`data:${file.mimeType};base64,${file.base64}`}
                        alt={file.name}
                        className="h-full w-full rounded-2xl object-cover border border-border"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPickedFiles((prev) =>
                            prev.filter((f) => f !== file),
                          )
                        }
                        className="absolute top-1.5 start-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 border border-border shadow-sm"
                        aria-label={t("post.editor.deleteImage")}
                      >
                        <IconX size={12} className="text-text-secondary" />
                      </button>
                      <div className="absolute top-1.5 end-1.5">
                        <AttachmentDownloadButton
                          name={file.name}
                          mimeType={file.mimeType}
                          base64={file.base64}
                          className="bg-surface/90 border border-border shadow-sm"
                          size={14}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-2xl border-2 border-dashed py-8 px-4 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
                  dragOver
                    ? "border-accent bg-accent/5"
                    : "border-border bg-surface hover:border-accent/50"
                }`}
              >
                {hasAttachments ? (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
                      <IconPlus size={20} className="text-text-secondary" />
                    </div>
                    <span className="text-sm text-text-secondary">
                      {t("post.editor.addMore")}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background">
                      <IconPhoto
                        size={24}
                        className="text-text-secondary"
                        stroke={1.5}
                      />
                    </div>
                    <p className="text-sm font-medium text-text text-center">
                      {t("post.editor.dropHint")}
                    </p>
                    <p className="text-xs text-text-secondary text-center leading-relaxed">
                      {t("post.editor.dropSubhint")}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            void addFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />

      <div className="border-t border-border bg-surface !p-4 safe-bottom">
        <div className="max-w-lg mx-auto flex gap-3">
          {mode === "edit" && onDelete ? (
            <>
              <Button
                variant="danger"
                onClick={async () => {
                  if (confirm(t("post.confirmDelete"))) {
                    await onDelete();
                    onClose();
                  }
                }}
                className="flex-1 border border-border"
              >
                {t("post.editor.deletePost")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="flex-1"
              >
                {saving ? t("common.saving") : t("post.editor.saveChanges")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={onClose} className="flex-1">
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="flex-1"
              >
                {saving ? t("common.saving") : t("post.editor.savePost")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
