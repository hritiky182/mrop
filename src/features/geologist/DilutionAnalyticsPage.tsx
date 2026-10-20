import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { geologyRepository } from '@/services/repositories/geologyRepository';
import { GeologicalBlock } from '@/types';
import { formatPercent } from '@/utils/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PieChart, AlertTriangle, ArrowRight } from 'lucide-react';

export const DilutionAnalyticsPage: React.FC = () => {
  const [blocks, setBlocks] = useState<GeologicalBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    geologyRepository.getAllBlocks().then((data) => {
      setBlocks(data);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const avgDilution =
    blocks.reduce((sum, b) => sum + b.dilutionPercentage, 0) / (blocks.length || 1);

  // Dilution trend over recent 6 months
  const monthlyDilutionTrend = [
    { month: 'May 2026', dilution: 4.8, target: 5.0 },
    { month: 'Jun 2026', dilution: 5.2, target: 5.0 },
    { month: 'Jul 2026', dilution: 6.1, target: 5.0 },
    { month: 'Aug 2026', dilution: 6.8, target: 5.0 },
    { month: 'Sep 2026', dilution: 7.4, target: 5.0 },
    { month: 'Oct 2026 (MTD)', dilution: 7.9, target: 5.0 },
  ];

  // Affected blocks where dilution > 8.0%
  const affectedBlocks = blocks.filter((b) => b.dilutionPercentage > 8.0);

  const columns = [
    {
      key: 'id',
      header: 'Block ID',
      render: (item: GeologicalBlock) => (
        <span className="font-mono font-bold text-copper-700">{item.id}</span>
      ),
      sortable: true,
    },
    {
      key: 'miningZone',
      header: 'Mining Sector',
      render: (item: GeologicalBlock) => (
        <div>
          <span className="font-semibold text-slate-900 block">{item.miningZone}</span>
          <span className="text-[11px] text-slate-500">{item.benchLevel}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'dilutionPercentage',
      header: 'Dilution %',
      render: (item: GeologicalBlock) => (
        <span
          className={`font-mono font-bold text-xs ${
            item.dilutionPercentage >= 12 ? 'text-rose-700' : 'text-amber-700'
          }`}
        >
          {item.dilutionPercentage}%
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'actualGradeGpt',
      header: 'Actual Head Grade',
      render: (item: GeologicalBlock) => (
        <span className="font-mono text-slate-800">{item.actualGradeGpt.toFixed(2)} g/t</span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'reviewStatus',
      header: 'Review Status',
      render: (item: GeologicalBlock) => <StatusBadge status={item.reviewStatus} size="sm" />,
      sortable: true,
    },
    {
      key: 'geologicalNotes',
      header: 'Dilution Root Cause Notes',
      render: (item: GeologicalBlock) => (
        <span className="text-[11px] text-slate-600 block max-w-sm line-clamp-1">
          {item.geologicalNotes || 'Blast overbreak into hanging-wall contact.'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dilution Analytics & Waste Ingress</h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor barren rock contamination, blast-induced overbreak, and fault displacement impacting mill feed head grade.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Overall Dilution Rate"
          value={formatPercent(avgDilution, 1)}
          comparison="Target: < 5.0% Mining Dilution"
          trend="up"
          trendPositive={false}
          accent="rose"
          iconName="PieChart"
        />

        <KpiCard
          title="Highest Dilution Zone"
          value="Stage 2 South"
          comparison="Averaging 9.6% waste ingress"
          accent="amber"
          iconName="AlertTriangle"
        />

        <KpiCard
          title="Affected Mining Blocks"
          value={affectedBlocks.length}
          comparison="Dilution exceeding 8.0%"
          accent="rose"
          iconName="AlertTriangle"
        />

        <KpiCard
          title="Financial Reagent Impact"
          value="$195k AUD"
          comparison="Excess cyanide consumption risk"
          accent="copper"
          iconName="DollarSign"
        />
      </div>

      {/* Dilution Trend Chart */}
      <ChartCard
        title="Monthly Average Mining Dilution Trend (%)"
        subtitle="Tracking waste rock displacement into modeled ore wireframes"
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyDilutionTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={[3, 10]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                formatter={(val: any) => [`${val}%`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="dilution"
                name="Actual Dilution (%)"
                stroke="#C74646"
                strokeWidth={3}
                dot={{ r: 4, fill: '#C74646' }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target Benchmark (< 5.0%)"
                stroke="#16805D"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Affected Blocks Table */}
      <DataTable
        title={`Blocks Exceeding Dilution Threshold (${affectedBlocks.length} Blocks)`}
        subtitle="Click any block to view fault structure notes and resampling recommendations"
        data={affectedBlocks as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        onRowClick={(item) => navigate(`/geologist/blocks/${item.id}`)}
        exportFilename="high_dilution_blocks"
      />
    </div>
  );
};
