import {
  FinancialOverview,
  ProductionTrendPoint,
  Milestone,
  EsgIndicator,
  SafetyRecord,
  OperationalRisk,
} from '@/types';
import { MOCK_FINANCIAL_OVERVIEW, MOCK_PRODUCTION_TREND } from '@/data/mock/finances';
import { MOCK_MILESTONES } from '@/data/mock/milestones';
import { MOCK_ESG_INDICATORS } from '@/data/mock/esg';
import { MOCK_SAFETY_STATS, MOCK_SAFETY_RECORDS } from '@/data/mock/safety';
import { MOCK_OPERATIONAL_RISKS } from '@/data/mock/risks';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '@/utils/storage';
import { getDataSourceConfig } from '@/config/dataSource';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export interface ProductionRepository {
  getFinances(): Promise<FinancialOverview>;
  getProductionTrends(): Promise<ProductionTrendPoint[]>;
  getMilestones(): Promise<Milestone[]>;
  getEsgIndicators(): Promise<EsgIndicator[]>;
  getSafetyStats(): Promise<typeof MOCK_SAFETY_STATS>;
  getSafetyRecords(): Promise<SafetyRecord[]>;
  getOperationalRisks(): Promise<OperationalRisk[]>;
  updateRiskStatus(id: string, status: OperationalRisk['currentStatus']): Promise<OperationalRisk>;
}

class MockProductionRepository implements ProductionRepository {
  private getRisks(): OperationalRisk[] {
    return getStoredItem<OperationalRisk[]>(STORAGE_KEYS.RISKS, MOCK_OPERATIONAL_RISKS);
  }

  private saveRisks(risks: OperationalRisk[]): void {
    setStoredItem(STORAGE_KEYS.RISKS, risks);
  }

  async getFinances(): Promise<FinancialOverview> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return MOCK_FINANCIAL_OVERVIEW;
  }

  async getProductionTrends(): Promise<ProductionTrendPoint[]> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return MOCK_PRODUCTION_TREND;
  }

  async getMilestones(): Promise<Milestone[]>{
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return MOCK_MILESTONES;
  }

  async getEsgIndicators(): Promise<EsgIndicator[]> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return MOCK_ESG_INDICATORS;
  }

  async getSafetyStats(): Promise<typeof MOCK_SAFETY_STATS> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return MOCK_SAFETY_STATS;
  }

  async getSafetyRecords(): Promise<SafetyRecord[]> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return MOCK_SAFETY_RECORDS;
  }

  async getOperationalRisks(): Promise<OperationalRisk[]> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return this.getRisks();
  }

  async updateRiskStatus(id: string, status: OperationalRisk['currentStatus']): Promise<OperationalRisk> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const risks = this.getRisks();
    const index = risks.findIndex((r) => r.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`Risk ${id} not found`);
    }

    const updated: OperationalRisk = {
      ...risks[index],
      currentStatus: status,
    };
    risks[index] = updated;
    this.saveRisks(risks);
    return updated;
  }
}

class ApiProductionRepository implements ProductionRepository {
  async getFinances(): Promise<FinancialOverview> {
    return apiClient<FinancialOverview>(API_ENDPOINTS.FINANCES);
  }

  async getProductionTrends(): Promise<ProductionTrendPoint[]> {
    return apiClient<ProductionTrendPoint[]>(API_ENDPOINTS.PRODUCTION_TRENDS);
  }

  async getMilestones(): Promise<Milestone[]> {
    return apiClient<Milestone[]>(API_ENDPOINTS.MILESTONES);
  }

  async getEsgIndicators(): Promise<EsgIndicator[]> {
    return apiClient<EsgIndicator[]>(API_ENDPOINTS.ESG_METRICS);
  }

  async getSafetyStats(): Promise<typeof MOCK_SAFETY_STATS> {
    return apiClient<typeof MOCK_SAFETY_STATS>(API_ENDPOINTS.SAFETY_METRICS);
  }

  async getSafetyRecords(): Promise<SafetyRecord[]> {
    return apiClient<SafetyRecord[]>(`${API_ENDPOINTS.SAFETY_METRICS}/records`);
  }

  async getOperationalRisks(): Promise<OperationalRisk[]> {
    return apiClient<OperationalRisk[]>(API_ENDPOINTS.OPERATIONAL_RISKS);
  }

  async updateRiskStatus(id: string, status: OperationalRisk['currentStatus']): Promise<OperationalRisk> {
    return apiClient<OperationalRisk>(`${API_ENDPOINTS.OPERATIONAL_RISKS}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ currentStatus: status }),
    });
  }
}

export const productionRepository: ProductionRepository =
  getDataSourceConfig().mode === 'api'
    ? new ApiProductionRepository()
    : new MockProductionRepository();
