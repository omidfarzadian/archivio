import { readFileBinary } from './file.service';

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function loadFileBytes(
  base64?: string,
  localPath?: string,
): Promise<Uint8Array | null> {
  if (base64) return base64ToUint8Array(base64);

  if (localPath?.startsWith('data:')) {
    const base64Part = localPath.split(',')[1];
    if (base64Part) return base64ToUint8Array(base64Part);
    return null;
  }

  if (localPath) {
    return readFileBinary(localPath);
  }

  return null;
}
