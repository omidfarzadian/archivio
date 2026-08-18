import type { Attachment } from '@/features/categories/types';
import { resolveInitialLocale, translate } from '@/i18n';

export interface PickedFile {
  name: string;
  mimeType: string;
  size: number;
  base64: string;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = () =>
      reject(new Error(translate(resolveInitialLocale(), 'picker.readError')));
    reader.readAsDataURL(file);
  });
}

export async function pickFiles(accept?: string, multiple = true): Promise<PickedFile[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = multiple;
    if (accept) input.accept = accept;

    input.onchange = async () => {
      const files = Array.from(input.files || []);
      const picked: PickedFile[] = [];

      for (const file of files) {
        try {
          const base64 = await readFileAsBase64(file);
          picked.push({
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            base64,
          });
        } catch {
          // skip failed files
        }
      }

      resolve(picked);
    };

    input.oncancel = () => resolve([]);
    input.click();
  });
}

export async function pickImages(): Promise<PickedFile[]> {
  return pickFiles('image/*');
}

export async function pickDocuments(): Promise<PickedFile[]> {
  return pickFiles(
    '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*',
  );
}

export async function pickAnyFile(): Promise<PickedFile[]> {
  return pickFiles('*/*');
}

export function getAttachmentType(mimeType: string): 'image' | 'document' {
  return mimeType.startsWith('image/') ? 'image' : 'document';
}

export function getFileIcon(
  mimeType: string,
  name: string,
): 'excel' | 'word' | 'pdf' | 'powerpoint' | 'file' {
  const lower = (mimeType + name).toLowerCase();
  if (lower.includes('spreadsheet') || lower.includes('excel') || lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    return 'excel';
  }
  if (lower.includes('presentationml') || lower.includes('powerpoint') || lower.endsWith('.pptx') || lower.endsWith('.ppt')) {
    return 'powerpoint';
  }
  if (lower.includes('word') || lower.endsWith('.docx') || lower.endsWith('.doc')) {
    return 'word';
  }
  if (lower.includes('pdf') || lower.endsWith('.pdf')) {
    return 'pdf';
  }
  return 'file';
}

export function getAcceptString(): string {
  return 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv';
}

export type { Attachment };
