import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { equipmentRepository } from '@/services/repositories/equipmentRepository';
import { maintenanceRepository } from '@/services/repositories/maintenanceRepository';
import { inventoryRepository } from '@/services/repositories/inventoryRepository';
import { fluidLogRepository } from '@/services/repositories/fluidLogRepository';
import { Equipment, WorkOrder, SparePart, FluidLog } from '@/types';
import { formatNumber, formatPercent } from '@/utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  Wrench,
  Clock,
  AlertTriangle,
  Package,
  Droplet,
  Truck,
  ArrowRight,
  Plus,
} from 'lucide-react';

export const EngineerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [fluidLogs, setFluidLogs] = useState<FluidLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      equipmentRepository.getAll(),
      maintenanceRepository.getAll(),
      inventoryRepository.getAll(),
      fluidLogRepository.getAll(),
    ]).then(([eq, wo, sp, fl]) => {
      setEquipmentList(eq);
      setWorkOrders(wo);
      setSpareParts(sp);
      setFluidLogs(fl);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  // Compute Engineer KPIs
  const avgAvailability =
    equipmentList.reduce((acc, eq) => acc + eq.availabilityRate, 0) / (equipmentList.length || 1);
  const avgUtilization =
    equipmentList.reduce((acc, eq) => acc + eq.utilizationRate, 0) / (equipmentList.length || 1);
  const totalDowntimeHours = equipmentList.reduce((acc, eq) => acc + eq.downtimeHoursTotal, 0);

  const activeAlerts = equipmentList.filter((e) => e.alertLevel !== 'Normal');
  const scheduledTasks = workOrders.filter((w) => w.status === 'Scheduled');
  const openWorkOrders = workOrders.filter((w) => w.status !== 'Completed');
  const criticalPartsShortage = spareParts.filter((p) => p.stockStatus === 'Out of Stock');
  const lowStockParts = spareParts.filter((p) => p.stockStatus === 'Low Stock');

  // Chart data: Availability vs Utilization by equipment
  const fleetPerformanceChartData = equipmentList.map((eq) => ({
    name: eq.id,
    availability: eq.availabilityRate,
    utilization: eq.utilizationRate,
  }));

  // Chart data: Work Orders by status
  const ordersByStatus = [
    { status: 'Open', count: workOrders.filter((w) => w.status === 'Open').length, fill: '#3578B8' },
    { status: 'In Progress', count: workOrders.filter((w) => w.status === 'In Progress').length, fill: '#D99A22' },
    { status: 'Scheduled', count: workOrders.filter((w) => w.status === 'Scheduled').length, fill: '#14283F' },
    { status: 'Completed', count: workOrders.filter((w) => w.status === 'Completed').length, fill: '#16805D' },
    { status: 'On Hold', count: workOrders.filter((w) => w.status === 'On Hold').length, fill: '#C74646' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#14283F] text-white p-6 rounded-xl border border-slate-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-copper-500 text-white rounded uppercase tracking-wider">
              Mechanical & Plant Level
            </span>
            <span className="text-xs text-slate-300">SCADA Integrated Asset Monitoring</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Fleet Reliability & Processing Plant Control
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Live technical monitoring of haul trucks, excavators, gyratory crushers, and SAG mill circuits. Manage work orders, fluid diagnostics, and spare parts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/engineer/maintenance')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-copper-600 hover:bg-copper-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Work Order</span>
          </button>
          <button
            onClick={() => navigate('/engineer/inventory')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <Package className="w-4 h-4" />
            <span>Spare Parts ({criticalPartsShortage.length} Alert)</span>
          </button>
        </div>
      </div>

      {/* 8 Primary Engineer KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Overall Equipment Availability"
          value={formatPercent(avgAvailability, 1)}
          comparison="Target: 90.0% Fleet Availability"
          trend={avgAvailability >= 90 ? 'up' : 'down'}
          accent="emerald"
          iconName="Activity"
          statusBadge={<StatusBadge status={avgAvailability >= 90 ? 'Optimal' : 'Action Req'} size="sm" />}
        />

        <KpiCard
          title="Equipment Utilization"
          value={formatPercent(avgUtilization, 1)}
          comparison="Operational Run Hours / Calendar Hours"
          trend="up"
          accent="copper"
          iconName="Clock"
        />

        <KpiCard
          title="Total Downtime Hours"
          value={`${formatNumber(totalDowntimeHours)} hrs`}
          comparison="Highest: HT-204 (680 hrs)"
          trend="up"
          trendPositive={false}
          accent="rose"
          iconName="Clock"
        />

        <KpiCard
          title="Active Equipment Alerts"
          value={activeAlerts.length}
          comparison="1 Critical (HT-204 Steering)"
          trend="up"
          trendPositive={false}
          accent="rose"
          iconName="AlertTriangle"
          statusBadge={<StatusBadge status="Critical: HT-204" variant="critical" size="sm" />}
        />

        <KpiCard
          title="Scheduled Maintenance Tasks"
          value={scheduledTasks.length}
          comparison="Next 7 Days Window"
          accent="navy"
          iconName="Wrench"
        />

        <KpiCard
          title="Overdue / At-Risk Maintenance"
          value="1"
          unit="Task"
          comparison="WO-8810 Awaiting Parts"
          trend="up"
          trendPositive={false}
          accent="amber"
          iconName="Clock"
          statusBadge={<StatusBadge status="Parts Pending" variant="warning" size="sm" />}
        />

        <KpiCard
          title="Open Work Orders"
          value={openWorkOrders.length}
          unit="Active"
          comparison="2 In Progress, 4 Scheduled"
          accent="default"
          iconName="Wrench"
        />

        <KpiCard
          title="Critical Spare Parts Shortages"
          value={criticalPartsShortage.length}
          unit="Parts"
          comparison={`${lowStockParts.length} Additional Low Stock Items`}
          trend="up"
          trendPositive={false}
          accent="rose"
          iconName="Package"
          statusBadge={<StatusBadge status="Stockout: 2 Items" variant="critical" size="sm" />}
        />
      </div>

      {/* Fleet Utilization & Maintenance Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Availability vs Utilization Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Equipment Availability & Utilization Rate (%)"
            subtitle="Benchmark across 8 primary mining and processing assets"
            actions={
              <button
                onClick={() => navigate('/engineer/uptime')}
                className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
              >
                <span>Uptime Deep Dive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fleetPerformanceChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    formatter={(val: any) => [`${Number(val).toFixed(1)}%`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="availability" name="Availability (%)" fill="#16805D" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="utilization" name="Utilization (%)" fill="#14283F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Work Orders by Status Donut */}
        <div>
          <ChartCard
            title="Work Orders by Status"
            subtitle="Current maintenance pipeline"
            actions={
              <button
                onClick={() => navigate('/engineer/maintenance')}
                className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {ordersByStatus.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-2 w-full mt-2 text-[11px]">
                {ordersByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                      <span className="truncate">{item.status}</span>
                    </span>
                    <span className="font-semibold text-slate-800 font-mono">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Fleet Overview Quick Table */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Equipment Fleet Quick Roster</h3>
            <p className="text-xs text-slate-500">Live operational status, telemetry alerts, and current assigned operators</p>
          </div>
          <button
            onClick={() => navigate('/engineer/equipment')}
            className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
          >
            <span>Full Fleet Directory ({equipmentList.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                <th className="pb-2 font-semibold">Equipment ID</th>
                <th className="pb-2 font-semibold">Name & Category</th>
                <th className="pb-2 font-semibold">Location</th>
                <th className="pb-2 font-semibold">Operational Status</th>
                <th className="pb-2 font-semibold text-right">Availability</th>
                <th className="pb-2 font-semibold text-right">Utilization</th>
                <th className="pb-2 font-semibold">Telemetry Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipmentList.map((eq) => (
                <tr
                  key={eq.id}
                  onClick={() => navigate(`/engineer/equipment/${eq.id}`)}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <td className="py-2.5 font-bold font-mono text-copper-700">{eq.id}</td>
                  <td className="py-2.5">
                    <span className="font-semibold text-slate-900 block">{eq.name}</span>
                    <span className="text-[11px] text-slate-400">{eq.category}</span>
                  </td>
                  <td className="py-2.5 text-slate-600">{eq.location}</td>
                  <td className="py-2.5">
                    <StatusBadge status={eq.status} size="sm" />
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-800">
                    {eq.availabilityRate.toFixed(1)}%
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-800">
                    {eq.utilizationRate.toFixed(1)}%
                  </td>
                  <td className="py-2.5">
                    <StatusBadge status={eq.alertLevel} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fluid Inspections & Critical Parts Alerts Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Abnormal Fluid Warnings */}
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-semibold text-slate-900">Fluid Diagnostics & Anomalies</h3>
            </div>
            <button
              onClick={() => navigate('/engineer/fluids')}
              className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
            >
              <span>View Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {fluidLogs
              .filter((fl) => fl.inspectionStatus !== 'Passed')
              .map((fl) => (
                <div
                  key={fl.id}
                  onClick={() => navigate('/engineer/fluids')}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{fl.equipmentId}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{fl.fluidType}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                        {fl.recordedAbnormality}
                      </p>
                    </div>
                    <StatusBadge status={fl.inspectionStatus} size="sm" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Low & Out of Stock Inventory Alert */}
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-semibold text-slate-900">Warehouse Stockout Alerts</h3>
            </div>
            <button
              onClick={() => navigate('/engineer/inventory')}
              className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
            >
              <span>Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {spareParts
              .filter((p) => p.stockStatus !== 'In Stock')
              .slice(0, 4)
              .map((part) => (
                <div
                  key={part.id}
                  onClick={() => navigate('/engineer/inventory')}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900 block">
                        {part.partNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                        {part.name}
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-800">
                        Qty: {part.availableQuantity} / Min: {part.minimumStockLevel}
                      </span>
                      <StatusBadge status={part.stockStatus || 'Low Stock'} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
