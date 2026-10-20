import { Equipment } from '@/types';
import { MOCK_EQUIPMENT } from '@/data/mock/equipment';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '@/utils/storage';
import { getDataSourceConfig } from '@/config/dataSource';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export interface EquipmentRepository {
  getAll(): Promise<Equipment[]>;
  getById(id: string): Promise<Equipment | null>;
  update(id: string, input: Partial<Equipment>): Promise<Equipment>;
}

class MockEquipmentRepository implements EquipmentRepository {
  private getEquipmentList(): Equipment[] {
    return getStoredItem<Equipment[]>(STORAGE_KEYS.EQUIPMENT, MOCK_EQUIPMENT);
  }

  private saveEquipmentList(list: Equipment[]): void {
    setStoredItem(STORAGE_KEYS.EQUIPMENT, list);
  }

  async getAll(): Promise<Equipment[]> {
    await new Promise((resolve) => setTimeout(resolve, getDataSourceConfig().simulatedDelayMs));
    return this.getEquipmentList();
  }

  async getById(id: string): Promise<Equipment | null> {
    await new Promise((resolve) => setTimeout(resolve, getDataSourceConfig().simulatedDelayMs));
    const item = this.getEquipmentList().find((e) => e.id.toLowerCase() === id.toLowerCase());
    return item || null;
  }

  async update(id: string, input: Partial<Equipment>): Promise<Equipment> {
    await new Promise((resolve) => setTimeout(resolve, getDataSourceConfig().simulatedDelayMs));
    const list = this.getEquipmentList();
    const index = list.findIndex((e) => e.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`Equipment with ID ${id} not found.`);
    }

    const updated: Equipment = {
      ...list[index],
      ...input,
    };
    list[index] = updated;
    this.saveEquipmentList(list);
    return updated;
  }
}

class ApiEquipmentRepository implements EquipmentRepository {
  async getAll(): Promise<Equipment[]> {
    return apiClient<Equipment[]>(API_ENDPOINTS.EQUIPMENT_LIST);
  }

  async getById(id: string): Promise<Equipment | null> {
    return apiClient<Equipment>(API_ENDPOINTS.EQUIPMENT_DETAIL(id));
  }

  async update(id: string, input: Partial<Equipment>): Promise<Equipment> {
    return apiClient<Equipment>(API_ENDPOINTS.EQUIPMENT_DETAIL(id), {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }
}

export const equipmentRepository: EquipmentRepository =
  getDataSourceConfig().mode === 'api'
    ? new ApiEquipmentRepository()
    : new MockEquipmentRepository();
