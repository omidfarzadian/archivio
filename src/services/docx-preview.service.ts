import { loadFileBytes } from './file-bytes.service';

export function isDocxFile(mimeType: string, name: string): boolean {
  const lower = `${mimeType} ${name}`.toLowerCase();
  return (
    lower.includes('wordprocessingml') ||
    lower.endsWith('.docx')
  );
}

export function isWordFile(mimeType: string, name: string): boolean {
  const lower = `${mimeType} ${name}`.toLowerCase();
  return (
    isDocxFile(mimeType, name) ||
    lower.includes('msword') ||
    lower.endsWith('.doc')
  );
}

export async function extractDocxPlainText(data: Uint8Array): Promise<string> {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(data);
    const docXml = await zip.file('word/document.xml')?.async('string');
    if (!docXml) return '';

    return docXml
      .replace(/<w:tab[^/]*\/>/g, ' ')
      .replace(/<w:br[^/]*\/>/g, '\n')
      .replace(/<\/w:p>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } catch {
    return '';
  }
}

export async function loadDocxPlainText(
  base64?: string,
  localPath?: string,
): Promise<string> {
  const bytes = await loadFileBytes(base64, localPath);
  if (!bytes) return '';
  return extractDocxPlainText(bytes);
}
