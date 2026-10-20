import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { productionRepository } from '@/services/repositories/productionRepository';
import { Milestone } from '@/types';
import { formatDate } from '@/utils/formatters';
import { Award, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export const MilestonesPage: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productionRepository.getMilestones().then((data) => {
      setMilestones(data);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const completedCount = milestones.filter((m) => m.status === 'Completed').length;
  const onTrackCount = milestones.filter((m) => m.status === 'On Track').length;
  const atRiskCount = milestones.filter((m) => m.status === 'At Risk').length;

  const columns = [
    {
      key: 'id',
      header: 'Milestone ID',
      render: (item: Milestone) => (
        <span className="font-mono font-bold text-copper-700">{item.id}</span>
      ),
      sortable: true,
    },
    {
      key: 'title',
      header: 'Milestone Deliverable',
      render: (item: Milestone) => (
        <div>
          <span className="font-semibold text-slate-900 block">{item.title}</span>
          <span className="text-[11px] text-slate-500">{item.summary}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: Milestone) => (
        <span className="text-xs text-slate-700 font-medium">{item.category}</span>
      ),
      sortable: true,
    },
    {
      key: 'plannedDate',
      header: 'Planned Completion',
      render: (item: Milestone) => (
        <span className="font-mono text-slate-600 text-xs">{formatDate(item.plannedDate)}</span>
      ),
      sortable: true,
    },
    {
      key: 'actualDate',
      header: 'Actual Date',
      render: (item: Milestone) => (
        <span className="font-mono text-slate-900 text-xs font-semibold">
          {item.actualDate ? formatDate(item.actualDate) : 'In Progress'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'completionPercentage',
      header: 'Progress %',
      render: (item: Milestone) => (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                item.completionPercentage === 100
                  ? 'bg-emerald-600'
                  : item.status === 'At Risk'
                  ? 'bg-amber-500'
                  : 'bg-copper-600'
              }`}
              style={{ width: `${item.completionPercentage}%` }}
            />
          </div>
          <span className="font-mono text-slate-800 font-bold">{item.completionPercentage}%</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Milestone) => <StatusBadge status={item.status} size="sm" />,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Production Milestones Schedule</h2>
        <p className="text-xs text-slate-500 mt-1">
          Tracking the major project development phases from initial tenement grant through commercial capacity ramp-up.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Total Program Milestones"
          value={milestones.length}
          comparison="Full Capital Development Program"
          accent="navy"
          iconName="Award"
        />

        <KpiCard
          title="Milestones Completed"
          value={completedCount}
          comparison="Delivered on or ahead of schedule"
          accent="emerald"
          iconName="CheckCircle"
        />

        <KpiCard
          title="Milestones On Track"
          value={onTrackCount}
          comparison="Stage 2 Cutback Pushback"
          accent="copper"
          iconName="Clock"
        />

        <KpiCard
          title="Milestones At Risk"
          value={atRiskCount}
          comparison="Underground Infill Rig Mobilization"
          accent="amber"
          iconName="AlertTriangle"
        />
      </div>

      <DataTable
        title="Project Development Milestone Ledger"
        subtitle="Audited capital deliverables and operational target dates"
        data={milestones as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        exportFilename="project_production_milestones"
      />
    </div>
  );
};
