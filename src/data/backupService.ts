import { db } from './db';
import { ClothingItem, Outfit, StyleProfile, Preferences, WearLog, Feedback } from './types';
import { ClothingItemSchema, OutfitSchema, StyleProfileSchema, PreferencesSchema } from './schemas';

export interface BackupData {
  version: 1;
  exportedAt: number;
  items: ClothingItem[];
  outfits: Outfit[];
  wearLogs: WearLog[];
  feedback: Feedback[];
  styleProfile?: StyleProfile;
  preferences?: Preferences;
}

export interface BackupPreview {
  itemsCount: number;
  outfitsCount: number;
  wearLogsCount: number;
  hasStyleProfile: boolean;
  exportedAt: number;
}

/**
 * Web Crypto AES-GCM (256-bit) encryption key derivation using PBKDF2.
 * 100% on-device, standard browser cryptographic primitives.
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export const backupService = {
  /**
   * Generates a backup object from Dexie database.
   */
  async generateBackup(excludeStyleProfile = true): Promise<BackupData> {
    const [items, outfits, wearLogs, feedback, profile, prefs] = await Promise.all([
      db.items.toArray(),
      db.outfits.toArray(),
      db.wearLogs.toArray(),
      db.feedback.toArray(),
      excludeStyleProfile ? Promise.resolve(undefined) : db.styleProfiles.get('current'),
      excludeStyleProfile ? Promise.resolve(undefined) : db.preferences.get('user_pref'),
    ]);

    return {
      version: 1,
      exportedAt: Date.now(),
      items,
      outfits,
      wearLogs,
      feedback,
      styleProfile: profile,
      preferences: prefs,
    };
  },

  /**
   * Encrypts the backup data with a user passphrase using AES-GCM (256-bit).
   * Returns a JSON string containing the base64 salt, iv, and ciphertext.
   */
  async exportEncrypted(passphrase: string, excludeStyleProfile = true): Promise<{ blob: Blob; sizeBytes: number; filename: string; payloadStr: string }> {
    const backupData = await this.generateBackup(excludeStyleProfile);
    const jsonStr = JSON.stringify(backupData);
    const enc = new TextEncoder();
    const dataBytes = enc.encode(jsonStr);

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBytes
    );

    const ciphertextArray = Array.from(new Uint8Array(ciphertextBuffer));
    const saltArray = Array.from(salt);
    const ivArray = Array.from(iv);

    const payload = JSON.stringify({
      format: 'qcloset-encrypted',
      version: 1,
      salt: saltArray,
      iv: ivArray,
      ciphertext: ciphertextArray,
    });

    const blob = new Blob([payload], { type: 'application/json' });
    const filename = `private-closet-backup-${new Date().toISOString().split('T')[0]}.qcloset`;

    return {
      blob,
      sizeBytes: blob.size,
      filename,
      payloadStr: payload,
    };
  },

  /**
   * Decrypts and previews the contents of an encrypted backup file.
   */
  async previewEncrypted(fileContent: string, passphrase: string): Promise<{ data: BackupData; preview: BackupPreview }> {
    let parsed: { format?: string; salt?: number[]; iv?: number[]; ciphertext?: number[] };
    try {
      parsed = JSON.parse(fileContent);
    } catch {
      throw new Error('Invalid backup file: not valid JSON format.');
    }

    if (parsed.format !== 'qcloset-encrypted' || !parsed.salt || !parsed.iv || !parsed.ciphertext) {
      throw new Error('Invalid backup file format or missing encryption metadata.');
    }

    const salt = new Uint8Array(parsed.salt);
    const iv = new Uint8Array(parsed.iv);
    const ciphertext = new Uint8Array(parsed.ciphertext);

    let decryptedBuffer: ArrayBuffer;
    try {
      const key = await deriveKey(passphrase, salt);
      decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );
    } catch {
      throw new Error('Decryption failed: Incorrect passphrase or corrupted backup.');
    }

    const dec = new TextDecoder();
    const jsonStr = dec.decode(decryptedBuffer);
    const data: BackupData = JSON.parse(jsonStr);

    if (data.version !== 1 || !Array.isArray(data.items)) {
      throw new Error('Invalid backup content: unsupported schema version.');
    }

    const preview: BackupPreview = {
      itemsCount: data.items.length,
      outfitsCount: data.outfits?.length || 0,
      wearLogsCount: data.wearLogs?.length || 0,
      hasStyleProfile: Boolean(data.styleProfile),
      exportedAt: data.exportedAt,
    };

    return { data, preview };
  },

  /**
   * Restores verified backup data into Dexie.
   */
  async restore(data: BackupData): Promise<void> {
    await db.transaction('rw', [db.items, db.outfits, db.wearLogs, db.feedback, db.styleProfiles, db.preferences], async () => {
      // Clear existing records
      await Promise.all([
        db.items.clear(),
        db.outfits.clear(),
        db.wearLogs.clear(),
        db.feedback.clear(),
      ]);

      // Bulk put items
      if (data.items.length > 0) {
        const validItems = data.items.map((i) => ClothingItemSchema.parse(i));
        await db.items.bulkPut(validItems);
      }

      // Bulk put outfits
      if (data.outfits?.length > 0) {
        const validOutfits = data.outfits.map((o) => OutfitSchema.parse(o));
        await db.outfits.bulkPut(validOutfits);
      }

      // Bulk put wear logs
      if (data.wearLogs?.length > 0) {
        await db.wearLogs.bulkPut(data.wearLogs);
      }

      // Bulk put feedback
      if (data.feedback?.length > 0) {
        await db.feedback.bulkPut(data.feedback);
      }

      // Restore style profile if present
      if (data.styleProfile) {
        const validProfile = StyleProfileSchema.parse(data.styleProfile);
        await db.styleProfiles.put(validProfile);
      }

      // Restore preferences if present
      if (data.preferences) {
        const validPrefs = PreferencesSchema.parse(data.preferences);
        await db.preferences.put(validPrefs);
      }
    });
  },

  /**
   * Estimates raw backup size in kilobytes.
   */
  async estimateBackupSize(): Promise<string> {
    const [itemsCount, outfitsCount, wearCount] = await Promise.all([
      db.items.count(),
      db.outfits.count(),
      db.wearLogs.count(),
    ]);

    // Approx 2.5 KB per item with cutouts/metadata, 0.5 KB per outfit
    const estBytes = (itemsCount * 2500) + (outfitsCount * 500) + (wearCount * 150) + 4096;
    if (estBytes < 1024 * 1024) {
      return `${Math.round(estBytes / 1024)} KB`;
    }
    return `${(estBytes / (1024 * 1024)).toFixed(1)} MB`;
  },
};
