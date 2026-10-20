import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { equipmentRepository } from '@/services/repositories/equipmentRepository';
import { Equipment } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/formatters';

export const EquipmentCostsPage: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    equipmentRepository.getAll().then((data) => {
      setEquipmentList(data);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const totalExpenditure = equipmentList.reduce(
    (sum, eq) => sum + eq.historicalRepairCostAud,
    0
  );
  const totalDowntimeHours = equipmentList.reduce(
    (sum, eq) => sum + eq.downtimeHoursTotal,
    0
  );

  const columns = [
    {
      key: 'id',
      header: 'Equipment ID',
      render: (item: Equipment) => (
        <span className="font-bold text-copper-700 font-mono">{item.id}</span>
      ),
      sortable: true,
    },
    {
      key: 'name',
      header: 'Equipment Name & Model',
      render: (item: Equipment) => (
        <div>
          <span className="font-semibold text-slate-900 block">{item.name}</span>
          <span className="text-[11px] text-slate-500">{item.model}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: Equipment) => (
        <span className="text-slate-700 font-medium">{item.category}</span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Current Condition',
      render: (item: Equipment) => <StatusBadge status={item.status} size="sm" />,
      sortable: true,
    },
    {
      key: 'downtimeHoursTotal',
      header: 'Downtime (Hours)',
      render: (item: Equipment) => (
        <span className="font-mono text-slate-700 font-medium">
          {formatNumber(item.downtimeHoursTotal)} hrs
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'historicalRepairCostAud',
      header: 'Cumulative Maintenance Cost',
      render: (item: Equipment) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(item.historicalRepairCostAud)}
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'alertLevel',
      header: 'Operational Impact Priority',
      render: (item: Equipment) => (
        <StatusBadge status={item.alertLevel} size="sm" />
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Equipment Cost Exposure</h2>
        <p className="text-xs text-slate-500 mt-1">
          Capital asset maintenance costs, historical component replacement expenditure, and fleet reliability risk rankings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Total Fleet Maintenance Spend"
          value={formatCurrency(totalExpenditure, true)}
          comparison="Cumulative overhaul & parts lifecycle"
          trend="up"
          trendPositive={false}
          accent="amber"
          iconName="DollarSign"
        />

        <KpiCard
          title="Total Fleet Downtime"
          value={`${formatNumber(totalDowntimeHours)} hrs`}
          comparison="Across 8 primary mining units"
          trend="up"
          trendPositive={false}
          accent="rose"
          iconName="Clock"
        />

        <KpiCard
          title="Highest Cost Asset"
          value="HT-204"
          comparison={`$3.82M AUD cumulative repair exposure`}
          accent="copper"
          iconName="Truck"
        />
      </div>

      <DataTable
        title="Fleet Cost Exposure & Downtime Ledger"
        subtitle="Click any equipment record to inspect detailed mechanical history, telemetry, and fluid logs"
        data={equipmentList as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        onRowClick={(item) => navigate(`/engineer/equipment/${item.id}`)}
        exportFilename="equipment_cost_exposure"
      />
    </div>
  );
};
