import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { productionRepository } from '@/services/repositories/productionRepository';
import { EsgIndicator } from '@/types';
import { formatDate } from '@/utils/formatters';
import { Leaf, Users, ShieldCheck, Info, CheckCircle2, AlertTriangle, Droplet } from 'lucide-react';

export const EsgOverviewPage: React.FC = () => {
  const [esgList, setEsgList] = useState<EsgIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [pillarFilter, setPillarFilter] = useState<string>('All');

  useEffect(() => {
    productionRepository.getEsgIndicators().then((data) => {
      setEsgList(data);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const envPillar = esgList.filter((e) => e.pillar === 'Environmental');
  const socPillar = esgList.filter((e) => e.pillar === 'Social');
  const govPillar = esgList.filter((e) => e.pillar === 'Governance');

  const filteredEsg = pillarFilter === 'All'
    ? esgList
    : esgList.filter((e) => e.pillar === pillarFilter);

  const columns = [
    {
      key: 'pillar',
      header: 'ESG Pillar',
      render: (item: EsgIndicator) => {
        const badgeColors = {
          Environmental: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          Social: 'bg-blue-50 text-blue-800 border-blue-200',
          Governance: 'bg-purple-50 text-purple-800 border-purple-200',
        };
        return (
          <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${badgeColors[item.pillar]}`}>
            {item.pillar}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'metricName',
      header: 'Audited Indicator Metric',
      render: (item: EsgIndicator) => (
        <div>
          <span className="font-semibold text-slate-900 block">{item.metricName}</span>
          <span className="text-[11px] text-slate-500">{item.notes}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'currentValue',
      header: 'Current Performance',
      render: (item: EsgIndicator) => (
        <span className="font-mono font-bold text-slate-900">
          {item.currentValue} {item.unit}
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'targetValue',
      header: 'Target Threshold',
      render: (item: EsgIndicator) => (
        <span className="font-mono text-slate-600">
          {item.targetValue} {item.unit}
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'period',
      header: 'Audit Period',
      render: (item: EsgIndicator) => (
        <span className="text-xs font-medium text-slate-700">{item.period}</span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Compliance Status',
      render: (item: EsgIndicator) => <StatusBadge status={item.status} size="sm" />,
      sortable: true,
    },
    {
      key: 'lastAuditDate',
      header: 'Last Audit Date',
      render: (item: EsgIndicator) => (
        <span className="font-mono text-slate-500 text-xs">{formatDate(item.lastAuditDate)}</span>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Environmental, Social & Governance (ESG)</h2>
        <p className="text-xs text-slate-500 mt-1">
          Statutory compliance monitoring, water stewardship, greenhouse gas abatement, community agreements, and tailings governance.
        </p>
      </div>

      <div className="p-3.5 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2.5 shadow-2xs">
        <Info className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Illustrative Indicator Notice:</strong> These ESG indicators are fictional data provided for prototype demonstration. They do not constitute formal third-party certification or regulatory filings.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Environmental Stewardship"
          value="84.5%"
          unit="Water Recycled"
          comparison="TSF decant recycling exceeds 80% target"
          accent="emerald"
          iconName="Leaf"
          statusBadge={<StatusBadge status="Exceptional" variant="operational" size="sm" />}
        />

        <KpiCard
          title="Social & Indigenous Cohort"
          value="24.8%"
          unit="Representation"
          comparison="Target: 25.0% Local First Nations"
          accent="amber"
          iconName="Users"
          statusBadge={<StatusBadge status="Review Req" variant="warning" size="sm" />}
        />

        <KpiCard
          title="Governance & TSF Audit"
          value="100%"
          unit="GISTM Aligned"
          comparison="Zero outstanding tenement notices"
          accent="navy"
          iconName="ShieldCheck"
          statusBadge={<StatusBadge status="Fully Compliant" variant="operational" size="sm" />}
        />
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm text-xs">
        <span className="font-semibold text-slate-500">Filter Pillar:</span>
        {['All', 'Environmental', 'Social', 'Governance'].map((p) => (
          <button
            key={p}
            onClick={() => setPillarFilter(p)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              pillarFilter === p
                ? 'bg-copper-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* ESG Indicators Table */}
      <DataTable
        title="Audited Sustainability & Governance Metrics"
        subtitle="Audited quarterly by ERM Environmental Consultants & WA Department of Mines"
        data={filteredEsg as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        exportFilename="esg_governance_metrics"
      />
    </div>
  );
};
