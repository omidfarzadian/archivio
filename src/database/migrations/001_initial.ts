export const MIGRATION_V1 = [
  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY NOT NULL,
    categoryId TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY NOT NULL,
    postId TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    mimeType TEXT NOT NULL,
    size INTEGER NOT NULL,
    localPath TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_posts_categoryId ON posts(categoryId)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_createdAt ON posts(createdAt)`,
  `CREATE INDEX IF NOT EXISTS idx_attachments_postId ON attachments(postId)`,
];
