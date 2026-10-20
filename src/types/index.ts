// User Roles
export type UserRole = 'owner' | 'engineer' | 'geologist' | 'investor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatar: string;
  department: string;
}

// Project Details
export interface MiningProject {
  id: string;
  name: string;
  code: string;
  location: string;
  region: string;
  primaryCommodity: string;
  secondaryCommodity?: string;
  currentPhase: string;
  operationalStatus: 'Active Operations' | 'Maintenance Shut' | 'Ramping Up' | 'Exploration';
  reportingDate: string; // ISO date
}

// Equipment
export type EquipmentStatus = 'Operational' | 'Idle' | 'Under Maintenance' | 'Fault Detected' | 'Offline';
export type EquipmentCategory = 'Excavators' | 'Haul Trucks' | 'Crushers' | 'Conveyors' | 'Drill Rigs' | 'Loaders' | 'Pumps' | 'Processing Mills';
export type AlertLevel = 'Normal' | 'Low' | 'Medium' | 'High' | 'Critical';

export interface Equipment {
  id: string; // e.g. EX-101
  name: string;
  category: EquipmentCategory;
  model: string;
  serialNumber: string;
  location: string; // Pit A, Bench 4, Mill Feed, etc.
  status: EquipmentStatus;
  utilizationRate: number; // percentage 0-100
  availabilityRate: number; // percentage 0-100
  operatingHours: number;
  downtimeHoursTotal: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  assignedOperator: string;
  alertLevel: AlertLevel;
  healthScore: number; // 0-100
  fuelBurnRateLph: number; // liters per hour
  oilPressureKpa: number;
  engineTempC: number;
  historicalRepairCostAud: number;
}

// Maintenance Work Order
export type WorkOrderStatus = 'Open' | 'Scheduled' | 'In Progress' | 'Completed' | 'On Hold';
export type MaintenanceType = 'Preventative' | 'Corrective' | 'Emergency' | 'Inspection' | 'Overhaul';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface WorkOrder {
  id: string; // e.g. WO-8821
  equipmentId: string;
  equipmentName: string;
  type: MaintenanceType;
  title: string;
  description: string;
  priority: PriorityLevel;
  assignedTechnician: string;
  plannedStartDate: string;
  dueDate: string;
  completedDate?: string;
  estimatedCostAud: number;
  actualCostAud?: number;
  status: WorkOrderStatus;
  partsRequired?: string[];
  notes?: string;
}

// Spare Parts Inventory
export interface SparePart {
  id: string; // e.g. PRT-4029
  partNumber: string;
  name: string;
  compatibleEquipment: string[]; // e.g. ["EX-101", "LD-105"]
  availableQuantity: number;
  minimumStockLevel: number;
  unitCostAud: number;
  supplier: string;
  storageLocation: string; // Warehouse Bay C-12
  lastRestockDate: string;
  leadTimeDays: number;
  stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock'; // Calculated
}

// Fluid Log
export type FluidType = 'Engine Oil' | 'Hydraulic Fluid' | 'Transmission Oil' | 'Coolant' | 'Gearbox Lubricant';
export type FluidCondition = 'Clean / Normal' | 'Marginal Degradation' | 'Contaminated' | 'Severe Oxidation';
export type InspectionStatus = 'Passed' | 'Action Required' | 'Immediate Flush Required';

export interface FluidLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  fluidType: FluidType;
  fluidLevelPercentage: number;
  condition: FluidCondition;
  temperatureCelsius: number;
  pressureKpa: number;
  lastInspectionDate: string;
  nextInspectionDate: string;
  recordedAbnormality?: string;
  inspectionStatus: InspectionStatus;
  technician: string;
}

// Geological Block
export type OreClassification = 'High-Grade Ore' | 'Medium-Grade Ore' | 'Low-Grade Ore' | 'Mineralized Waste' | 'Waste';
export type GeologicalReviewStatus = 'Verified' | 'Pending Review' | 'Flagged for Resampling' | 'Dilution Alert';

export interface GeologicalBlock {
  id: string; // e.g. BLK-Z1-042
  miningZone: string; // North Pit, Stage 2 South, Main Cutback
  benchLevel: string; // RL 340m, RL 325m, RL 310m
  xCoord: number; // illustrative grid coordinates
  yCoord: number;
  plannedTonnage: number; // Metric tonnes
  actualTonnage: number;
  plannedGradeGpt: number; // Grams per tonne Au
  actualGradeGpt: number;
  dilutionPercentage: number;
  oreClassification: OreClassification;
  samplingStatus: 'Completed' | 'Pending Assays' | 'Under Sampling';
  gradeComplianceStatus: 'Compliant' | 'Variance High' | 'Variance Critical' | 'Grade Depleted';
  assignedGeologist: string;
  lastUpdatedDate: string;
  reviewStatus: GeologicalReviewStatus;
  geologicalNotes?: string;
  // Computed fields
  tonnageVariancePct?: number;
  gradeVariancePct?: number;
}

// Assay Record
export type AssayStatus = 'Collected' | 'Submitted' | 'Processing' | 'Results Available' | 'Delayed';

export interface AssayRecord {
  id: string; // e.g. ASY-2026-904
  sampleLocation: string;
  miningBlockId: string;
  sampleCollectionDate: string;
  laboratory: string; // ALS Kalgoorlie, Bureau Veritas Perth
  submissionDate: string;
  expectedResultDate: string;
  actualResultDate?: string;
  assayStatus: AssayStatus;
  turnaroundDays: number;
  priority: PriorityLevel;
  goldResultGpt?: number;
  silverResultGpt?: number;
  geologistAssigned: string;
}

// AI Operational Recommendation
export type AiRecommendationStatus = 'Pending Review' | 'Approved' | 'Rejected' | 'Marked for Review';
export type AiImpactCategory = 'Maintenance' | 'Grade Control' | 'Fuel & Energy' | 'Equipment Fleet' | 'Production Schedule';

export interface AiRecommendation {
  id: string; // e.g. AI-REC-01
  title: string;
  category: AiImpactCategory;
  priority: PriorityLevel;
  confidenceScore: number; // percentage e.g. 94%
  riskLevel: 'Low' | 'Moderate' | 'Elevated';
  summary: string;
  description: string;
  operationalImpact: string;
  estimatedFinancialImpactAud: number; // positive = savings/gain, negative = cost
  supportingMetrics: {
    metricName: string;
    currentValue: string;
    projectedValue: string;
  }[];
  recommendedNextSteps: string[];
  status: AiRecommendationStatus;
  updatedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

// Production Milestone
export type MilestoneStatus = 'Completed' | 'On Track' | 'At Risk' | 'Delayed';

export interface Milestone {
  id: string; // e.g. MLS-01
  title: string;
  plannedDate: string;
  actualDate?: string;
  completionPercentage: number;
  status: MilestoneStatus;
  summary: string;
  category: 'Mine Development' | 'Plant Commissioning' | 'Production Ramp-up' | 'Environmental Compliance';
  dependencies?: string[];
}

// ESG Indicator
export interface EsgIndicator {
  id: string;
  pillar: 'Environmental' | 'Social' | 'Governance';
  metricName: string;
  unit: string;
  currentValue: number;
  targetValue: number;
  period: string;
  status: 'Compliant' | 'Review Required' | 'Attention' | 'Exceptional';
  lastAuditDate: string;
  notes: string;
}

// Safety Performance Action & Metric
export interface SafetyRecord {
  id: string;
  metricType: 'LTI Free Days' | 'TRIFR' | 'Safety Audit' | 'Near Miss Investigation' | 'Hazard Mitigation';
  title: string;
  incidentDate?: string;
  severity: PriorityLevel;
  assignedOfficer: string;
  actionRequired: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Closed' | 'Verified';
}

// Operational Vulnerability / Risk
export interface OperationalRisk {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  affectedDepartment: 'Mechanical' | 'Plant' | 'Geology' | 'Supply Chain' | 'HSE' | 'Finance';
  potentialImpact: string;
  financialExposureAud: number;
  currentStatus: 'Unmitigated' | 'Mitigation In Progress' | 'Monitored' | 'Resolved';
  recommendedAction: string;
  ownerName: string;
  identifiedDate: string;
}

// Global Notification
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'equipment' | 'maintenance' | 'geology' | 'production' | 'esg' | 'ai';
  severity: 'info' | 'warning' | 'critical' | 'success';
  timestamp: string;
  read: boolean;
  linkTo?: string;
}

// Financial KPI Overview
export interface FinancialOverview {
  totalRevenueYtdAud: number;
  operatingCostYtdAud: number;
  equipmentRepairCostsYtdAud: number;
  fuelEnergyCostAud: number;
  laborCostAud: number;
  processingCostAud: number;
  otherOpexAud: number;
  allInSustainingCostAiscPerOzAud: number;
  goldRealizedPricePerOzAud: number;
  costBreakdown: { category: string; amountAud: number; percentage: number }[];
}

// Monthly Production Trend
export interface ProductionTrendPoint {
  month: string;
  actualGoldOz: number;
  targetGoldOz: number;
  actualOreTonnes: number;
  targetOreTonnes: number;
  actualRevenueAud: number;
  operatingCostAud: number;
}
