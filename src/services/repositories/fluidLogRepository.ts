import { FluidLog } from '@/types';
import { MOCK_FLUID_LOGS } from '@/data/mock/fluidLogs';
import { getDataSourceConfig } from '@/config/dataSource';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export interface FluidLogRepository {
  getAll(): Promise<FluidLog[]>;
  getByEquipmentId(equipmentId: string): Promise<FluidLog[]>;
}

class MockFluidLogRepository implements FluidLogRepository {
  async getAll(): Promise<FluidLog[]> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return MOCK_FLUID_LOGS;
  }

  async getByEquipmentId(equipmentId: string): Promise<FluidLog[]> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return MOCK_FLUID_LOGS.filter(
      (log) => log.equipmentId.toLowerCase() === equipmentId.toLowerCase()
    );
  }
}

class ApiFluidLogRepository implements FluidLogRepository {
  async getAll(): Promise<FluidLog[]> {
    return apiClient<FluidLog[]>(API_ENDPOINTS.FLUID_LOGS);
  }

  async getByEquipmentId(equipmentId: string): Promise<FluidLog[]> {
    return apiClient<FluidLog[]>(`${API_ENDPOINTS.FLUID_LOGS}?equipmentId=${equipmentId}`);
  }
}

export const fluidLogRepository: FluidLogRepository =
  getDataSourceConfig().mode === 'api'
    ? new ApiFluidLogRepository()
    : new MockFluidLogRepository();
