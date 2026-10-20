const STORAGE_PREFIX = 'mrop_enterprise_';

export const STORAGE_KEYS = {
  CURRENT_ROLE: `${STORAGE_PREFIX}current_role`,
  WORK_ORDERS: `${STORAGE_PREFIX}work_orders`,
  INVENTORY: `${STORAGE_PREFIX}inventory`,
  EQUIPMENT: `${STORAGE_PREFIX}equipment`,
  GEOLOGICAL_BLOCKS: `${STORAGE_PREFIX}geological_blocks`,
  ASSAYS: `${STORAGE_PREFIX}assays`,
  AI_RECOMMENDATIONS: `${STORAGE_PREFIX}ai_recommendations`,
  NOTIFICATIONS: `${STORAGE_PREFIX}notifications`,
  RISKS: `${STORAGE_PREFIX}risks`,
  DATA_SOURCE_MODE: `${STORAGE_PREFIX}data_source_mode`, // 'mock' or 'api'
  AUTH_SESSION: `${STORAGE_PREFIX}auth_session`,
  REMEMBERED_EMAIL: `${STORAGE_PREFIX}remembered_email`,
} as const;

export function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`[LocalStorage] Failed to load key "${key}", using default`, error);
    return defaultValue;
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[LocalStorage] Failed to save key "${key}"`, error);
  }
}

export function removeStoredItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[LocalStorage] Failed to remove key "${key}"`, error);
  }
}

/**
 * Resets only application-designated prototype keys
 */
export function resetDemoDataStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
}
