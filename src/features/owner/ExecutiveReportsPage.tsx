import React, { useState } from 'react';
import { exportToCsv } from '@/utils/exportCsv';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import { Printer, Download, FileText, Calendar, Filter } from 'lucide-react';

export const ExecutiveReportsPage: React.FC = () => {
  const [period, setPeriod] = useState('YTD 2026');

  const reportData = [
    { metric: 'Cumulative Gold Produced', value: '38,990 oz Au', target: '37,500 oz Au', variance: '+4.0%' },
    { metric: 'Total Gross Revenue', value: '$142,850,000 AUD', target: '$136,875,000 AUD', variance: '+4.4%' },
    { metric: 'Total Operating Costs (OpEx)', value: '$78,420,000 AUD', target: '$80,000,000 AUD', variance: '-2.0% (Under budget)' },
    { metric: 'Equipment Maintenance Expenditure', value: '$14,860,000 AUD', target: '$13,500,000 AUD', variance: '+10.1% (Heavy truck repairs)' },
    { metric: 'All-In Sustaining Cost (AISC)', value: '$1,684 AUD / oz', target: '$1,750 AUD / oz', variance: '-3.8% (Cost efficiency)' },
    { metric: 'Average Plant Mill Availability', value: '96.2%', target: '92.0%', variance: '+4.2%' },
    { metric: 'Lost Time Injury Free Days', value: '412 Days', target: '365 Days', variance: 'Zero Harm Achieved' },
    { metric: 'Tailings Water Recycling Rate', value: '84.5%', target: '80.0%', variance: '+4.5% (Exceptional)' },
  ];

  const handleExport = () => {
    exportToCsv(`executive_mining_report_${period.replace(/\s+/g, '_')}`, reportData, [
      { key: 'metric', header: 'Operational Performance Metric' },
      { key: 'value', header: 'Actual Value' },
      { key: 'target', header: 'Planned Target' },
      { key: 'variance', header: 'Variance Analysis' },
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and print controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Operational & Financial Report</h2>
          <p className="text-xs text-slate-500 mt-1">
            Official executive digest for the Principal Owner & Board of Directors.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent focus:outline-none font-medium"
            >
              <option value="YTD 2026">YTD 2026 (Jan - Oct)</option>
              <option value="Q3 2026">Q3 2026 (Jul - Sep)</option>
              <option value="Q2 2026">Q2 2026 (Apr - Jun)</option>
            </select>
          </div>

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

      {/* Printable Report Document */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-copper-700 bg-copper-50 px-2 py-0.5 rounded border border-copper-200">
              Confidential Board Disclosure
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-2">
              Red Ridge Gold Project — Operational Performance Summary
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Western Australia Tenement RRG-01 • Reporting Period: {period}
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <span className="block font-semibold text-slate-800">Generated: 18 Oct 2026</span>
            <span className="block">Author: Executive Board Office</span>
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-2">
          <p>
            <strong>Executive Narrative:</strong> During the reporting period, Red Ridge Gold operations achieved cumulative production of <strong>38,990 ounces of gold</strong>, exceeding the initial schedule target by 4.0%. Gross revenue reached $142.85M AUD supported by favorable gold spot prices averaging $3,645 AUD/oz.
          </p>
          <p>
            All-In Sustaining Costs (AISC) remained well-controlled at <strong>$1,684 AUD / oz</strong>, yielding a cash operating margin of $1,961 AUD per ounce. Plant availability across the primary crushing and SAG mill circuits stood at 96.2%, though haulage truck maintenance costs were elevated due to hydraulic overhaul requirements on unit HT-204.
          </p>
        </div>

        {/* Key Metrics Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                <th className="p-3">Performance Metric</th>
                <th className="p-3">Actual Value</th>
                <th className="p-3">Planned Target</th>
                <th className="p-3">Variance / Audit Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((row) => (
                <tr key={row.metric} className="hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-900">{row.metric}</td>
                  <td className="p-3 font-mono font-bold text-slate-800">{row.value}</td>
                  <td className="p-3 font-mono text-slate-600">{row.target}</td>
                  <td className="p-3 font-medium text-copper-700">{row.variance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sign-off footer */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-800 block">Sir Arthur Stirling</span>
            <span>Managing Director & Principal Owner</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-slate-800 block">Marcus Vance, CPEng</span>
            <span>Chief Mechanical & Plant Engineer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
