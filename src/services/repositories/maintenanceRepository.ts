import { WorkOrder } from '@/types';
import { MOCK_WORK_ORDERS } from '@/data/mock/maintenance';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '@/utils/storage';
import { getDataSourceConfig } from '@/config/dataSource';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export interface MaintenanceRepository {
  getAll(): Promise<WorkOrder[]>;
  getById(id: string): Promise<WorkOrder | null>;
  getByEquipmentId(equipmentId: string): Promise<WorkOrder[]>;
  create(order: Omit<WorkOrder, 'id'>): Promise<WorkOrder>;
  update(id: string, input: Partial<WorkOrder>): Promise<WorkOrder>;
  delete(id: string): Promise<void>;
}

class MockMaintenanceRepository implements MaintenanceRepository {
  private getOrders(): WorkOrder[] {
    return getStoredItem<WorkOrder[]>(STORAGE_KEYS.WORK_ORDERS, MOCK_WORK_ORDERS);
  }

  private saveOrders(orders: WorkOrder[]): void {
    setStoredItem(STORAGE_KEYS.WORK_ORDERS, orders);
  }

  async getAll(): Promise<WorkOrder[]> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return this.getOrders();
  }

  async getById(id: string): Promise<WorkOrder | null> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const found = this.getOrders().find((o) => o.id.toLowerCase() === id.toLowerCase());
    return found || null;
  }

  async getByEquipmentId(equipmentId: string): Promise<WorkOrder[]> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return this.getOrders().filter(
      (o) => o.equipmentId.toLowerCase() === equipmentId.toLowerCase()
    );
  }

  async create(input: Omit<WorkOrder, 'id'>): Promise<WorkOrder> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const orders = this.getOrders();
    const newId = `WO-${Math.floor(8822 + Math.random() * 1000)}`;
    const newOrder: WorkOrder = {
      ...input,
      id: newId,
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  async update(id: string, input: Partial<WorkOrder>): Promise<WorkOrder> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`Work Order ${id} not found.`);
    }

    const updated: WorkOrder = {
      ...orders[index],
      ...input,
    };
    orders[index] = updated;
    this.saveOrders(orders);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const orders = this.getOrders();
    const filtered = orders.filter((o) => o.id.toLowerCase() !== id.toLowerCase());
    this.saveOrders(filtered);
  }
}

class ApiMaintenanceRepository implements MaintenanceRepository {
  async getAll(): Promise<WorkOrder[]> {
    return apiClient<WorkOrder[]>(API_ENDPOINTS.WORK_ORDERS);
  }

  async getById(id: string): Promise<WorkOrder | null> {
    return apiClient<WorkOrder>(API_ENDPOINTS.WORK_ORDER_DETAIL(id));
  }

  async getByEquipmentId(equipmentId: string): Promise<WorkOrder[]> {
    return apiClient<WorkOrder[]>(`${API_ENDPOINTS.WORK_ORDERS}?equipmentId=${equipmentId}`);
  }

  async create(order: Omit<WorkOrder, 'id'>): Promise<WorkOrder> {
    return apiClient<WorkOrder>(API_ENDPOINTS.WORK_ORDERS, {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async update(id: string, input: Partial<WorkOrder>): Promise<WorkOrder> {
    return apiClient<WorkOrder>(API_ENDPOINTS.WORK_ORDER_DETAIL(id), {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async delete(id: string): Promise<void> {
    return apiClient<void>(API_ENDPOINTS.WORK_ORDER_DETAIL(id), {
      method: 'DELETE',
    });
  }
}

export const maintenanceRepository: MaintenanceRepository =
  getDataSourceConfig().mode === 'api'
    ? new ApiMaintenanceRepository()
    : new MockMaintenanceRepository();
