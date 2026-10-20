# Red Ridge Gold Project — Mining Operations & Intelligence Platform (MROP)

An enterprise-grade, frontend-only operational intelligence and decision-support platform designed for modern gold extraction and processing facilities. Built for executive owners, mechanical/plant engineers, senior resource geologists, and institutional investors.

---

## 1. Executive Summary & Project Context

- **Facility:** Red Ridge Gold Project
- **Location:** Yilgarn Craton, Western Australia
- **Primary Commodity:** Gold ($Au$)
- **Processing Architecture:** Carbon-in-Leach (CIL) Open-Pit & Underground Operations
- **Nominal Throughput:** 2.8 Mtpa (Million tonnes per annum)
- **Reporting Currency:** Australian Dollars (AUD / USD Dual-track)

This platform provides real-time situational awareness across the entire mining value chain — from bench-level blast hole sampling and block model grade estimation, through heavy mobile fleet telematics and plant comminution circuits, to executive financial exposure, ESG metrics, and AI-assisted operational interventions.

---

## 2. Technology Stack

| Layer | Technology | Version / Specification |
|---|---|---|
| **Core Framework** | React + TypeScript | React 19, Strict TypeScript 6+ |
| **Build Tool & Bundler** | Vite | Vite 8+ with Rolldown / ESBuild |
| **Styling & Design System** | Tailwind CSS + Custom Industrial Palette | Dark Charcoal/Navy `#14283F`, Copper `#C47B45`, Slate `#475569` |
| **Data Visualizations** | Recharts | Cartesian line/bar charts, grouped variances, donut cost distributions |
| **Icons** | Lucide React | Domain-specific industrial iconography (Pickaxe, HardHat, Gauge, Drill, Truck, etc.) |
| **Form Management** | React Hook Form + Zod | Strictly typed form validation schemas |
| **Date Utilities** | date-fns | ISO timestamp parsing and enterprise date formatting |
| **State & Persistence** | React Context + LocalStorage | Deterministic static seeding with isolated mutation overrides |

---

## 3. Installation & Run Guide

### Prerequisites
- Node.js 18.x or 20.x+
- npm 9.x or 10.x+

### Quick Start
```bash
# 1. Clone repository and navigate to workspace
cd /home/cis/MERN/MROP

# 2. Install all dependencies
npm install --legacy-peer-deps

# 3. Start local development server
npm run dev

# 4. Open in browser
# Server runs on http://127.0.0.1:5173 (or 5174 if port 5173 is occupied)
```

### Production Build & Verification
```bash
# Type check and build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 4. Role-Based Architecture & Navigation Matrix

The platform features 4 distinct role-based views. Use the **Role Switcher** in the top navigation header or sidebar to dynamically switch roles without authenticating.

### Role Matrix

| Role | Domain Focus | Primary Responsibilities | Available Routes |
|---|---|---|---|
| **Owner** | Executive Root Control | Macro financial exposure, total gold production, OpEx breakdown, operational vulnerabilities, and simulated AI recommendation approvals. | `/owner/dashboard`<br>`/owner/financials`<br>`/owner/production`<br>`/owner/costs`<br>`/owner/risks`<br>`/owner/ai-recommendations`<br>`/owner/reports` |
| **Mine Engineer** | Mechanical & Plant Operations | Heavy fleet utilization, equipment health (excavators, haul trucks, crushers, ball mills), work order lifecycle, unplanned downtime analytics, fluid diagnostics, and spare parts inventory. | `/engineer/dashboard`<br>`/engineer/fleet`<br>`/engineer/equipment/:id`<br>`/engineer/maintenance`<br>`/engineer/uptime`<br>`/engineer/fluids`<br>`/engineer/inventory`<br>`/engineer/reports` |
| **Geologist** | Geological & Spatial Intelligence | Ore grade control, bench block model variance %, dilution monitoring, assay turnaround tracking, 2D spatial block model canvas, and block dossiers. | `/geologist/dashboard`<br>`/geologist/grade-control`<br>`/geologist/block-model`<br>`/geologist/dilution`<br>`/geologist/assays`<br>`/geologist/spatial`<br>`/geologist/block/:id`<br>`/geologist/reports` |
| **Investor** | Corporate Governance & Project Health | Production milestones, ramp-up trajectory, Gantt timeline, ESG metrics (carbon, water stewardship, community engagement), zero LTI safety records, and downloadable executive reports. | `/investor/dashboard`<br>`/investor/milestones`<br>`/investor/timeline`<br>`/investor/esg`<br>`/investor/safety`<br>`/investor/reports` |

Frontend route protection (`ProtectedRoleRoute`) verifies the current user's role and displays a styled `AccessDeniedPage` if an unauthorized route is visited.

---

## 5. Software Architecture & Design Patterns

The codebase is organized according to clean architecture principles with strict separation between UI, business domain logic, and data access layers:

```
src/
├── app/                  # Application bootstrap and routing entry points
├── components/           # Reusable UI primitives
│   ├── common/           # Modal, ConfirmationDialog, SearchModal, ToastContainer
│   ├── dashboard/        # KpiCard, ChartCard, DataTable, StatusBadge, FilterBar
│   └── layout/           # AppLayout, Sidebar, Header, Breadcrumbs, RoleSwitcher
├── config/               # Roles, navigation maps, and data source toggle (MOCK vs API)
├── context/              # AuthRoleContext, NotificationContext, ProjectContext
├── data/mock/            # Deterministic, internally consistent mining datasets
├── features/             # Feature modules grouped by role and functional domain
│   ├── owner/            # Executive dashboards, financial analysis, AI center
│   ├── engineer/         # Fleet monitor, equipment details, work orders, inventory
│   ├── geologist/        # Grade control, block variance, assays, 2D spatial map
│   ├── investor/         # Milestones, Gantt timeline, ESG, safety records
│   ├── reports/          # Cross-role reporting and CSV export
│   └── settings/         # Data source mode and Reset Demo Data
├── hooks/                # Reusable hooks (useAsync, useDebounce, useLocalStorage)
├── services/
│   ├── api/              # Centralized apiClient and API endpoint definitions
│   └── repositories/     # Domain repository interfaces & mock implementations
├── types/                # Canonical TypeScript interfaces and domain schemas
└── utils/                # Formatters, mathematical calculations, and CSV export
```

### Static Data & Repository Pattern
No page component directly imports raw data arrays. Every view communicates with domain repositories:
- `equipmentRepository.ts`
- `maintenanceRepository.ts`
- `inventoryRepository.ts`
- `geologyRepository.ts`
- `aiRecommendationRepository.ts`
- `productionRepository.ts`
- `notificationRepository.ts`

Each repository implements an asynchronous contract (e.g. `getAll()`, `getById()`, `update()`, `create()`), seeding from deterministic mock data and overlaying mutations from isolated `localStorage` keys.

---

## 6. LocalStorage Persistence & Demo State Reset

To provide an authentic enterprise user experience without a backend server, user interactions are persisted across page reloads:
- **Work Orders:** Create, update status (Open, Scheduled, In Progress, Completed, On Hold), reassign technician.
- **Spare Parts Inventory:** Adjust quantities, reorder parts (recomputes stock status automatically).
- **Geological Block Reviews:** Mark blocks under geological review, approve grade variances.
- **Fire Assays:** Expedite or update laboratory assay turnaround status.
- **AI Recommendation Decisions:** Approve, reject, or flag plans with recorded audit timestamps.
- **Active Role Selection:** Remembers the active demonstrator persona.

### Reset Demo Data
To restore the platform to its pristine initial state:
1. Navigate to **Settings** (`/settings`) from the left sidebar or top profile menu.
2. Under **Demo State & Persistence**, click **Reset Demo Data**.
3. Confirm in the dialog. All `mrop_enterprise_*` keys are cleared, and original deterministic mock data is re-seeded immediately.

---

## 7. Migration Guide: Connecting a Real Backend API

The platform is designed to switch from static mock repositories to a real REST or GraphQL backend with minimal friction:

### Step 1: Configure Environment Variables
Set your backend API base URL in `.env`:
```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=https://api.redridge-mining.com/v1
```

### Step 2: Implement Real Repositories
Create API-backed repository implementations matching the existing repository interfaces. For example:

```typescript
// src/services/repositories/api/apiEquipmentRepository.ts
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { Equipment, EquipmentRepository, UpdateEquipmentInput } from '@/types';

export class ApiEquipmentRepository implements EquipmentRepository {
  async getAll(): Promise<Equipment[]> {
    return apiClient.get<Equipment[]>(API_ENDPOINTS.EQUIPMENT.BASE);
  }

  async getById(id: string): Promise<Equipment | null> {
    return apiClient.get<Equipment>(API_ENDPOINTS.EQUIPMENT.BY_ID(id));
  }

  async update(id: string, input: UpdateEquipmentInput): Promise<Equipment> {
    return apiClient.patch<Equipment>(API_ENDPOINTS.EQUIPMENT.BY_ID(id), input);
  }
}
```

### Step 3: Swap in Repository Index
In `src/services/index.ts`, toggle the repository instance based on `DATA_SOURCE_CONFIG.mode`:
```typescript
export const equipmentRepository = DATA_SOURCE_CONFIG.mode === 'api'
  ? new ApiEquipmentRepository()
  : mockEquipmentRepository;
```

**Zero UI components or hooks require modification.**

---

## 8. Suggested Future REST API Endpoints

```http
# Authentication & Roles
POST   /api/v1/auth/login
GET    /api/v1/auth/me

# Executive & Dashboards
GET    /api/v1/dashboard/owner
GET    /api/v1/dashboard/engineer
GET    /api/v1/dashboard/geologist
GET    /api/v1/dashboard/investor

# Fleet & Plant Equipment
GET    /api/v1/equipment
GET    /api/v1/equipment/:id
PATCH  /api/v1/equipment/:id
GET    /api/v1/equipment/:id/telematics
GET    /api/v1/equipment/:id/fluids

# Maintenance & Work Orders
GET    /api/v1/maintenance/work-orders
POST   /api/v1/maintenance/work-orders
GET    /api/v1/maintenance/work-orders/:id
PATCH  /api/v1/maintenance/work-orders/:id
DELETE /api/v1/maintenance/work-orders/:id

# Spare Parts Inventory
GET    /api/v1/inventory/parts
PATCH  /api/v1/inventory/parts/:id/adjust-stock

# Geology & Assays
GET    /api/v1/geology/blocks
GET    /api/v1/geology/blocks/:id
PATCH  /api/v1/geology/blocks/:id/review
GET    /api/v1/geology/assays
PATCH  /api/v1/geology/assays/:id

# Production & ESG
GET    /api/v1/production/milestones
GET    /api/v1/production/metrics
GET    /api/v1/esg/indicators
GET    /api/v1/safety/records

# AI Operations Decision Support
GET    /api/v1/ai/recommendations
POST   /api/v1/ai/recommendations/:id/approve
POST   /api/v1/ai/recommendations/:id/reject
POST   /api/v1/ai/recommendations/:id/review

# Reports
GET    /api/v1/reports/export?type=csv&category=:category
```

---

## 9. Disclaimers & Prototype Boundaries

1. **Illustrative AI Analytics:** The AI recommendation engine is a high-fidelity decision-support simulation. Recommendations do not directly actuate physical plant controls or autonomous mobile machinery.
2. **Simplified Spatial Representation:** The 2D spatial grid provides a schematic conceptualization of bench levels and ore grade blocks. It is not a substitute for geostatistical block model formats (e.g., Datamine, Surpac, Vulcan) or spatial GIS files.
3. **Illustrative ESG & Safety Data:** ESG compliance records, water balance, and Lost Time Injury (LTI) data are simulated prototype records and do not certify regulatory compliance under JORC or NI 43-101 codes.
