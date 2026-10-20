import { getStoredItem, setStoredItem, STORAGE_KEYS } from '@/utils/storage';

export type DataSourceMode = 'mock' | 'api';

export interface DataSourceConfig {
  mode: DataSourceMode;
  apiBaseUrl: string;
  timeoutMs: number;
  simulatedDelayMs: number;
}

const DEFAULT_CONFIG: DataSourceConfig = {
  mode: 'mock',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.redridge-mining.example.com/v1',
  timeoutMs: 10000,
  simulatedDelayMs: 150, // Slight realistic latency for mock async calls
};

export function getDataSourceConfig(): DataSourceConfig {
  const savedMode = getStoredItem<DataSourceMode>(STORAGE_KEYS.DATA_SOURCE_MODE, DEFAULT_CONFIG.mode);
  return {
    ...DEFAULT_CONFIG,
    mode: savedMode,
  };
}

export function setDataSourceMode(mode: DataSourceMode): void {
  setStoredItem(STORAGE_KEYS.DATA_SOURCE_MODE, mode);
}
