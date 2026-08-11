# Archivio

**Personal Information Manager** — a premium, offline-first Android app built with React, TypeScript, and Capacitor.

All data is stored locally on the device. No backend, no cloud, no authentication required.

## Features

- Category management with custom colors and 3D folder icons
- Posts with title, content, and mixed attachments (images, Excel, Word, PDF)
- Inline post editing
- Local search across titles, content, and filenames
- Backup & restore (ZIP export/import)
- Full Persian RTL UI with Kook font

## Tech Stack

- React 19 + TypeScript + Vite
- Capacitor 8 (Android)
- SQLite (`@capacitor-community/sqlite`)
- Capacitor Filesystem for file storage
- Tailwind CSS 4
- Tabler Icons

## Development

```bash
# Install dependencies (also copies sql-wasm.wasm for browser SQLite)
npm install

# Run in browser (uses jeep-sqlite + IndexedDB for local DB)
npm run dev
```

> **Browser note:** SQLite in the browser requires `sql-wasm.wasm` in `public/assets/`. This is copied automatically on `npm install`. If categories/posts fail to load in the browser, hard-refresh the page and check the console for WASM errors.

# Build for production
npm run build

# Sync with Android
npm run cap:sync

# Open in Android Studio
npm run cap:android
```

## Build APK

1. Run `npm run cap:sync`
2. Open the `android/` folder in Android Studio
3. Build → Build Bundle(s) / APK(s) → Build APK(s)

## Project Structure

```
src/
├── app/           # App root
├── routes/        # Page components
├── components/    # Shared UI components
├── features/      # Feature modules (categories, posts, etc.)
├── database/      # SQLite setup, migrations, repositories
├── services/      # File, backup, picker services
├── theme/         # Design constants
└── utils/         # Helpers
```

## Data Storage

- **SQLite**: categories, posts, attachment metadata
- **Filesystem**: actual files in `images/` and `documents/` directories

## License

Private — Personal use.
