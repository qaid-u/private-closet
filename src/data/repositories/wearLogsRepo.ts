import { db } from '../db';
import { WearLog } from '../types';
import { WearLogSchema } from '../schemas';

export const wearLogsRepo = {
  async getAll(): Promise<WearLog[]> {
    return db.wearLogs.orderBy('date').reverse().toArray();
  },

  async logWear(entry: WearLog): Promise<string> {
    const validated = WearLogSchema.parse(entry);
    await db.wearLogs.put(validated);
    return validated.id;
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
