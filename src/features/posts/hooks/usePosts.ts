import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getPostsByCategory,
  createPost,
  updatePost,
  deletePost,
} from '@/database/repositories/post.repository';
import { createAttachment, deleteAttachment } from '@/database/repositories/attachment.repository';
import { touchCategory } from '@/database/repositories/category.repository';
import { saveFile, deleteFile } from '@/services/file.service';
import { getAttachmentType, type PickedFile } from '@/services/picker.service';
import type { PostWithAttachments } from '../types';

export function usePosts(categoryId: string) {
  const [posts, setPosts] = useState<PostWithAttachments[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const data = await getPostsByCategory(categoryId);
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.attachments.some((a) => a.name.toLowerCase().includes(q)),
    );
  }, [posts, searchQuery]);

  async function addPost(title: string, content: string, files: PickedFile[]) {
    const post = await createPost(categoryId, title, content);

    for (const file of files) {
      const localPath = await saveFile(file.name, file.base64, file.mimeType);
      await createAttachment(
        post.id,
        getAttachmentType(file.mimeType),
        file.name,
        file.mimeType,
        file.size,
        localPath,
      );
    }

    await touchCategory(categoryId);
    await refresh();
  }

  async function savePost(postId: string, title: string, content: string) {
    await updatePost(postId, title, content);
    await touchCategory(categoryId);
    await refresh();
  }

  async function removePost(postId: string) {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      for (const att of post.attachments) {
        await deleteFile(att.localPath);
      }
    }
    await deletePost(postId);
    await touchCategory(categoryId);
    await refresh();
  }

  async function removeAttachment(attachmentId: string) {
    const attachment = await deleteAttachment(attachmentId);
    if (attachment) {
      await deleteFile(attachment.localPath);
    }
    await refresh();
  }

  const addAttachmentsToPost = useCallback(async (postId: string, files: PickedFile[]) => {
    for (const file of files) {
      const localPath = await saveFile(file.name, file.base64, file.mimeType);
      await createAttachment(
        postId,
        getAttachmentType(file.mimeType),
        file.name,
        file.mimeType,
        file.size,
        localPath,
      );
    }
    await touchCategory(categoryId);
    await refresh();
  }, [categoryId, refresh]);

  return {
    posts: filteredPosts,
    loading,
    searchQuery,
    setSearchQuery,
    refresh,
    addPost,
    savePost,
    removePost,
    removeAttachment,
    addAttachmentsToPost,
  };
}
