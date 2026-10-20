import React, { useState } from 'react';
import { exportToCsv } from '@/utils/exportCsv';
import { formatDate } from '@/utils/formatters';
import { Printer, Download, Calendar, Wrench, Activity } from 'lucide-react';

export const EngineeringReportsPage: React.FC = () => {
  const [shift, setShift] = useState(`Shift Handover: Day Shift ${formatDate(new Date(), 'dd MMM yyyy')}`);

  const maintenanceLog = [
    { asset: 'HT-204', category: 'Haul Trucks', type: 'Emergency', technician: 'Steve Kowalski', status: 'In Progress (Hydraulic flush & seal replacement)' },
    { asset: 'CV-110', category: 'Conveyors', type: 'Preventative', technician: 'Wayne Campbell', status: 'In Progress (5,000h Pulley relagging, 70% complete)' },
    { asset: 'EX-101', category: 'Excavators', type: 'Inspection', technician: 'Tanya Morales', status: 'Scheduled (NDT boom ultrasound 22 Oct)' },
    { asset: 'CR-301', category: 'Crushers', type: 'Preventative', technician: 'Wayne Campbell', status: 'Scheduled (Lube filter pack swap 25 Oct)' },
    { asset: 'LD-105', category: 'Loaders', type: 'Preventative', technician: 'Steve Kowalski', status: 'Completed (250h Full service completed 11 Oct)' },
    { asset: 'PM-501', category: 'Processing Mills', type: 'Inspection', technician: 'Dr. Liam Patel', status: 'Scheduled (Trunnion spectral vibration check)' },
  ];

  const handleExport = () => {
    exportToCsv('engineering_shift_handover_report', maintenanceLog, [
      { key: 'asset', header: 'Asset ID' },
      { key: 'category', header: 'Asset Category' },
      { key: 'type', header: 'Maintenance Type' },
      { key: 'technician', header: 'Lead Technician' },
      { key: 'status', header: 'Work Order Status & Handover Notes' },
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Engineering Plant & Fleet Maintenance Report</h2>
          <p className="text-xs text-slate-500 mt-1">
            Technical shift handover log, component wear observations, and reliability indicators.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-navy-800 hover:bg-navy-900 rounded-lg shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Log</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-800 bg-navy-50 px-2 py-0.5 rounded border border-navy-200">
              Shift Maintenance Handover
            </span>
            <h1 className="text-lg font-bold text-slate-900 mt-2">
              Red Ridge Mine Maintenance & Plant Operations Log
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{shift}</p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <span className="block font-semibold text-slate-800">Lead: Marcus Vance, CPEng</span>
            <span>Chief Mechanical Engineer</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Fleet Availability</span>
            <span className="text-sm font-bold font-mono text-emerald-700">89.2%</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Bays Occupied</span>
            <span className="text-sm font-bold font-mono text-amber-700">2 / 4 Heavy Bays</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Critical Stockouts</span>
            <span className="text-sm font-bold font-mono text-rose-700">2 SKUs</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                <th className="p-3">Asset</th>
                <th className="p-3">Category</th>
                <th className="p-3">Type</th>
                <th className="p-3">Technician</th>
                <th className="p-3">Status / Technical Handover Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {maintenanceLog.map((row) => (
                <tr key={row.asset} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold text-copper-700">{row.asset}</td>
                  <td className="p-3 text-slate-600">{row.category}</td>
                  <td className="p-3 font-medium text-slate-800">{row.type}</td>
                  <td className="p-3 text-slate-700">{row.technician}</td>
                  <td className="p-3 text-slate-800">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
