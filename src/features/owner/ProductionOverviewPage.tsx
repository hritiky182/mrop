import React, { useState, useEffect } from 'react';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { productionRepository } from '@/services/repositories/productionRepository';
import { ProductionTrendPoint } from '@/types';
import { formatNumber, formatPercent } from '@/utils/formatters';
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

export const ProductionOverviewPage: React.FC = () => {
  const [trends, setTrends] = useState<ProductionTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productionRepository.getProductionTrends().then((data) => {
      setTrends(data);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const totalGoldOz = trends.reduce((sum, item) => sum + item.actualGoldOz, 0);
  const totalTargetOz = trends.reduce((sum, item) => sum + item.targetGoldOz, 0);
  const totalOreTonnes = trends.reduce((sum, item) => sum + item.actualOreTonnes, 0);
  const targetOreTonnes = trends.reduce((sum, item) => sum + item.targetOreTonnes, 0);

  const columns = [
    {
      key: 'month',
      header: 'Reporting Period',
      render: (item: ProductionTrendPoint) => (
        <span className="font-semibold text-slate-800">{item.month}</span>
      ),
    },
    {
      key: 'actualGoldOz',
      header: 'Actual Gold (oz)',
      render: (item: ProductionTrendPoint) => (
        <span className="font-mono font-bold text-copper-700">{formatNumber(item.actualGoldOz)} oz</span>
      ),
    },
    {
      key: 'targetGoldOz',
      header: 'Target Gold (oz)',
      render: (item: ProductionTrendPoint) => (
        <span className="font-mono text-slate-600">{formatNumber(item.targetGoldOz)} oz</span>
      ),
    },
    {
      key: 'variance',
      header: 'Variance',
      render: (item: ProductionTrendPoint) => {
        const variance = ((item.actualGoldOz - item.targetGoldOz) / item.targetGoldOz) * 100;
        const isPos = variance >= 0;
        return (
          <span className={`font-mono text-xs font-semibold ${isPos ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatPercent(variance, 1, true)}
          </span>
        );
      },
    },
    {
      key: 'actualOreTonnes',
      header: 'Milled Ore (t)',
      render: (item: ProductionTrendPoint) => (
        <span className="font-mono text-slate-800">{formatNumber(item.actualOreTonnes)} t</span>
      ),
    },
    {
      key: 'targetOreTonnes',
      header: 'Target Ore (t)',
      render: (item: ProductionTrendPoint) => (
        <span className="font-mono text-slate-500">{formatNumber(item.targetOreTonnes)} t</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Production Milestone Overview</h2>
        <p className="text-xs text-slate-500 mt-1">
          Historical gold pouring throughput, SAG mill ore processing tonnages, and mine schedule reconciliation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Gold Poured"
          value={formatNumber(totalGoldOz)}
          unit="oz Au"
          comparison={`${formatPercent(((totalGoldOz - totalTargetOz) / totalTargetOz) * 100, 1, true)} vs Schedule`}
          trend="up"
          accent="copper"
          iconName="Award"
        />

        <KpiCard
          title="Total Ore Milled"
          value={formatNumber(totalOreTonnes)}
          unit="Tonnes"
          comparison={`${formatPercent(((totalOreTonnes - targetOreTonnes) / targetOreTonnes) * 100, 1, true)} vs Target`}
          trend="up"
          accent="navy"
          iconName="Layers"
        />

        <KpiCard
          title="Average Plant Recovery"
          value="92.4%"
          comparison="+0.8% above design specification"
          trend="up"
          accent="emerald"
          iconName="Activity"
        />

        <KpiCard
          title="Annual Run-Rate"
          value="104,200"
          unit="oz / year"
          comparison="Full Commercial Capacity Achieved"
          trend="up"
          accent="copper"
          iconName="CheckCircle"
        />
      </div>

      {/* Ore Milling Chart */}
      <ChartCard
        title="Milled Ore Throughput vs Plan (Tonnes)"
        subtitle="Primary jaw crusher and SAG mill circuit feed"
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}kt`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                formatter={(val: any) => [`${formatNumber(Number(val))} tonnes`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="actualOreTonnes" name="Actual Ore (Tonnes)" fill="#C47B45" radius={[4, 4, 0, 0]} />
              <Bar dataKey="targetOreTonnes" name="Planned Target (Tonnes)" fill="#14283F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Production Historical Table */}
      <DataTable
        title="Monthly Production Records"
        subtitle="Audit log of mined and milled metallurgical reconciliation"
        data={trends as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.month)}
        exportFilename="production_milestone_overview"
      />
    </div>
  );
};
