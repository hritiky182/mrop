import { UserRole, UserProfile } from '@/types';

export interface NavItemConfig {
  name: string;
  path: string;
  iconName: string; // Lucide icon identifier
  badge?: string;
  description?: string;
}

export interface RoleConfig {
  id: UserRole;
  label: string;
  tagline: string;
  badgeColor: string;
  homePath: string;
  allowedPaths: string[];
  navItems: NavItemConfig[];
  userProfile: UserProfile;
}

export const PROTOTYPE_USERS: Record<UserRole, UserProfile> = {
  owner: {
    id: 'usr-owner-01',
    name: 'Sir Arthur Stirling',
    email: 'a.stirling@redridgemining.com.au',
    role: 'owner',
    title: 'Managing Director & Principal Owner',
    avatar: 'AS',
    department: 'Executive Board',
  },
  engineer: {
    id: 'usr-eng-02',
    name: 'Marcus Vance, CPEng',
    email: 'm.vance@redridgemining.com.au',
    role: 'engineer',
    title: 'Chief Mechanical & Plant Engineer',
    avatar: 'MV',
    department: 'Plant Operations & Maintenance',
  },
  geologist: {
    id: 'usr-geo-03',
    name: 'Dr. Elena Rostova, FAusIMM',
    email: 'e.rostova@redridgemining.com.au',
    role: 'geologist',
    title: 'Chief Mining Geologist & Resource Lead',
    avatar: 'ER',
    department: 'Resource Geology & Grade Control',
  },
  investor: {
    id: 'usr-inv-04',
    name: 'Claire Beauchamp',
    email: 'c.beauchamp@aurumcapital.com',
    role: 'investor',
    title: 'Portfolio Director — Aurum Resource Fund',
    avatar: 'CB',
    department: 'Institutional Governance & ESG',
  },
};

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  owner: {
    id: 'owner',
    label: 'Owner',
    tagline: 'Executive Root Control',
    badgeColor: 'bg-copper-500 text-white',
    homePath: '/owner',
    allowedPaths: [
      '/owner',
      '/owner/finances',
      '/owner/production',
      '/owner/equipment-costs',
      '/owner/risks',
      '/owner/ai-recommendations',
      '/owner/reports',
      '/settings',
    ],
    userProfile: PROTOTYPE_USERS.owner,
    navItems: [
      { name: 'Executive Dashboard', path: '/owner', iconName: 'LayoutDashboard', description: 'Overall project health & root KPIs' },
      { name: 'Financial Analytics', path: '/owner/finances', iconName: 'DollarSign', description: 'Revenue, OpEx, CapEx & costs' },
      { name: 'Production Overview', path: '/owner/production', iconName: 'TrendingUp', description: 'Gold yield & ore milling' },
      { name: 'Equipment Cost Exposure', path: '/owner/equipment-costs', iconName: 'Coins', description: 'Repair expenditure & asset risk' },
      { name: 'Operational Risks', path: '/owner/risks', iconName: 'AlertTriangle', badge: '3 High', description: 'Vulnerabilities & mitigation' },
      { name: 'AI Recommendations', path: '/owner/ai-recommendations', iconName: 'Sparkles', badge: 'New', description: 'Decision support & impact' },
      { name: 'Reports', path: '/owner/reports', iconName: 'FileText', description: 'Executive operational summaries' },
      { name: 'Settings', path: '/settings', iconName: 'Settings', description: 'Platform configuration & architecture' },
    ],
  },
  engineer: {
    id: 'engineer',
    label: 'Mine Engineer',
    tagline: 'Mechanical & Plant Level',
    badgeColor: 'bg-navy-700 text-copper-300',
    homePath: '/engineer',
    allowedPaths: [
      '/engineer',
      '/engineer/equipment',
      '/engineer/equipment/:id',
      '/engineer/maintenance',
      '/engineer/uptime',
      '/engineer/fluids',
      '/engineer/inventory',
      '/engineer/reports',
      '/settings',
    ],
    userProfile: PROTOTYPE_USERS.engineer,
    navItems: [
      { name: 'Plant Dashboard', path: '/engineer', iconName: 'Activity', description: 'Plant uptime, fleet health & alerts' },
      { name: 'Equipment Fleet', path: '/engineer/equipment', iconName: 'Truck', description: 'Haul trucks, excavators, mills' },
      { name: 'Maintenance & Work Orders', path: '/engineer/maintenance', iconName: 'Wrench', badge: '12 Active', description: 'Manage PMs & corrective orders' },
      { name: 'Uptime & Downtime', path: '/engineer/uptime', iconName: 'Clock', description: 'Availability trends & root causes' },
      { name: 'Fluid Logs', path: '/engineer/fluids', iconName: 'Droplet', description: 'Oil, hydraulics & thermal logs' },
      { name: 'Spare Parts Inventory', path: '/engineer/inventory', iconName: 'Package', badge: 'Low Stock', description: 'Critical parts & warehouse stock' },
      { name: 'Engineering Reports', path: '/engineer/reports', iconName: 'FileSpreadsheet', description: 'Plant logs & maintenance reports' },
      { name: 'Settings', path: '/settings', iconName: 'Settings', description: 'Configuration & architecture settings' },
    ],
  },
  geologist: {
    id: 'geologist',
    label: 'Geologist',
    tagline: 'Geological & Spatial Level',
    badgeColor: 'bg-emerald-800 text-emerald-200',
    homePath: '/geologist',
    allowedPaths: [
      '/geologist',
      '/geologist/grade-control',
      '/geologist/variance',
      '/geologist/dilution',
      '/geologist/assays',
      '/geologist/spatial',
      '/geologist/blocks/:id',
      '/geologist/reports',
      '/settings',
    ],
    userProfile: PROTOTYPE_USERS.geologist,
    navItems: [
      { name: 'Geological Dashboard', path: '/geologist', iconName: 'Compass', description: 'Head grade, recovery & variance' },
      { name: 'Grade Control', path: '/geologist/grade-control', iconName: 'Layers', description: 'Block grade vs cut-off targets' },
      { name: 'Block Model Variance', path: '/geologist/variance', iconName: 'GitCompare', badge: 'Review Req', description: 'Reconciliation planned vs actual' },
      { name: 'Dilution Analytics', path: '/geologist/dilution', iconName: 'PieChart', description: 'Waste contamination monitoring' },
      { name: 'Assay Tracking', path: '/geologist/assays', iconName: 'FlaskConical', badge: '20 Samples', description: 'Lab turnaround & fire assay status' },
      { name: 'Spatial Overview', path: '/geologist/spatial', iconName: 'Map', description: 'Interactive bench & block map' },
      { name: 'Geological Reports', path: '/geologist/reports', iconName: 'BookOpen', description: 'JORC resource & grade reports' },
      { name: 'Settings', path: '/settings', iconName: 'Settings', description: 'Configuration & data source settings' },
    ],
  },
  investor: {
    id: 'investor',
    label: 'Investor',
    tagline: 'Corporate Governance & Macro Level',
    badgeColor: 'bg-amber-800 text-amber-200',
    homePath: '/investor',
    allowedPaths: [
      '/investor',
      '/investor/milestones',
      '/investor/timeline',
      '/investor/esg',
      '/investor/safety',
      '/investor/reports',
      '/settings',
    ],
    userProfile: PROTOTYPE_USERS.investor,
    navItems: [
      { name: 'Investor Dashboard', path: '/investor', iconName: 'BarChart3', description: 'Project milestones & capital returns' },
      { name: 'Production Milestones', path: '/investor/milestones', iconName: 'Award', badge: '6/8 Done', description: 'Key ramp-up targets' },
      { name: 'Project Timeline', path: '/investor/timeline', iconName: 'Calendar', description: 'Gantt & phase deliverables' },
      { name: 'ESG Overview', path: '/investor/esg', iconName: 'Leaf', badge: 'Compliant', description: 'Environmental, social & water metrics' },
      { name: 'Safety Performance', path: '/investor/safety', iconName: 'ShieldCheck', badge: '412 Days Zero LTI', description: 'Lost time injury & TRIFR rates' },
      { name: 'Investor Reports', path: '/investor/reports', iconName: 'FileCheck', description: 'Quarterly financial & governance disclosures' },
      { name: 'Settings', path: '/settings', iconName: 'Settings', description: 'Platform preferences & parameters' },
    ],
  },
};
