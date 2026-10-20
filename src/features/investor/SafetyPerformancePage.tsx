import React, { useState, useEffect } from 'react';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { productionRepository } from '@/services/repositories/productionRepository';
import { SafetyRecord } from '@/types';
import { formatDate } from '@/utils/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export const SafetyPerformancePage: React.FC = () => {
  const [safetyRecords, setSafetyRecords] = useState<SafetyRecord[]>([]);
  const [safetyStats, setSafetyStats] = useState<{
    zeroLtiDays: number;
    totalRecordableIncidentRateTrifr: number;
    industryBenchmarkTrifr: number;
    manHoursWorkedYtd: number;
    openSafetyActionsCount: number;
    closedSafetyActionsCount: number;
    safetyAuditsCompletedYtd: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productionRepository.getSafetyRecords(),
      productionRepository.getSafetyStats(),
    ]).then(([recs, stats]) => {
      setSafetyRecords(recs);
      setSafetyStats(stats);
      setLoading(false);
    });
  }, []);

  if (loading || !safetyStats) return null;

  // Monthly TRIFR trend data
  const trifrTrend = [
    { month: 'May 2026', trifr: 2.80, benchmark: 4.80 },
    { month: 'Jun 2026', trifr: 2.65, benchmark: 4.80 },
    { month: 'Jul 2026', trifr: 2.40, benchmark: 4.80 },
    { month: 'Aug 2026', trifr: 2.30, benchmark: 4.80 },
    { month: 'Sep 2026', trifr: 2.20, benchmark: 4.80 },
    { month: 'Oct 2026', trifr: 2.15, benchmark: 4.80 },
  ];

  const columns = [
    {
      key: 'id',
      header: 'Action ID',
      render: (item: SafetyRecord) => (
        <span className="font-mono font-bold text-copper-700">{item.id}</span>
      ),
      sortable: true,
    },
    {
      key: 'title',
      header: 'Safety Initiative / Incident Finding',
      render: (item: SafetyRecord) => (
        <div>
          <span className="font-semibold text-slate-900 block">{item.title}</span>
          <span className="text-[11px] text-slate-500">{item.actionRequired}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'metricType',
      header: 'Category',
      render: (item: SafetyRecord) => (
        <span className="text-xs font-medium text-slate-700">{item.metricType}</span>
      ),
      sortable: true,
    },
    {
      key: 'severity',
      header: 'Priority',
      render: (item: SafetyRecord) => <StatusBadge status={item.severity} size="sm" />,
      sortable: true,
    },
    {
      key: 'assignedOfficer',
      header: 'Assigned HSE Officer',
      render: (item: SafetyRecord) => (
        <span className="text-slate-700 font-medium">{item.assignedOfficer}</span>
      ),
      sortable: true,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (item: SafetyRecord) => (
        <span className="font-mono text-slate-600 text-xs">{formatDate(item.dueDate)}</span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Resolution Status',
      render: (item: SafetyRecord) => <StatusBadge status={item.status} size="sm" />,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Workforce Health, Safety & Zero Harm</h2>
        <p className="text-xs text-slate-500 mt-1">
          Tracking lost time injuries (LTI), total recordable injury frequency rate (TRIFR), hazard mitigation actions, and site safety audits.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Zero LTI Milestone"
          value={safetyStats.zeroLtiDays}
          unit="Days Free"
          comparison="400+ Days Celebrated on Site"
          accent="emerald"
          iconName="ShieldCheck"
          statusBadge={<StatusBadge status="Zero Harm" variant="operational" size="sm" />}
        />

        <KpiCard
          title="Site TRIFR Rate"
          value={safetyStats.totalRecordableIncidentRateTrifr.toFixed(2)}
          comparison={`Industry Average: ${safetyStats.industryBenchmarkTrifr.toFixed(2)}`}
          trend="down"
          trendPositive={true}
          accent="emerald"
          iconName="Activity"
        />

        <KpiCard
          title="Man-Hours Worked (YTD)"
          value="840,000"
          unit="Hours"
          comparison="Zero Fatalities / Severe Traumas"
          accent="navy"
          iconName="Clock"
        />

        <KpiCard
          title="Active Safety Actions"
          value={safetyStats.openSafetyActionsCount}
          comparison={`${safetyStats.closedSafetyActionsCount} Actions Closed YTD`}
          accent="amber"
          iconName="AlertTriangle"
        />
      </div>

      {/* TRIFR Safety Trend Chart */}
      <ChartCard
        title="Total Recordable Injury Frequency Rate (TRIFR Trend)"
        subtitle="Per 1,000,000 man-hours worked vs Western Australia mining industry average"
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trifrTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={[0, 6]} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                formatter={(val: any) => [`${val}`, 'TRIFR']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="trifr"
                name="Red Ridge TRIFR"
                stroke="#16805D"
                strokeWidth={3}
                dot={{ r: 4, fill: '#16805D' }}
              />
              <Line
                type="monotone"
                dataKey="benchmark"
                name="WA Mining Benchmark (4.80)"
                stroke="#C74646"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Safety Actions Table */}
      <DataTable
        title="Active HSE & Hazard Mitigation Actions"
        subtitle="Audit findings, risk preventative modifications, and vehicle exclusion zones"
        data={safetyRecords as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        exportFilename="safety_performance_register"
      />
    </div>
  );
};
