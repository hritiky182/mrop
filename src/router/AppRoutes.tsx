import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoleRoute } from '@/components/common/ProtectedRoleRoute';
import { useAuthRole } from '@/context/AuthRoleContext';
import { ROLE_CONFIGS } from '@/config/roles';

// Owner Pages
import { OwnerDashboard } from '@/features/owner/OwnerDashboard';
import { FinancialAnalyticsPage } from '@/features/owner/FinancialAnalyticsPage';
import { ProductionOverviewPage } from '@/features/owner/ProductionOverviewPage';
import { EquipmentCostsPage } from '@/features/owner/EquipmentCostsPage';
import { OperationalRisksPage } from '@/features/owner/OperationalRisksPage';
import { AiRecommendationsPage } from '@/features/owner/AiRecommendationsPage';
import { ExecutiveReportsPage } from '@/features/owner/ExecutiveReportsPage';

// Engineer Pages
import { EngineerDashboard } from '@/features/engineer/EngineerDashboard';
import { EquipmentFleetPage } from '@/features/engineer/EquipmentFleetPage';
import { EquipmentDetailPage } from '@/features/engineer/EquipmentDetailPage';
import { MaintenancePage } from '@/features/engineer/MaintenancePage';
import { UptimeDowntimePage } from '@/features/engineer/UptimeDowntimePage';
import { FluidLogsPage } from '@/features/engineer/FluidLogsPage';
import { InventoryPage } from '@/features/engineer/InventoryPage';
import { EngineeringReportsPage } from '@/features/engineer/EngineeringReportsPage';

// Geologist Pages
import { GeologistDashboard } from '@/features/geologist/GeologistDashboard';
import { BlockModelVariancePage } from '@/features/geologist/BlockModelVariancePage';
import { GradeControlPage } from '@/features/geologist/GradeControlPage';
import { DilutionAnalyticsPage } from '@/features/geologist/DilutionAnalyticsPage';
import { AssayTrackingPage } from '@/features/geologist/AssayTrackingPage';
import { SpatialOverviewPage } from '@/features/geologist/SpatialOverviewPage';
import { BlockDetailPage } from '@/features/geologist/BlockDetailPage';
import { GeologicalReportsPage } from '@/features/geologist/GeologicalReportsPage';

// Investor Pages
import { InvestorDashboard } from '@/features/investor/InvestorDashboard';
import { MilestonesPage } from '@/features/investor/MilestonesPage';
import { ProjectTimelinePage } from '@/features/investor/ProjectTimelinePage';
import { EsgOverviewPage } from '@/features/investor/EsgOverviewPage';
import { SafetyPerformancePage } from '@/features/investor/SafetyPerformancePage';
import { InvestorReportsPage } from '@/features/investor/InvestorReportsPage';

// Shared Pages
import { SettingsPage } from '@/features/shared/SettingsPage';
import { AccessDeniedPage } from '@/features/shared/AccessDeniedPage';
import { NotFoundPage } from '@/features/shared/NotFoundPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { AuthGuard } from '@/components/common/AuthGuard';

const RootRedirect: React.FC = () => {
  const { role } = useAuthRole();
  const targetHome = ROLE_CONFIGS[role]?.homePath || '/owner';
  return <Navigate to={targetHome} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes — No one can access without authentication */}
      <Route
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        {/* Root Redirect to current active role home */}
        <Route path="/" element={<RootRedirect />} />

        {/* Universal Settings & Error Pages */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        {/* ================= OWNER ROUTES ================= */}
        <Route
          path="/owner"
          element={
            <ProtectedRoleRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/owner/finances"
          element={
            <ProtectedRoleRoute allowedRoles={['owner']}>
              <FinancialAnalyticsPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/owner/production"
          element={
            <ProtectedRoleRoute allowedRoles={['owner']}>
              <ProductionOverviewPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/owner/equipment-costs"
          element={
            <ProtectedRoleRoute allowedRoles={['owner']}>
              <EquipmentCostsPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/owner/risks"
          element={
            <ProtectedRoleRoute allowedRoles={['owner']}>
              <OperationalRisksPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/owner/ai-recommendations"
          element={
            <ProtectedRoleRoute allowedRoles={['owner']}>
              <AiRecommendationsPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/owner/reports"
          element={
            <ProtectedRoleRoute allowedRoles={['owner']}>
              <ExecutiveReportsPage />
            </ProtectedRoleRoute>
          }
        />

        {/* ================= MINE ENGINEER ROUTES ================= */}
        <Route
          path="/engineer"
          element={
            <ProtectedRoleRoute allowedRoles={['engineer']}>
              <EngineerDashboard />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/engineer/equipment"
          element={
            <ProtectedRoleRoute allowedRoles={['engineer']}>
              <EquipmentFleetPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/engineer/equipment/:id"
          element={
            <ProtectedRoleRoute allowedRoles={['engineer']}>
              <EquipmentDetailPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/engineer/maintenance"
          element={
            <ProtectedRoleRoute allowedRoles={['engineer']}>
              <MaintenancePage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/engineer/uptime"
          element={
            <ProtectedRoleRoute allowedRoles={['engineer']}>
              <UptimeDowntimePage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/engineer/fluids"
          element={
            <ProtectedRoleRoute allowedRoles={['engineer']}>
              <FluidLogsPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/engineer/inventory"
          element={
            <ProtectedRoleRoute allowedRoles={['engineer']}>
              <InventoryPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/engineer/reports"
          element={
            <ProtectedRoleRoute allowedRoles={['engineer']}>
              <EngineeringReportsPage />
            </ProtectedRoleRoute>
          }
        />

        {/* ================= GEOLOGIST ROUTES ================= */}
        <Route
          path="/geologist"
          element={
            <ProtectedRoleRoute allowedRoles={['geologist']}>
              <GeologistDashboard />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/geologist/grade-control"
          element={
            <ProtectedRoleRoute allowedRoles={['geologist']}>
              <GradeControlPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/geologist/variance"
          element={
            <ProtectedRoleRoute allowedRoles={['geologist']}>
              <BlockModelVariancePage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/geologist/dilution"
          element={
            <ProtectedRoleRoute allowedRoles={['geologist']}>
              <DilutionAnalyticsPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/geologist/assays"
          element={
            <ProtectedRoleRoute allowedRoles={['geologist']}>
              <AssayTrackingPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/geologist/spatial"
          element={
            <ProtectedRoleRoute allowedRoles={['geologist']}>
              <SpatialOverviewPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/geologist/blocks/:id"
          element={
            <ProtectedRoleRoute allowedRoles={['geologist']}>
              <BlockDetailPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/geologist/reports"
          element={
            <ProtectedRoleRoute allowedRoles={['geologist']}>
              <GeologicalReportsPage />
            </ProtectedRoleRoute>
          }
        />

        {/* ================= INVESTOR ROUTES ================= */}
        <Route
          path="/investor"
          element={
            <ProtectedRoleRoute allowedRoles={['investor']}>
              <InvestorDashboard />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/investor/milestones"
          element={
            <ProtectedRoleRoute allowedRoles={['investor']}>
              <MilestonesPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/investor/timeline"
          element={
            <ProtectedRoleRoute allowedRoles={['investor']}>
              <ProjectTimelinePage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/investor/esg"
          element={
            <ProtectedRoleRoute allowedRoles={['investor']}>
              <EsgOverviewPage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/investor/safety"
          element={
            <ProtectedRoleRoute allowedRoles={['investor']}>
              <SafetyPerformancePage />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/investor/reports"
          element={
            <ProtectedRoleRoute allowedRoles={['investor']}>
              <InvestorReportsPage />
            </ProtectedRoleRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
