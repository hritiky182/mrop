import { AiRecommendation, AiRecommendationStatus } from '@/types';
import { MOCK_AI_RECOMMENDATIONS } from '@/data/mock/aiRecommendations';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '@/utils/storage';
import { getDataSourceConfig } from '@/config/dataSource';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export interface AiRecommendationRepository {
  getAll(): Promise<AiRecommendation[]>;
  getById(id: string): Promise<AiRecommendation | null>;
  updateStatus(
    id: string,
    status: AiRecommendationStatus,
    reviewerName?: string,
    notes?: string
  ): Promise<AiRecommendation>;
}

class MockAiRecommendationRepository implements AiRecommendationRepository {
  private getRecs(): AiRecommendation[] {
    return getStoredItem<AiRecommendation[]>(STORAGE_KEYS.AI_RECOMMENDATIONS, MOCK_AI_RECOMMENDATIONS);
  }

  private saveRecs(recs: AiRecommendation[]): void {
    setStoredItem(STORAGE_KEYS.AI_RECOMMENDATIONS, recs);
  }

  async getAll(): Promise<AiRecommendation[]> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return this.getRecs();
  }

  async getById(id: string): Promise<AiRecommendation | null> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const rec = this.getRecs().find((r) => r.id.toLowerCase() === id.toLowerCase());
    return rec || null;
  }

  async updateStatus(
    id: string,
    status: AiRecommendationStatus,
    reviewerName?: string,
    notes?: string
  ): Promise<AiRecommendation> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const recs = this.getRecs();
    const index = recs.findIndex((r) => r.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`AI recommendation ${id} not found.`);
    }

    const updated: AiRecommendation = {
      ...recs[index],
      status,
      updatedAt: new Date().toISOString(),
      reviewedBy: reviewerName || recs[index].reviewedBy,
      reviewNotes: notes || recs[index].reviewNotes,
    };

    recs[index] = updated;
    this.saveRecs(recs);
    return updated;
  }
}

class ApiAiRecommendationRepository implements AiRecommendationRepository {
  async getAll(): Promise<AiRecommendation[]> {
    return apiClient<AiRecommendation[]>(API_ENDPOINTS.AI_RECOMMENDATIONS);
  }

  async getById(id: string): Promise<AiRecommendation | null> {
    return apiClient<AiRecommendation>(`${API_ENDPOINTS.AI_RECOMMENDATIONS}/${id}`);
  }

  async updateStatus(
    id: string,
    status: AiRecommendationStatus,
    reviewerName?: string,
    notes?: string
  ): Promise<AiRecommendation> {
    const action = status === 'Approved' ? 'approve' : status === 'Rejected' ? 'reject' : 'review';
    return apiClient<AiRecommendation>(API_ENDPOINTS.AI_RECOMMENDATION_ACTION(id, action), {
      method: 'POST',
      body: JSON.stringify({ reviewerName, notes }),
    });
  }
}

export const aiRecommendationRepository: AiRecommendationRepository =
  getDataSourceConfig().mode === 'api'
    ? new ApiAiRecommendationRepository()
    : new MockAiRecommendationRepository();
