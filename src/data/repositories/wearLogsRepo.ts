import { db } from '../db';
import { WearLog } from '../types';
import { WearLogSchema } from '../schemas';

export const wearLogsRepo = {
  async getAll(): Promise<WearLog[]> {
    return db.wearLogs.orderBy('date').reverse().toArray();
  },

  async listRecent(limit = 10): Promise<WearLog[]> {
    return db.wearLogs.orderBy('date').reverse().limit(limit).toArray();
  },

  async logWear(entry: WearLog): Promise<string> {
    const validated = WearLogSchema.parse(entry);
    await db.wearLogs.put(validated);
    return validated.id;
  },

  async create(entry: Omit<WearLog, 'id'> & { id?: string }): Promise<WearLog> {
    const id = entry.id || `wear-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const full: WearLog = { ...entry, id };
    const validated = WearLogSchema.parse(full);
    await db.wearLogs.put(validated);
    return validated;
  },

  async getByDate(date: string): Promise<WearLog[]> {
    return db.wearLogs.where('date').equals(date).toArray();
  },

  async delete(id: string): Promise<void> {
    await db.wearLogs.delete(id);
  },

  async count(): Promise<number> {
    return db.wearLogs.count();
  },
};
