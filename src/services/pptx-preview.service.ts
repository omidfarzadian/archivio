import { loadFileBytes } from './file-bytes.service';

export interface PptxSlide {
  index: number;
  lines: string[];
}

export interface PptxPreviewData {
  slides: PptxSlide[];
  totalSlides: number;
}

const MAX_SLIDES = 60;

export function isPptxFile(mimeType: string, name: string): boolean {
  const lower = `${mimeType} ${name}`.toLowerCase();
  return (
    lower.includes('presentationml') ||
    lower.includes('powerpoint') ||
    lower.endsWith('.pptx') ||
    lower.endsWith('.ppt')
  );
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&');
}

function slideNumber(path: string): number {
  const match = path.match(/slide(\d+)\.xml$/);
  return match ? Number(match[1]) : 0;
}

function extractSlideLines(xml: string): string[] {
  const lines: string[] = [];
  // Each <a:p> is a paragraph; its <a:t> runs form one line of text.
  const paragraphs = xml.split(/<a:p\b[^>]*>/);
  for (const paragraph of paragraphs) {
    const runs = [...paragraph.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)];
    if (runs.length === 0) continue;
    const line = runs.map((m) => decodeXmlEntities(m[1])).join('').trim();
    if (line) lines.push(line);
  }
  return lines;
}

export async function extractPptxSlides(data: Uint8Array): Promise<PptxPreviewData> {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(data);

    const slidePaths = Object.keys(zip.files)
      .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
      .sort((a, b) => slideNumber(a) - slideNumber(b));

    const totalSlides = slidePaths.length;
    const slides: PptxSlide[] = [];

    for (const path of slidePaths.slice(0, MAX_SLIDES)) {
      const xml = await zip.file(path)?.async('string');
      if (!xml) continue;
      slides.push({ index: slideNumber(path), lines: extractSlideLines(xml) });
    }

    return { slides, totalSlides };
  } catch {
    return { slides: [], totalSlides: 0 };
  }
}

export async function loadPptxSlides(
  base64?: string,
  localPath?: string,
): Promise<PptxPreviewData> {
  const bytes = await loadFileBytes(base64, localPath);
  if (!bytes) return { slides: [], totalSlides: 0 };
  return extractPptxSlides(bytes);
}
