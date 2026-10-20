import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { equipmentRepository } from '@/services/repositories/equipmentRepository';
import { maintenanceRepository } from '@/services/repositories/maintenanceRepository';
import { fluidLogRepository } from '@/services/repositories/fluidLogRepository';
import { inventoryRepository } from '@/services/repositories/inventoryRepository';
import { Equipment, WorkOrder, FluidLog, SparePart } from '@/types';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { useNotifications } from '@/context/NotificationContext';
import { formatCurrency, formatNumber, formatDate, formatPercent } from '@/utils/formatters';
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
import {
  Truck,
  ArrowLeft,
  Wrench,
  Clock,
  Thermometer,
  Gauge,
  Droplet,
  Fuel,
  Package,
  Activity,
  AlertTriangle,
} from 'lucide-react';

export const EquipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [fluidLogs, setFluidLogs] = useState<FluidLog[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadEquipmentData(id);
  }, [id]);

  const loadEquipmentData = async (equipmentId: string) => {
    try {
      const eq = await equipmentRepository.getById(equipmentId);
      if (!eq) {
        navigate('/engineer/equipment');
        return;
      }
      const [orders, fluids, allParts] = await Promise.all([
        maintenanceRepository.getByEquipmentId(equipmentId),
        fluidLogRepository.getByEquipmentId(equipmentId),
        inventoryRepository.getAll(),
      ]);

      setEquipment(eq);
      setWorkOrders(orders);
      setFluidLogs(fluids);
      // Filter parts compatible with this equipment
      setSpareParts(
        allParts.filter((p) =>
          p.compatibleEquipment.some(
            (c) => c.toLowerCase() === equipmentId.toLowerCase()
          )
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Equipment['status']) => {
    if (!equipment) return;
    try {
      const updated = await equipmentRepository.update(equipment.id, {
        status: newStatus,
      });
      setEquipment(updated);
      showToast('Asset Status Updated', `${equipment.name} status updated to ${newStatus}.`, 'info');
    } catch {
      showToast('Error', 'Failed to update equipment status.', 'error');
    }
  };

  if (loading || !equipment) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
        Loading technical diagnostic asset logs...
      </div>
    );
  }

  // Monthly telemetry uptime breakdown (deterministic mock)
  const monthlyTelemetry = [
    { month: 'Jun', uptimeHours: 620, downtimeHours: 42 },
    { month: 'Jul', uptimeHours: 645, downtimeHours: 35 },
    { month: 'Aug', uptimeHours: 610, downtimeHours: 58 },
    { month: 'Sep', uptimeHours: 630, downtimeHours: 45 },
    { month: 'Oct (MTD)', uptimeHours: 340, downtimeHours: equipment.status === 'Fault Detected' ? 68 : 14 },
  ];

  const workOrderColumns = [
    {
      key: 'id',
      header: 'Work Order ID',
      render: (wo: WorkOrder) => (
        <span className="font-mono font-bold text-copper-700">{wo.id}</span>
      ),
    },
    {
      key: 'title',
      header: 'Task & Description',
      render: (wo: WorkOrder) => (
        <div>
          <span className="font-semibold text-slate-900 block">{wo.title}</span>
          <span className="text-[11px] text-slate-500 line-clamp-1">{wo.description}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (wo: WorkOrder) => <span className="text-xs font-medium">{wo.type}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (wo: WorkOrder) => <StatusBadge status={wo.priority} size="sm" />,
    },
    {
      key: 'assignedTechnician',
      header: 'Assigned Technician',
      render: (wo: WorkOrder) => <span className="text-slate-700">{wo.assignedTechnician}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (wo: WorkOrder) => <StatusBadge status={wo.status} size="sm" />,
    },
    {
      key: 'estimatedCostAud',
      header: 'Est. Cost',
      render: (wo: WorkOrder) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(wo.estimatedCostAud)}
        </span>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/engineer/equipment')}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
            title="Return to fleet"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-copper-700 bg-copper-50 px-2 py-0.5 rounded border border-copper-200">
                {equipment.id}
              </span>
              <StatusBadge status={equipment.status} />
              <StatusBadge status={equipment.alertLevel} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              {equipment.name}
            </h2>
          </div>
        </div>

        {/* Quick status change trigger */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-xs">
          <span className="font-medium text-slate-600">Quick Change Status:</span>
          <select
            value={equipment.status}
            onChange={(e) => handleStatusChange(e.target.value as Equipment['status'])}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-copper-500"
          >
            <option value="Operational">Operational</option>
            <option value="Idle">Idle</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Fault Detected">Fault Detected</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Asset Specifications Strip */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-card grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Model</span>
          <span className="font-semibold text-slate-800">{equipment.model}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Serial Number</span>
          <span className="font-mono text-slate-800">{equipment.serialNumber}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Category</span>
          <span className="font-semibold text-slate-800">{equipment.category}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Location</span>
          <span className="font-semibold text-slate-800">{equipment.location}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Assigned Operator</span>
          <span className="font-semibold text-slate-800">{equipment.assignedOperator}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Health Score</span>
          <span className="font-mono font-bold text-copper-700">{equipment.healthScore} / 100</span>
        </div>
      </div>

      {/* Telemetry Sensor Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Availability Rate"
          value={formatPercent(equipment.availabilityRate, 1)}
          comparison="Plant uptime duty factor"
          trend="up"
          accent="emerald"
          iconName="Activity"
        />

        <KpiCard
          title="Engine Oil Pressure"
          value={`${equipment.oilPressureKpa}`}
          unit="kPa"
          comparison={equipment.oilPressureKpa < 350 ? 'Warning: Low Line Pressure' : 'Normal Operating Pressure'}
          accent={equipment.oilPressureKpa < 350 ? 'rose' : 'navy'}
          iconName="Gauge"
          statusBadge={
            <StatusBadge
              status={equipment.oilPressureKpa < 350 ? 'Low Pressure' : 'Normal'}
              size="sm"
            />
          }
        />

        <KpiCard
          title="Coolant / Engine Temp"
          value={`${equipment.engineTempC} °C`}
          comparison={equipment.engineTempC > 100 ? 'High Thermal Alarm' : 'Nominal Temperature'}
          accent={equipment.engineTempC > 100 ? 'rose' : 'copper'}
          iconName="Thermometer"
          statusBadge={
            <StatusBadge
              status={equipment.engineTempC > 100 ? 'Overheating' : 'Normal'}
              size="sm"
            />
          }
        />

        <KpiCard
          title="Fuel Burn Rate"
          value={equipment.fuelBurnRateLph > 0 ? `${equipment.fuelBurnRateLph} L/h` : 'Grid Electric'}
          comparison="Telemetry CAN-bus sensor"
          accent="default"
          iconName="Fuel"
        />
      </div>

      {/* Operating Hours and Uptime / Downtime Chart */}
      <ChartCard
        title="Monthly Operating Uptime vs Downtime (Hours)"
        subtitle="Recent 5-month operational availability history"
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTelemetry} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit=" h" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                formatter={(val: any) => [`${val} hours`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="uptimeHours" name="Uptime (Hours)" fill="#16805D" radius={[4, 4, 0, 0]} />
              <Bar dataKey="downtimeHours" name="Downtime (Hours)" fill="#C74646" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Maintenance Work Orders for this asset */}
      <DataTable
        title={`Maintenance History (${workOrders.length} Work Orders)`}
        subtitle={`Scheduled and corrective maintenance logged for ${equipment.id}`}
        data={workOrders as unknown as Record<string, unknown>[]}
        columns={workOrderColumns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        exportFilename={`${equipment.id}_maintenance_history`}
      />

      {/* Related Fluid Logs & Compatible Spare Parts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fluid Logs */}
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-semibold text-slate-900">Fluid Logs for {equipment.id}</h3>
            </div>
            <span className="text-xs text-slate-400">{fluidLogs.length} Records</span>
          </div>

          {fluidLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No fluid log inspections recorded.</p>
          ) : (
            <div className="space-y-3">
              {fluidLogs.map((fl) => (
                <div key={fl.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{fl.fluidType}</span>
                    <StatusBadge status={fl.inspectionStatus} size="sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] text-slate-600">
                    <div>Level: <span className="font-mono font-bold text-slate-800">{fl.fluidLevelPercentage}%</span></div>
                    <div>Temp: <span className="font-mono font-bold text-slate-800">{fl.temperatureCelsius}°C</span></div>
                    <div>Pressure: <span className="font-mono font-bold text-slate-800">{fl.pressureKpa} kPa</span></div>
                  </div>
                  {fl.recordedAbnormality && (
                    <p className="mt-2 text-[11px] text-rose-700 bg-rose-50 p-2 rounded border border-rose-100">
                      ⚠️ {fl.recordedAbnormality}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compatible Spare Parts Requirements */}
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-copper-600" />
              <h3 className="text-sm font-semibold text-slate-900">Required Spare Parts Inventory</h3>
            </div>
            <span className="text-xs text-slate-400">{spareParts.length} Parts</span>
          </div>

          {spareParts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No dedicated spare parts mapped.</p>
          ) : (
            <div className="space-y-3">
              {spareParts.map((sp) => (
                <div key={sp.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 block">{sp.partNumber}</span>
                    <span className="text-[11px] text-slate-600 block">{sp.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{sp.storageLocation}</span>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      <span className="font-mono font-bold text-slate-800 block">
                        Qty: {sp.availableQuantity} / Min: {sp.minimumStockLevel}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatCurrency(sp.unitCostAud)}
                      </span>
                    </div>
                    <StatusBadge status={sp.stockStatus || 'In Stock'} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
