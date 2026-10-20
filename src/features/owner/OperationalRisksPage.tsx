import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { productionRepository } from '@/services/repositories/productionRepository';
import { useNotifications } from '@/context/NotificationContext';
import { OperationalRisk } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { calculateRiskScore } from '@/utils/calculations';
import { AlertTriangle, ShieldCheck, Filter } from 'lucide-react';

export const OperationalRisksPage: React.FC = () => {
  const [risks, setRisks] = useState<OperationalRisk[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    const data = await productionRepository.getOperationalRisks();
    setRisks(data);
    setLoading(false);
  };

  const handleStatusChange = async (riskId: string, newStatus: OperationalRisk['currentStatus']) => {
    try {
      const updated = await productionRepository.updateRiskStatus(riskId, newStatus);
      setRisks((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast('Risk Mitigation Updated', `Risk ${riskId} status set to ${newStatus}.`, 'info');
    } catch {
      showToast('Error', 'Failed to update risk status.', 'error');
    }
  };

  if (loading) return null;

  const riskMetric = calculateRiskScore(risks);
  const totalExposure = risks
    .filter((r) => r.currentStatus !== 'Resolved')
    .reduce((sum, r) => sum + r.financialExposureAud, 0);

  const filteredRisks = selectedDept === 'All'
    ? risks
    : risks.filter((r) => r.affectedDepartment === selectedDept);

  const columns = [
    {
      key: 'title',
      header: 'Operational Vulnerability',
      render: (item: OperationalRisk) => (
        <div>
          <span className="font-semibold text-slate-900 block">{item.title}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">{item.potentialImpact}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (item: OperationalRisk) => <StatusBadge status={item.severity} size="sm" />,
      sortable: true,
    },
    {
      key: 'affectedDepartment',
      header: 'Department',
      render: (item: OperationalRisk) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {item.affectedDepartment}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'financialExposureAud',
      header: 'Financial Exposure',
      render: (item: OperationalRisk) => (
        <span className="font-mono font-bold text-rose-700">
          {formatCurrency(item.financialExposureAud)}
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'currentStatus',
      header: 'Mitigation Status',
      render: (item: OperationalRisk) => (
        <select
          value={item.currentStatus}
          onChange={(e) =>
            handleStatusChange(item.id, e.target.value as OperationalRisk['currentStatus'])
          }
          className="text-xs bg-white border border-slate-200 rounded px-2 py-1 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-copper-500"
        >
          <option value="Unmitigated">Unmitigated</option>
          <option value="Mitigation In Progress">Mitigation In Progress</option>
          <option value="Monitored">Monitored</option>
          <option value="Resolved">Resolved</option>
        </select>
      ),
    },
    {
      key: 'recommendedAction',
      header: 'Recommended Action',
      render: (item: OperationalRisk) => (
        <span className="text-[11px] text-slate-600 leading-tight block max-w-xs">
          {item.recommendedAction}
        </span>
      ),
    },
  ];

  const departments = ['All', 'Mechanical', 'Plant', 'Geology', 'Supply Chain', 'HSE'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Operational Vulnerabilities Matrix</h2>
        <p className="text-xs text-slate-500 mt-1">
          Root control risk register assessing plant bottlenecks, mechanical exposures, grade dilution, and commercial lab delays.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Consolidated Risk Score"
          value={`${riskMetric.score}/100`}
          comparison={`${riskMetric.criticalCount} Critical Unmitigated Items`}
          trend="up"
          trendPositive={false}
          accent="rose"
          iconName="AlertTriangle"
        />

        <KpiCard
          title="Active Financial Exposure"
          value={formatCurrency(totalExposure, true)}
          comparison="Unmitigated operational risk total"
          accent="amber"
          iconName="DollarSign"
        />

        <KpiCard
          title="Total Monitored Risks"
          value={risks.length}
          comparison={`${risks.filter((r) => r.currentStatus === 'Resolved').length} Resolved YTD`}
          accent="emerald"
          iconName="ShieldCheck"
        />
      </div>

      {/* Filter by Department */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 flex items-center gap-1 shrink-0 font-medium">
          <Filter className="w-3.5 h-3.5" /> Department:
        </span>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              selectedDept === dept
                ? 'bg-copper-600 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      <DataTable
        title="Active Operational Vulnerabilities Register"
        subtitle="Update mitigation status directly. Changes persist in local storage."
        data={filteredRisks as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        exportFilename="operational_vulnerabilities_register"
      />
    </div>
  );
};
