export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  postCount?: number;
}

export interface Post {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  postId: string;
  type: 'image' | 'document';
  name: string;
  mimeType: string;
  size: number;
  localPath: string;
  createdAt: string;
}

export interface CategoryWithStats extends Category {
  postCount: number;
}

export interface PostWithAttachments extends Post {
  attachments: Attachment[];
}

export interface SearchResult {
  post: Post;
  categoryName: string;
  matchType: 'title' | 'content' | 'filename';
}
