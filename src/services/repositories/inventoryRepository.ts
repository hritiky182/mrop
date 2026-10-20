import { SparePart } from '@/types';
import { MOCK_SPARE_PARTS } from '@/data/mock/inventory';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '@/utils/storage';
import { enrichSparePart } from '@/utils/calculations';
import { getDataSourceConfig } from '@/config/dataSource';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export interface InventoryRepository {
  getAll(): Promise<SparePart[]>;
  getById(id: string): Promise<SparePart | null>;
  updateQuantity(id: string, newQty: number): Promise<SparePart>;
}

class MockInventoryRepository implements InventoryRepository {
  private getParts(): SparePart[] {
    const raw = getStoredItem<SparePart[]>(STORAGE_KEYS.INVENTORY, MOCK_SPARE_PARTS);
    return raw.map(enrichSparePart);
  }

  private saveParts(parts: SparePart[]): void {
    setStoredItem(STORAGE_KEYS.INVENTORY, parts);
  }

  async getAll(): Promise<SparePart[]> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return this.getParts();
  }

  async getById(id: string): Promise<SparePart | null> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const item = this.getParts().find((p) => p.id.toLowerCase() === id.toLowerCase());
    return item || null;
  }

  async updateQuantity(id: string, newQty: number): Promise<SparePart> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const parts = this.getParts();
    const index = parts.findIndex((p) => p.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`Spare part ${id} not found.`);
    }

    const updated = enrichSparePart({
      ...parts[index],
      availableQuantity: Math.max(0, newQty),
      lastRestockDate: new Date().toISOString(),
    });

    parts[index] = updated;
    this.saveParts(parts);
    return updated;
  }
}

class ApiInventoryRepository implements InventoryRepository {
  async getAll(): Promise<SparePart[]> {
    const raw = await apiClient<SparePart[]>(API_ENDPOINTS.INVENTORY_PARTS);
    return raw.map(enrichSparePart);
  }

  async getById(id: string): Promise<SparePart | null> {
    const raw = await apiClient<SparePart>(API_ENDPOINTS.INVENTORY_PART_DETAIL(id));
    return raw ? enrichSparePart(raw) : null;
  }

  async updateQuantity(id: string, newQty: number): Promise<SparePart> {
    const raw = await apiClient<SparePart>(API_ENDPOINTS.INVENTORY_PART_DETAIL(id), {
      method: 'PATCH',
      body: JSON.stringify({ availableQuantity: newQty }),
    });
    return enrichSparePart(raw);
  }
}

export const inventoryRepository: InventoryRepository =
  getDataSourceConfig().mode === 'api'
    ? new ApiInventoryRepository()
    : new MockInventoryRepository();
