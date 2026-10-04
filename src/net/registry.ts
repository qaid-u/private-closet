export interface NetworkPermission {
  id: string;
  name: string;
  destination: string;
  purpose: string;
  dataTransmitted: string;
  enabledByDefault: boolean;
}

export interface NetworkAuditLogEntry {
  id: string;
  permissionId: string;
  url: string;
  timestamp: string;
  status: 'allowed' | 'blocked';
  reason?: string;
}

export const NETWORK_REGISTRY: Record<string, NetworkPermission> = {
  OPEN_METEO_WEATHER: {
    id: 'OPEN_METEO_WEATHER',
    name: 'Open-Meteo Weather Forecast',
    destination: 'https://api.open-meteo.com',
    purpose: 'Retrieve local daily temperature, wind speed, and precipitation to adapt outfit recommendations to current weather.',
    dataTransmitted: 'Latitude and longitude coordinates rounded to 2 decimal places (~1.1 km precision). No cookies, user identifiers, or device metadata.',
    enabledByDefault: false,
  },
};

export type NetworkPermissionId = keyof typeof NETWORK_REGISTRY;
