/**
 * Centralized API Endpoints for Future REST Backend
 *
 * When transitioning from static mock prototype to production backend,
 * configure VITE_API_BASE_URL to point to your live microservices.
 */

export const API_ENDPOINTS = {
  // Dashboards
  DASHBOARD_OWNER: '/api/v1/dashboard/owner',
  DASHBOARD_ENGINEER: '/api/v1/dashboard/engineer',
  DASHBOARD_GEOLOGIST: '/api/v1/dashboard/geologist',
  DASHBOARD_INVESTOR: '/api/v1/dashboard/investor',

  // Equipment & Fleet
  EQUIPMENT_LIST: '/api/v1/equipment',
  EQUIPMENT_DETAIL: (id: string) => `/api/v1/equipment/${id}`,
  EQUIPMENT_TELEMETRY: (id: string) => `/api/v1/equipment/${id}/telemetry`,

  // Maintenance & Work Orders
  WORK_ORDERS: '/api/v1/maintenance/work-orders',
  WORK_ORDER_DETAIL: (id: string) => `/api/v1/maintenance/work-orders/${id}`,

  // Fluid Monitoring
  FLUID_LOGS: '/api/v1/maintenance/fluids',
  FLUID_LOG_DETAIL: (id: string) => `/api/v1/maintenance/fluids/${id}`,

  // Inventory & Warehouse
  INVENTORY_PARTS: '/api/v1/inventory/parts',
  INVENTORY_PART_DETAIL: (id: string) => `/api/v1/inventory/parts/${id}`,

  // Geology & Resource Block Model
  GEOLOGY_BLOCKS: '/api/v1/geology/blocks',
  GEOLOGY_BLOCK_DETAIL: (id: string) => `/api/v1/geology/blocks/${id}`,
  GEOLOGY_ASSAYS: '/api/v1/geology/assays',
  GEOLOGY_ASSAY_DETAIL: (id: string) => `/api/v1/geology/assays/${id}`,

  // Production & Governance
  FINANCES: '/api/v1/production/finances',
  PRODUCTION_TRENDS: '/api/v1/production/trends',
  MILESTONES: '/api/v1/production/milestones',
  ESG_METRICS: '/api/v1/governance/esg',
  SAFETY_METRICS: '/api/v1/governance/safety',
  OPERATIONAL_RISKS: '/api/v1/analytics/operational-risks',

  // AI Decision Recommendations
  AI_RECOMMENDATIONS: '/api/v1/ai/recommendations',
  AI_RECOMMENDATION_ACTION: (id: string, action: 'approve' | 'reject' | 'review') =>
    `/api/v1/ai/recommendations/${id}/${action}`,

  // Notifications
  NOTIFICATIONS: '/api/v1/notifications',
  NOTIFICATIONS_READ: (id: string) => `/api/v1/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/api/v1/notifications/read-all',
} as const;
