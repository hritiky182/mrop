import React, { useState } from 'react';
import { exportToCsv } from '@/utils/exportCsv';
import { Printer, Download, BookOpen } from 'lucide-react';

export const GeologicalReportsPage: React.FC = () => {
  const [period, setPeriod] = useState('October 2026 Monthly Reconciliation');

  const geologicalData = [
    { zone: 'North Pit Footwall', plannedTonnes: '185,000 t', actualTonnes: '183,200 t', plannedGrade: '3.38 g/t', actualGrade: '3.25 g/t', dilution: '7.0%', status: 'Compliant' },
    { zone: 'Stage 2 South Cutback', plannedTonnes: '305,000 t', actualTonnes: '298,900 t', plannedGrade: '3.05 g/t', actualGrade: '2.95 g/t', dilution: '9.6%', status: 'Dilution Alert' },
    { zone: 'Main Cutback Central', plannedTonnes: '291,000 t', actualTonnes: '287,500 t', plannedGrade: '2.72 g/t', actualGrade: '2.56 g/t', dilution: '7.7%', status: 'Compliant' },
  ];

  const handleExport = () => {
    exportToCsv('geological_reconciliation_report', geologicalData, [
      { key: 'zone', header: 'Mining Zone' },
      { key: 'plannedTonnes', header: 'Planned Tonnage' },
      { key: 'actualTonnes', header: 'Actual Milled Tonnage' },
      { key: 'plannedGrade', header: 'Planned Head Grade (g/t)' },
      { key: 'actualGrade', header: 'Actual Fire Assay Grade (g/t)' },
      { key: 'dilution', header: 'Dilution %' },
      { key: 'status', header: 'Compliance Status' },
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Geological Grade & Resource Reconciliation Report</h2>
          <p className="text-xs text-slate-500 mt-1">
            JORC (2012) compliant ore grade reconciliation and mineral resource estimation report.
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
            <span>Print Report</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Technical Resource Report
            </span>
            <h1 className="text-lg font-bold text-slate-900 mt-2">
              Red Ridge Mining — Geological Reconciliation Statement
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{period}</p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <span className="block font-semibold text-slate-800">Dr. Elena Rostova, FAusIMM</span>
            <span>Chief Mining Geologist</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                <th className="p-3">Sector</th>
                <th className="p-3">Planned Tonnage</th>
                <th className="p-3">Actual Milled</th>
                <th className="p-3">Planned Grade</th>
                <th className="p-3">Assayed Grade</th>
                <th className="p-3">Dilution</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {geologicalData.map((row) => (
                <tr key={row.zone} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-900">{row.zone}</td>
                  <td className="p-3 font-mono text-slate-700">{row.plannedTonnes}</td>
                  <td className="p-3 font-mono text-slate-900 font-bold">{row.actualTonnes}</td>
                  <td className="p-3 font-mono text-slate-600">{row.plannedGrade}</td>
                  <td className="p-3 font-mono text-copper-700 font-bold">{row.actualGrade}</td>
                  <td className="p-3 font-mono text-slate-800">{row.dilution}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-800">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
