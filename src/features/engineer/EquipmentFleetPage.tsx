import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { equipmentRepository } from '@/services/repositories/equipmentRepository';
import { Equipment, EquipmentCategory, EquipmentStatus } from '@/types';
import { formatNumber, formatPercent } from '@/utils/formatters';
import { Truck, Filter, Activity, Clock, ShieldAlert } from 'lucide-react';

export const EquipmentFleetPage: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const navigate = useNavigate();

  useEffect(() => {
    equipmentRepository.getAll().then((data) => {
      setEquipmentList(data);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const categories = [
    'All',
    'Excavators',
    'Haul Trucks',
    'Crushers',
    'Conveyors',
    'Drill Rigs',
    'Loaders',
    'Pumps',
    'Processing Mills',
  ];

  const statuses = [
    'All',
    'Operational',
    'Idle',
    'Under Maintenance',
    'Fault Detected',
    'Offline',
  ];

  const filtered = equipmentList.filter((eq) => {
    const matchesCat = selectedCategory === 'All' || eq.category === selectedCategory;
    const matchesStat = selectedStatus === 'All' || eq.status === selectedStatus;
    return matchesCat && matchesStat;
  });

  const columns = [
    {
      key: 'id',
      header: 'Equipment ID',
      render: (item: Equipment) => (
        <span className="font-bold font-mono text-copper-700">{item.id}</span>
      ),
      sortable: true,
    },
    {
      key: 'name',
      header: 'Asset Name & Model',
      render: (item: Equipment) => (
        <div>
          <span className="font-semibold text-slate-900 block">{item.name}</span>
          <span className="text-[11px] text-slate-500 font-mono">{item.model}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: Equipment) => (
        <span className="text-xs text-slate-700 font-medium">{item.category}</span>
      ),
      sortable: true,
    },
    {
      key: 'location',
      header: 'Pit / Plant Location',
      render: (item: Equipment) => (
        <span className="text-slate-600 font-medium">{item.location}</span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Operational Status',
      render: (item: Equipment) => <StatusBadge status={item.status} size="sm" />,
      sortable: true,
    },
    {
      key: 'availabilityRate',
      header: 'Availability',
      render: (item: Equipment) => (
        <span className="font-mono font-medium text-slate-800">
          {item.availabilityRate.toFixed(1)}%
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'utilizationRate',
      header: 'Utilization',
      render: (item: Equipment) => (
        <span className="font-mono font-medium text-slate-800">
          {item.utilizationRate.toFixed(1)}%
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'operatingHours',
      header: 'Operating Hours',
      render: (item: Equipment) => (
        <span className="font-mono text-slate-600">
          {formatNumber(item.operatingHours)} hrs
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'alertLevel',
      header: 'Alert Level',
      render: (item: Equipment) => <StatusBadge status={item.alertLevel} size="sm" />,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Mechanical & Plant Equipment Fleet</h2>
        <p className="text-xs text-slate-500 mt-1">
          Master registry of open pit mobile haulage, blast hole drill rigs, crushing systems, and grinding mills.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Fleet Size"
          value={equipmentList.length}
          unit="Heavy Assets"
          comparison="8 Active Units In Service"
          accent="navy"
          iconName="Truck"
        />

        <KpiCard
          title="Operational Rate"
          value={formatPercent(
            (equipmentList.filter((e) => e.status === 'Operational').length / equipmentList.length) * 100,
            1
          )}
          comparison={`${equipmentList.filter((e) => e.status === 'Operational').length} Units In Production`}
          accent="emerald"
          iconName="Activity"
        />

        <KpiCard
          title="Down / In Maintenance"
          value={equipmentList.filter((e) => e.status === 'Under Maintenance' || e.status === 'Fault Detected').length}
          unit="Units"
          comparison="HT-204 & CV-110"
          accent="rose"
          iconName="Clock"
        />

        <KpiCard
          title="Fleet Health Index"
          value="87/100"
          comparison="SCADA Telemetry Diagnostic Score"
          accent="copper"
          iconName="ShieldAlert"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-copper-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-copper-500"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Equipment Table */}
      <DataTable
        title="Fleet Assets Directory"
        subtitle="Click any row to open detailed diagnostic engineering telemetry, maintenance history, and fluid logs"
        data={filtered as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        onRowClick={(item) => navigate(`/engineer/equipment/${item.id}`)}
        exportFilename="equipment_fleet_roster"
      />
    </div>
  );
};
