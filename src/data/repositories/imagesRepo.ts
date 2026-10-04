import { db } from '../db';
import { StoredImageBlob } from '../types';

const urlCache = new Map<string, string>();

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  if (typeof blob.arrayBuffer === 'function') {
    const buffer = await blob.arrayBuffer();
    return new Uint8Array(buffer);
  }
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(new Uint8Array(reader.result as ArrayBuffer));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
  }
  return new Uint8Array(0);
}

export const imagesRepo = {
  async saveBlob(id: string, blob: Blob, mimeType = 'image/svg+xml'): Promise<string> {
    const data = await blobToUint8Array(blob);
    const entry: StoredImageBlob = {
      id,
      blob,
      data,
      mimeType,
      createdAt: Date.now(),
    };
    await db.images.put(entry);
    return id;
  },

  async getBlob(id: string): Promise<Blob | undefined> {
    const entry = await db.images.get(id);
    if (!entry) return undefined;
    if (entry.data && entry.data.length > 0) {
      return new Blob([entry.data as unknown as BlobPart], { type: entry.mimeType });
    }
    if (entry.blob instanceof Blob && typeof entry.blob.size === 'number' && entry.blob.size > 0) {
      return entry.blob;
    }
    return entry.blob;
  },

  async getUrl(id: string): Promise<string | undefined> {
    if (urlCache.has(id)) {
      return urlCache.get(id);
    }
    const blob = await this.getBlob(id);
    if (!blob) return undefined;
    const url = URL.createObjectURL(blob);
    urlCache.set(id, url);
    return url;
  },

  async delete(id: string): Promise<void> {
    if (urlCache.has(id)) {
      URL.revokeObjectURL(urlCache.get(id)!);
      urlCache.delete(id);
    }
    await db.images.delete(id);
  },

  clearCache(): void {
    urlCache.forEach((url) => URL.revokeObjectURL(url));
    urlCache.clear();
  },
};
