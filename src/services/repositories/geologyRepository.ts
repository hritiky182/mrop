import { GeologicalBlock, AssayRecord, GeologicalReviewStatus, AssayStatus } from '@/types';
import { MOCK_GEOLOGICAL_BLOCKS } from '@/data/mock/geology';
import { MOCK_ASSAYS } from '@/data/mock/assays';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '@/utils/storage';
import { calculateVariancePct } from '@/utils/calculations';
import { getDataSourceConfig } from '@/config/dataSource';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export interface GeologyRepository {
  getAllBlocks(): Promise<GeologicalBlock[]>;
  getBlockById(id: string): Promise<GeologicalBlock | null>;
  updateBlockReview(id: string, reviewStatus: GeologicalReviewStatus, notes?: string): Promise<GeologicalBlock>;
  getAllAssays(): Promise<AssayRecord[]>;
  updateAssayStatus(id: string, status: AssayStatus, goldResultGpt?: number): Promise<AssayRecord>;
}

function enrichBlock(block: GeologicalBlock): GeologicalBlock {
  return {
    ...block,
    tonnageVariancePct: calculateVariancePct(block.actualTonnage, block.plannedTonnage),
    gradeVariancePct: calculateVariancePct(block.actualGradeGpt, block.plannedGradeGpt),
  };
}

class MockGeologyRepository implements GeologyRepository {
  private getBlocks(): GeologicalBlock[] {
    const raw = getStoredItem<GeologicalBlock[]>(STORAGE_KEYS.GEOLOGICAL_BLOCKS, MOCK_GEOLOGICAL_BLOCKS);
    return raw.map(enrichBlock);
  }

  private saveBlocks(blocks: GeologicalBlock[]): void {
    setStoredItem(STORAGE_KEYS.GEOLOGICAL_BLOCKS, blocks);
  }

  private getAssays(): AssayRecord[] {
    return getStoredItem<AssayRecord[]>(STORAGE_KEYS.ASSAYS, MOCK_ASSAYS);
  }

  private saveAssays(assays: AssayRecord[]): void {
    setStoredItem(STORAGE_KEYS.ASSAYS, assays);
  }

  async getAllBlocks(): Promise<GeologicalBlock[]> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return this.getBlocks();
  }

  async getBlockById(id: string): Promise<GeologicalBlock | null> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const block = this.getBlocks().find((b) => b.id.toLowerCase() === id.toLowerCase());
    return block || null;
  }

  async updateBlockReview(
    id: string,
    reviewStatus: GeologicalReviewStatus,
    notes?: string
  ): Promise<GeologicalBlock> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const blocks = this.getBlocks();
    const index = blocks.findIndex((b) => b.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`Geological block ${id} not found.`);
    }

    const updated = enrichBlock({
      ...blocks[index],
      reviewStatus,
      lastUpdatedDate: new Date().toISOString(),
      geologicalNotes: notes || blocks[index].geologicalNotes,
    });

    blocks[index] = updated;
    this.saveBlocks(blocks);
    return updated;
  }

  async getAllAssays(): Promise<AssayRecord[]> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return this.getAssays();
  }

  async updateAssayStatus(
    id: string,
    status: AssayStatus,
    goldResultGpt?: number
  ): Promise<AssayRecord> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const assays = this.getAssays();
    const index = assays.findIndex((a) => a.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`Assay record ${id} not found.`);
    }

    const updated: AssayRecord = {
      ...assays[index],
      assayStatus: status,
      actualResultDate: status === 'Results Available' ? new Date().toISOString() : assays[index].actualResultDate,
      goldResultGpt: goldResultGpt !== undefined ? goldResultGpt : assays[index].goldResultGpt,
    };

    assays[index] = updated;
    this.saveAssays(assays);
    return updated;
  }
}

class ApiGeologyRepository implements GeologyRepository {
  async getAllBlocks(): Promise<GeologicalBlock[]> {
    const raw = await apiClient<GeologicalBlock[]>(API_ENDPOINTS.GEOLOGY_BLOCKS);
    return raw.map(enrichBlock);
  }

  async getBlockById(id: string): Promise<GeologicalBlock | null> {
    const raw = await apiClient<GeologicalBlock>(API_ENDPOINTS.GEOLOGY_BLOCK_DETAIL(id));
    return raw ? enrichBlock(raw) : null;
  }

  async updateBlockReview(id: string, reviewStatus: GeologicalReviewStatus, notes?: string): Promise<GeologicalBlock> {
    const raw = await apiClient<GeologicalBlock>(API_ENDPOINTS.GEOLOGY_BLOCK_DETAIL(id), {
      method: 'PATCH',
      body: JSON.stringify({ reviewStatus, notes }),
    });
    return enrichBlock(raw);
  }

  async getAllAssays(): Promise<AssayRecord[]> {
    return apiClient<AssayRecord[]>(API_ENDPOINTS.GEOLOGY_ASSAYS);
  }

  async updateAssayStatus(id: string, status: AssayStatus, goldResultGpt?: number): Promise<AssayRecord> {
    return apiClient<AssayRecord>(API_ENDPOINTS.GEOLOGY_ASSAY_DETAIL(id), {
      method: 'PATCH',
      body: JSON.stringify({ assayStatus: status, goldResultGpt }),
    });
  }
}

export const geologyRepository: GeologyRepository =
  getDataSourceConfig().mode === 'api'
    ? new ApiGeologyRepository()
    : new MockGeologyRepository();
