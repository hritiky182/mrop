import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { Modal } from '@/components/common/Modal';
import { fluidLogRepository } from '@/services/repositories/fluidLogRepository';
import { FluidLog } from '@/types';
import { formatDate } from '@/utils/formatters';
import { Droplet, AlertTriangle, Filter, CheckCircle } from 'lucide-react';

export const FluidLogsPage: React.FC = () => {
  const [fluidLogs, setFluidLogs] = useState<FluidLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [selectedInspection, setSelectedInspection] = useState<FluidLog | null>(null);

  useEffect(() => {
    fluidLogRepository.getAll().then((data) => {
      setFluidLogs(data);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const conditions = ['All', 'Clean / Normal', 'Marginal Degradation', 'Contaminated'];

  const filteredLogs = selectedCondition === 'All'
    ? fluidLogs
    : fluidLogs.filter((f) => f.condition === selectedCondition);

  const columns = [
    {
      key: 'equipmentId',
      header: 'Equipment',
      render: (item: FluidLog) => (
        <div>
          <span className="font-mono font-bold text-copper-700 block">{item.equipmentId}</span>
          <span className="text-[11px] text-slate-500 truncate block max-w-[130px]">
            {item.equipmentName}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'fluidType',
      header: 'Fluid Type',
      render: (item: FluidLog) => (
        <span className="text-xs font-semibold text-slate-800">{item.fluidType}</span>
      ),
      sortable: true,
    },
    {
      key: 'fluidLevelPercentage',
      header: 'Fluid Level',
      render: (item: FluidLog) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                item.fluidLevelPercentage < 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${item.fluidLevelPercentage}%` }}
            />
          </div>
          <span className="font-mono text-slate-700 font-medium">{item.fluidLevelPercentage}%</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'condition',
      header: 'Fluid Condition',
      render: (item: FluidLog) => <StatusBadge status={item.condition} size="sm" />,
      sortable: true,
    },
    {
      key: 'temperatureCelsius',
      header: 'Temp (°C)',
      render: (item: FluidLog) => (
        <span
          className={`font-mono font-bold ${
            item.temperatureCelsius > 100 ? 'text-rose-700' : 'text-slate-800'
          }`}
        >
          {item.temperatureCelsius} °C
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'pressureKpa',
      header: 'Pressure (kPa)',
      render: (item: FluidLog) => (
        <span
          className={`font-mono font-medium ${
            item.pressureKpa < 350 ? 'text-amber-700 font-bold' : 'text-slate-800'
          }`}
        >
          {item.pressureKpa} kPa
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'lastInspectionDate',
      header: 'Inspection Date',
      render: (item: FluidLog) => (
        <span className="font-mono text-slate-600 text-xs">
          {formatDate(item.lastInspectionDate, 'dd MMM')}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'inspectionStatus',
      header: 'Inspection Status',
      render: (item: FluidLog) => <StatusBadge status={item.inspectionStatus} size="sm" />,
      sortable: true,
    },
    {
      key: 'technician',
      header: 'Technician',
      render: (item: FluidLog) => (
        <span className="text-slate-600 text-xs truncate block max-w-[140px]">
          {item.technician}
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fluid Diagnostics & Lubrication Logs</h2>
        <p className="text-xs text-slate-500 mt-1">
          Spectrometric oil analysis, hydraulic viscosity monitoring, thermal duty tracking, and wear particle alerts.
        </p>
      </div>

      <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2">
        <Droplet className="w-4 h-4 text-copper-600 shrink-0" />
        <span>
          <strong>Notice:</strong> Illustrative fluid diagnostic logs for demonstration purposes. These records simulate lab spectrometry and telemetry diagnostics.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Monitored Fluid Reservoirs"
          value={fluidLogs.length}
          comparison="Hydraulics, Engine Oils, Coolants"
          accent="navy"
          iconName="Droplet"
        />

        <KpiCard
          title="Optimal / Normal Condition"
          value={fluidLogs.filter((f) => f.condition === 'Clean / Normal').length}
          comparison="Within OEM viscosity standards"
          accent="emerald"
          iconName="CheckCircle"
        />

        <KpiCard
          title="Marginal Degradation"
          value={fluidLogs.filter((f) => f.condition === 'Marginal Degradation').length}
          comparison="Scheduled for filter swap"
          accent="amber"
          iconName="AlertTriangle"
        />

        <KpiCard
          title="Severe Contamination Alert"
          value={fluidLogs.filter((f) => f.condition === 'Contaminated').length}
          comparison="HT-204 Hydraulic Fluid"
          accent="rose"
          iconName="AlertTriangle"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm text-xs">
        <span className="font-semibold text-slate-500 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Condition Filter:
        </span>
        {conditions.map((cond) => (
          <button
            key={cond}
            onClick={() => setSelectedCondition(cond)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedCondition === cond
                ? 'bg-copper-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cond}
          </button>
        ))}
      </div>

      {/* DataTable */}
      <DataTable
        title="Fluid Inspection Ledger"
        subtitle="Click any record to inspect particulate lab notes, sensor logs, and corrective actions"
        data={filteredLogs as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        onRowClick={(item) => setSelectedInspection(item as unknown as FluidLog)}
        exportFilename="fluid_diagnostics_ledger"
      />

      {/* Inspection Detail Modal */}
      {selectedInspection && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInspection(null)}
          title={`Fluid Inspection: ${selectedInspection.equipmentId} — ${selectedInspection.fluidType}`}
          description={`Logged by ${selectedInspection.technician} on ${formatDate(selectedInspection.lastInspectionDate)}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Condition</span>
                <StatusBadge status={selectedInspection.condition} size="sm" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Status</span>
                <StatusBadge status={selectedInspection.inspectionStatus} size="sm" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Operating Temp</span>
                <span className="font-mono font-bold text-slate-800">{selectedInspection.temperatureCelsius} °C</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Line Pressure</span>
                <span className="font-mono font-bold text-slate-800">{selectedInspection.pressureKpa} kPa</span>
              </div>
            </div>

            {selectedInspection.recordedAbnormality ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                <span className="font-bold text-[11px] block mb-1">Recorded Abnormality & Wear Particle Scan:</span>
                <p className="leading-relaxed">{selectedInspection.recordedAbnormality}</p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                <span className="font-bold text-[11px] block">No Abnormalities Detected:</span>
                <p className="mt-1">ISO 4406 cleanliness rating meets manufacturer specifications. Next scheduled sampling due in 14 days.</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedInspection(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
