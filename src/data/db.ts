import Dexie, { type Table } from 'dexie';
import {
  ClothingItem,
  StyleProfile,
  Outfit,
  WearLog,
  Feedback,
  Preferences,
  AppSettings,
  StoredImageBlob,
} from './types';

export class PrivateClosetDB extends Dexie {
  items!: Table<ClothingItem, string>;
  styleProfiles!: Table<StyleProfile, string>;
  outfits!: Table<Outfit, string>;
  wearLogs!: Table<WearLog, string>;
  feedback!: Table<Feedback, string>;
  preferences!: Table<Preferences, string>;
  settings!: Table<AppSettings, string>;
  images!: Table<StoredImageBlob, string>;

  constructor() {
    super('PrivateClosetDB');

    // Schema versioning per TECH_DESIGN Section 3
    this.version(1).stores({
      items: 'id, category, subtype, status, favorite, isSample, createdAt, updatedAt',
      styleProfiles: 'id, updatedAt',
      outfits: 'id, occasion, season, favorite, wornCount, createdAt',
      wearLogs: 'id, date, outfitId',
      feedback: 'id, outfitSignature, kind, at',
      preferences: 'id',
      settings: 'id',
      images: 'id, mimeType, createdAt',
    });
  }
}

export const db = new PrivateClosetDB();
