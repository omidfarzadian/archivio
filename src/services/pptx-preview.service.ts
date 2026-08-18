import { loadFileBytes } from './file-bytes.service';

export interface PptxSlideImage {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PptxSlideText {
  lines: string[];
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  color: string;
  bold: boolean;
}

export interface PptxSlide {
  index: number;
  lines: string[];
  background: string;
  width: number;
  height: number;
  images: PptxSlideImage[];
  texts: PptxSlideText[];
}

export interface PptxPreviewData {
  slides: PptxSlide[];
  totalSlides: number;
}

const MAX_SLIDES = 60;
const DEFAULT_CX = 12192000;
const DEFAULT_CY = 6858000;

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

function stripTagPrefixes(xml: string): string {
  return xml.replace(/<\/([A-Za-z0-9._-]+):/g, '</').replace(/<([A-Za-z0-9._-]+):/g, '<');
}

function attr(fragment: string, name: string): string | undefined {
  return fragment.match(new RegExp(`(?:[\\w-]+:)?${name}="([^"]+)"`))?.[1];
}

function emuPct(value: string | undefined, total: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || total <= 0) return 0;
  return (n / total) * 100;
}

function slideNumber(path: string): number {
  const match = path.match(/slide(\d+)\.xml$/i);
  return match ? Number(match[1]) : 0;
}

function normalizeZipPath(path: string): string {
  return path.replace(/^\/+/, '').replace(/\\/g, '/');
}

function resolveRelTarget(target: string): string {
  const cleaned = normalizeZipPath(target.replace(/^\//, ''));
  if (cleaned.startsWith('ppt/')) return cleaned;
  if (cleaned.startsWith('../')) return normalizeZipPath(`ppt/${cleaned.replace(/^(\.\.\/)+/, '')}`);
  return `ppt/slides/${cleaned}`;
}

function imageMime(path: string): string | null {
  const ext = path.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'svg') return 'image/svg+xml';
  if (ext === 'bmp') return 'image/bmp';
  return null;
}

function parseXfrm(fragment: string, cx: number, cy: number) {
  const off = fragment.match(/<off\b[^>]*>/)?.[0] ?? '';
  const ext = fragment.match(/<ext\b[^>]*>/)?.[0] ?? '';
  return {
    x: emuPct(attr(off, 'x'), cx),
    y: emuPct(attr(off, 'y'), cy),
    w: emuPct(attr(ext, 'cx'), cx),
    h: emuPct(attr(ext, 'cy'), cy),
  };
}

function extractLines(xml: string): string[] {
  const lines: string[] = [];
  const paragraphs = xml.split(/<p\b[^>]*>/);
  for (const paragraph of paragraphs) {
    const runs = [...paragraph.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)];
    if (runs.length === 0) continue;
    const line = runs.map((m) => decodeXmlEntities(m[1])).join('').trim();
    if (line) lines.push(line);
  }
  return lines;
}

function parseRels(xml: string): Map<string, string> {
  const map = new Map<string, string>();
  const stripped = stripTagPrefixes(xml);
  for (const m of stripped.matchAll(/<Relationship\b[^>]*>/g)) {
    const tag = m[0];
    const id = attr(tag, 'Id');
    const type = attr(tag, 'Type') ?? '';
    const target = attr(tag, 'Target');
    if (id && target && type.includes('image')) {
      map.set(id, resolveRelTarget(target));
    }
  }
  return map;
}

function parseSlideSize(xml: string): { cx: number; cy: number } {
  const tag = stripTagPrefixes(xml).match(/<sldSz\b[^>]*>/)?.[0];
  const cx = Number(attr(tag ?? '', 'cx'));
  const cy = Number(attr(tag ?? '', 'cy'));
  return {
    cx: Number.isFinite(cx) && cx > 0 ? cx : DEFAULT_CX,
    cy: Number.isFinite(cy) && cy > 0 ? cy : DEFAULT_CY,
  };
}

function parseBackground(xml: string): string {
  const fill = xml.match(/<solidFill\b[\s\S]*?<\/solidFill>/)?.[0] ?? '';
  const srgb = attr(fill.match(/<srgbClr\b[^>]*>/)?.[0] ?? '', 'val');
  if (srgb && /^[0-9a-fA-F]{6}$/.test(srgb)) return `#${srgb}`;
  return '#ffffff';
}

function parseFontSize(fragment: string, slideCy: number): number {
  const sz = Number(attr(fragment.match(/<(?:rPr|defRPr|latin)\b[^>]*>/)?.[0] ?? fragment, 'sz'));
  const pt = Number.isFinite(sz) && sz > 0 ? sz / 100 : 18;
  const pct = (pt / 72) * (914400 / slideCy) * 100;
  return Math.min(18, Math.max(2.2, pct));
}

function parseColor(fragment: string): string {
  const srgb = attr(fragment.match(/<srgbClr\b[^>]*>/)?.[0] ?? '', 'val');
  if (srgb && /^[0-9a-fA-F]{6}$/.test(srgb)) return `#${srgb}`;
  return '#171717';
}

function parseSlideXml(
  xml: string,
  cx: number,
  cy: number,
  imagesByRid: Map<string, string>,
): Pick<PptxSlide, 'lines' | 'background' | 'images' | 'texts'> {
  const body = stripTagPrefixes(xml);
  const images: PptxSlideImage[] = [];
  const texts: PptxSlideText[] = [];

  for (const pic of body.matchAll(/<pic\b[\s\S]*?<\/pic>/g)) {
    const fragment = pic[0];
    const embed =
      attr(fragment.match(/<blip\b[^>]*>/)?.[0] ?? '', 'embed') ??
      attr(fragment, 'embed');
    const src = embed ? imagesByRid.get(embed) : undefined;
    if (!src) continue;
    const box = parseXfrm(fragment, cx, cy);
    if (box.w <= 0 || box.h <= 0) continue;
    images.push({ src, ...box });
  }

  for (const shape of body.matchAll(/<sp\b[\s\S]*?<\/sp>/g)) {
    const fragment = shape[0];
    const lines = extractLines(fragment);
    if (lines.length === 0) continue;
    const box = parseXfrm(fragment, cx, cy);
    texts.push({
      lines,
      x: box.w > 0 ? box.x : 4,
      y: box.h > 0 ? box.y : 8,
      w: box.w > 0 ? box.w : 92,
      h: box.h > 0 ? box.h : 30,
      fontSize: parseFontSize(fragment, cy),
      color: parseColor(fragment),
      bold: /<b\b[^>]*val="1"/.test(fragment) || /<b\s*\/>/.test(fragment) || /<rPr\b[^>]*b="1"/.test(fragment),
    });
  }

  return {
    lines: extractLines(body),
    background: parseBackground(body),
    images,
    texts,
  };
}

async function readZipFile(
  zip: {
    file: (path: string) => { async: (type: 'string' | 'base64') => Promise<string> } | null;
    files: Record<string, unknown>;
  },
  path: string,
  type: 'string' | 'base64',
): Promise<string | null> {
  const direct = zip.file(path);
  if (direct) return direct.async(type);

  const match = Object.keys(zip.files).find(
    (p) => normalizeZipPath(p).toLowerCase() === path.toLowerCase(),
  );
  if (!match) return null;
  const file = zip.file(match);
  return file ? file.async(type) : null;
}

export async function extractPptxSlides(data: Uint8Array): Promise<PptxPreviewData> {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(data);
    const paths = Object.keys(zip.files).map(normalizeZipPath);

    const presentationXml = await readZipFile(zip, 'ppt/presentation.xml', 'string');
    const { cx, cy } = presentationXml
      ? parseSlideSize(presentationXml)
      : { cx: DEFAULT_CX, cy: DEFAULT_CY };

    const slidePaths = paths
      .filter((p) => /^ppt\/slides\/slide\d+\.xml$/i.test(p))
      .sort((a, b) => slideNumber(a) - slideNumber(b));

    const mediaCache = new Map<string, string>();
    const slides: PptxSlide[] = [];

    for (const path of slidePaths.slice(0, MAX_SLIDES)) {
      const xml = await readZipFile(zip, path, 'string');
      if (!xml) continue;

      const relsPath = path.replace(/slides\/(slide\d+\.xml)$/i, 'slides/_rels/$1.rels');
      const relsXml = await readZipFile(zip, relsPath, 'string');
      const rels = relsXml ? parseRels(relsXml) : new Map<string, string>();

      const imagesByRid = new Map<string, string>();
      for (const [rid, mediaPath] of rels) {
        const mime = imageMime(mediaPath);
        if (!mime) continue;
        let src = mediaCache.get(mediaPath);
        if (!src) {
          const base64 = await readZipFile(zip, mediaPath, 'base64');
          if (!base64) continue;
          src = `data:${mime};base64,${base64}`;
          mediaCache.set(mediaPath, src);
        }
        imagesByRid.set(rid, src);
      }

      const parsed = parseSlideXml(xml, cx, cy, imagesByRid);
      slides.push({
        index: slideNumber(path),
        width: cx,
        height: cy,
        ...parsed,
      });
    }

    return { slides, totalSlides: slidePaths.length };
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
