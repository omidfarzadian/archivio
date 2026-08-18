import type { PDFDocumentProxy } from 'pdfjs-dist';
// Bundled worker: `?url` yields just a string, so pdfjs itself stays lazily imported.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { loadFileBytes } from './file-bytes.service';

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

async function getPdfjs(): Promise<typeof import('pdfjs-dist')> {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

export function isPdfFile(mimeType: string, name: string): boolean {
  const lower = `${mimeType} ${name}`.toLowerCase();
  return lower.includes('pdf') || lower.endsWith('.pdf');
}

export async function loadPdfDocument(
  base64?: string,
  localPath?: string,
): Promise<PDFDocumentProxy | null> {
  const bytes = await loadFileBytes(base64, localPath);
  if (!bytes) return null;

  const pdfjs = await getPdfjs();
  // pdfjs detaches the passed buffer, so hand it a private copy.
  const data = bytes.slice();
  const base = import.meta.env.BASE_URL || '/';
  return pdfjs.getDocument({
    data,
    disableAutoFetch: true,
    // Render glyphs as canvas paths instead of via the FontFaceSet API. The
    // native-font path can hang waiting on `FontFace.loaded` inside Android
    // WebView / embedded browsers, which would stall page rendering forever.
    disableFontFace: true,
    // Served from public/ (see scripts/copy-sql-wasm.cjs) so standard-14 fonts
    // and CJK encodings render instead of stalling.
    standardFontDataUrl: `${base}pdf/standard_fonts/`,
    cMapUrl: `${base}pdf/cmaps/`,
    cMapPacked: true,
  }).promise;
}

/** Renders a single page onto a fresh canvas scaled to `targetWidth` CSS pixels. */
export async function renderPdfPageToCanvas(
  doc: PDFDocumentProxy,
  pageNumber: number,
  targetWidth: number,
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const scale = (targetWidth / base.width) * dpr;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  canvas.style.width = '100%';
  canvas.style.height = 'auto';

  await page.render({ canvasContext: ctx, viewport }).promise;
  page.cleanup();
  return canvas;
}
