import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useAuthRole } from '@/context/AuthRoleContext';
import { ROLE_CONFIGS } from '@/config/roles';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { role } = useAuthRole();
  const currentConfig = ROLE_CONFIGS[role];

  const pathnames = location.pathname.split('/').filter((x) => x);

  const formatBreadcrumb = (segment: string) => {
    if (segment === 'owner') return 'Owner';
    if (segment === 'engineer') return 'Mine Engineer';
    if (segment === 'geologist') return 'Geologist';
    if (segment === 'investor') return 'Investor';
    if (segment === 'finances') return 'Financial Analytics';
    if (segment === 'production') return 'Production';
    if (segment === 'equipment-costs') return 'Equipment Costs';
    if (segment === 'risks') return 'Operational Risks';
    if (segment === 'ai-recommendations') return 'AI Recommendations';
    if (segment === 'equipment') return 'Fleet Overview';
    if (segment === 'maintenance') return 'Maintenance & Work Orders';
    if (segment === 'uptime') return 'Uptime & Downtime';
    if (segment === 'fluids') return 'Fluid Logs';
    if (segment === 'inventory') return 'Spare Parts Inventory';
    if (segment === 'grade-control') return 'Grade Control';
    if (segment === 'variance') return 'Block Model Variance';
    if (segment === 'dilution') return 'Dilution Analytics';
    if (segment === 'assays') return 'Assay Tracking';
    if (segment === 'spatial') return 'Spatial Overview';
    if (segment === 'blocks') return 'Blocks';
    if (segment === 'milestones') return 'Production Milestones';
    if (segment === 'timeline') return 'Project Timeline';
    if (segment === 'esg') return 'ESG Compliance';
    if (segment === 'safety') return 'Safety Performance';
    if (segment === 'reports') return 'Reports';
    if (segment === 'settings') return 'Settings';

    return segment.toUpperCase();
  };

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
      <Link
        to={currentConfig.homePath}
        className="flex items-center gap-1 hover:text-slate-800 transition-colors"
      >
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-medium text-slate-600">{currentConfig.label}</span>
      </Link>

      {pathnames.length > 1 && (
        <>
          {pathnames.slice(1).map((segment, index) => {
            const isLast = index === pathnames.length - 2;
            const to = `/${pathnames.slice(0, index + 2).join('/')}`;

            return (
              <React.Fragment key={to}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                {isLast ? (
                  <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                    {formatBreadcrumb(segment)}
                  </span>
                ) : (
                  <Link to={to} className="hover:text-slate-800 transition-colors font-medium">
                    {formatBreadcrumb(segment)}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </>
      )}
    </nav>
  );
};
