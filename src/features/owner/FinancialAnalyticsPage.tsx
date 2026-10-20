import React, { useState, useEffect } from 'react';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { productionRepository } from '@/services/repositories/productionRepository';
import { FinancialOverview, ProductionTrendPoint } from '@/types';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Layers, PieChart } from 'lucide-react';

export const FinancialAnalyticsPage: React.FC = () => {
  const [finances, setFinances] = useState<FinancialOverview | null>(null);
  const [trends, setTrends] = useState<ProductionTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productionRepository.getFinances(),
      productionRepository.getProductionTrends(),
    ]).then(([fin, trn]) => {
      setFinances(fin);
      setTrends(trn);
      setLoading(false);
    });
  }, []);

  if (loading || !finances) return null;

  const costColumns = [
    {
      key: 'category',
      header: 'Expenditure Category',
      render: (item: { category: string }) => (
        <span className="font-semibold text-slate-800">{item.category}</span>
      ),
    },
    {
      key: 'amountAud',
      header: 'YTD Cost (AUD)',
      render: (item: { amountAud: number }) => (
        <span className="font-mono font-bold text-slate-900">{formatCurrency(item.amountAud)}</span>
      ),
    },
    {
      key: 'percentage',
      header: '% of Total OpEx',
      render: (item: { percentage: number }) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-copper-500 h-full rounded-full"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <span className="font-mono text-slate-600">{item.percentage.toFixed(1)}%</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Performance & Cost Analytics</h2>
        <p className="text-xs text-slate-500 mt-1">
          Detailed breakdown of mining revenue, all-in sustaining costs (AISC), equipment repair contributions, and capital efficiency.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue (YTD)"
          value={formatCurrency(finances.totalRevenueYtdAud, true)}
          comparison="Realized Gold Price $3,645/oz"
          trend="up"
          accent="navy"
          iconName="DollarSign"
        />

        <KpiCard
          title="Total Operating Cost"
          value={formatCurrency(finances.operatingCostYtdAud, true)}
          comparison="On track with $80M annual budget"
          trend="down"
          trendPositive={false}
          accent="copper"
          iconName="Layers"
        />

        <KpiCard
          title="All-In Sustaining Cost (AISC)"
          value={`$${formatNumber(finances.allInSustainingCostAiscPerOzAud)}`}
          unit="AUD / oz"
          comparison="Margin: +$1,961 AUD / oz"
          trend="down"
          trendPositive={true}
          accent="emerald"
          iconName="TrendingUp"
        />

        <KpiCard
          title="Equipment Repair Expenditure"
          value={formatCurrency(finances.equipmentRepairCostsYtdAud, true)}
          comparison="19.0% of total operating expenditure"
          trend="up"
          trendPositive={false}
          accent="amber"
          iconName="Wrench"
        />
      </div>

      {/* Revenue vs Operating Cost Chart */}
      <ChartCard
        title="Monthly Revenue vs Operating Cost (AUD)"
        subtitle="Operational cash-flow margin analysis"
        badge={<span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Positive Net Margin</span>}
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `$${(val / 1_000_000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                formatter={(val: any) => [formatCurrency(Number(val)), '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="actualRevenueAud" name="Actual Revenue ($ AUD)" fill="#14283F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="operatingCostAud" name="Operating Cost ($ AUD)" fill="#C47B45" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Cost Breakdown Table */}
      <DataTable
        title="Operating Cost Contribution Breakdown"
        subtitle="Major operational cost centers across open pit and milling plant"
        data={finances.costBreakdown as unknown as Record<string, unknown>[]}
        columns={costColumns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.category)}
        exportFilename="financial_cost_breakdown"
      />
    </div>
  );
};
