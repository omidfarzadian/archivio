import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IconArrowLeft, IconArrowRight, IconPlus, IconSearch } from "@tabler/icons-react";
import { AppLayout, PageHeader } from "@/components/ui/Layout";
import { PostCard } from "@/components/PostCard/PostCard";
import { PostEditor } from "@/features/posts/components/PostEditor";
import { usePosts } from "@/features/posts/hooks/usePosts";
import { getCategoryById } from "@/database/repositories/category.repository";
import type {
  Category,
  PostWithAttachments,
} from "@/features/categories/types";
import { formatNumber } from "@/utils/format";
import { useI18n, useT } from "@/i18n";
import type { PickedFile } from "@/services/picker.service";

export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useT();
  const { locale, isRtl } = useI18n();
  const BackIcon = isRtl ? IconArrowRight : IconArrowLeft;
  const [category, setCategory] = useState<Category | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const {
    posts,
    loading,
    searchQuery,
    setSearchQuery,
    addPost,
    savePost,
    removePost,
    removeAttachment,
    addAttachmentsToPost,
  } = usePosts(id || "");

  const editingPost: PostWithAttachments | null = editingPostId
    ? (posts.find((p) => p.id === editingPostId) ?? null)
    : null;

  const editorOpen = creatingPost || editingPostId !== null;

  useEffect(() => {
    if (id) {
      getCategoryById(id).then(setCategory);
    }
  }, [id]);

  function closeEditor() {
    setCreatingPost(false);
    setEditingPostId(null);
  }

  async function handleAddPost(
    title: string,
    content: string,
    files: PickedFile[],
  ) {
    await addPost(title, content, files);
  }

  async function handleEditPost(
    title: string,
    content: string,
    files: PickedFile[],
  ) {
    if (!editingPostId) return;
    await savePost(editingPostId, title, content);
    if (files.length > 0) {
      await addAttachmentsToPost(editingPostId, files);
    }
  }

  const showHeaderAdd = !editorOpen && !loading && posts.length > 0;
  const showFloatingAdd = !editorOpen && !loading && posts.length === 0;

  return (
    <AppLayout hideNav={editorOpen}>
      <PageHeader
        title={category?.name || "..."}
        subtitle={
          category
            ? t("category.postCount", {
                count: formatNumber(posts.length, locale),
              })
            : undefined
        }
        leftAction={
          <button
            onClick={() => navigate("/")}
            className="p-2"
            aria-label={t("common.back")}
          >
            <BackIcon size={22} className="text-text" />
          </button>
        }
        rightAction={
          showHeaderAdd ? (
            <button
              type="button"
              onClick={() => setCreatingPost(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-accent shadow-elevated active:scale-95 transition-transform"
              aria-label={t("category.addPost")}
            >
              <IconPlus size={22} className="text-white" stroke={2.5} />
            </button>
          ) : undefined
        }
      />

      <div className="max-w-lg mx-auto px-4 py-3">
        {posts.length !== 0 && (
          <div className="relative mb-4">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("category.searchPosts")}
              className="w-full rounded-2xl border border-border bg-surface py-3 pe-11 ps-4 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <IconSearch
              size={20}
              className="absolute end-4 top-1/2 -translate-y-1/2 text-text-secondary"
            />
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-3xl bg-surface animate-pulse shadow-card"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-secondary text-sm">{t("category.noPosts")}</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={() => setEditingPostId(post.id)}
                onDelete={() => removePost(post.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showFloatingAdd && (
        <div className="fixed bottom-20 inset-x-0 px-4 z-30 max-w-lg mx-auto my-4">
          <button
            onClick={() => setCreatingPost(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl gradient-accent text-white font-medium shadow-elevated active:scale-[0.98] transition-transform"
          >
            <IconPlus size={20} stroke={2.5} />
            {t("category.addPost")}
          </button>
        </div>
      )}

      <PostEditor
        open={creatingPost}
        mode="create"
        onClose={closeEditor}
        onSave={handleAddPost}
      />

      {editingPost && (
        <PostEditor
          open
          mode="edit"
          initialTitle={editingPost.title}
          initialContent={editingPost.content}
          existingAttachments={editingPost.attachments}
          onClose={closeEditor}
          onSave={handleEditPost}
          onRemoveExisting={removeAttachment}
          onDelete={async () => {
            await removePost(editingPost.id);
          }}
        />
      )}
    </AppLayout>
  );
}
