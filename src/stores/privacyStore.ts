import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NETWORK_REGISTRY, NetworkPermissionId, NetworkAuditLogEntry } from '../net/registry';

interface PrivacyState {
  permissions: Record<string, boolean>;
  auditLog: NetworkAuditLogEntry[];
  isPermissionEnabled: (id: NetworkPermissionId) => boolean;
  togglePermission: (id: NetworkPermissionId, enabled: boolean) => void;
  recordAudit: (entry: Omit<NetworkAuditLogEntry, 'id' | 'timestamp'>) => void;
  clearAuditLog: () => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set, get) => ({
      permissions: {
        OPEN_METEO_WEATHER: NETWORK_REGISTRY.OPEN_METEO_WEATHER.enabledByDefault,
      },
      auditLog: [],
      isPermissionEnabled: (id: NetworkPermissionId) => {
        return !!get().permissions[id];
      },
      togglePermission: (id: NetworkPermissionId, enabled: boolean) => {
        set((state) => ({
          permissions: {
            ...state.permissions,
            [id]: enabled,
          },
        }));
      },
      recordAudit: (entry) => {
        const fullEntry: NetworkAuditLogEntry = {
          ...entry,
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          auditLog: [fullEntry, ...state.auditLog].slice(0, 100), // Keep last 100 entries
        }));
      },
      clearAuditLog: () => set({ auditLog: [] }),
    }),
    {
      name: 'private-closet-privacy-settings',
      partialize: (state) => ({ permissions: state.permissions, auditLog: state.auditLog }),
    }
  )
);
