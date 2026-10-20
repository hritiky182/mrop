import { MiningProject } from '@/types';

export const MOCK_PROJECT: MiningProject = {
  id: 'PRJ-RR-WA',
  name: 'Red Ridge Gold Project',
  code: 'RRG-01',
  location: 'Yilgarn Craton, 85km East of Kalgoorlie',
  region: 'Western Australia',
  primaryCommodity: 'Gold (Au)',
  secondaryCommodity: 'Silver (Ag)',
  currentPhase: 'Stage 2 Open Pit Operations & CIP Plant Ramp-Up',
  operationalStatus: 'Active Operations',
  reportingDate: new Date().toISOString(),
};
