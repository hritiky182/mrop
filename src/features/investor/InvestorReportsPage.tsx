import React, { useState } from 'react';
import { exportToCsv } from '@/utils/exportCsv';
import { Printer, Download, Calendar, FileText } from 'lucide-react';

export const InvestorReportsPage: React.FC = () => {
  const [period, setPeriod] = useState('Q3 2026 Quarterly Performance Disclosure');

  const disclosureData = [
    { metric: 'Commercial Gold Production', q3Actual: '19,920 oz Au', q3Plan: '19,000 oz Au', ytdActual: '38,990 oz Au', variance: '+4.8%' },
    { metric: 'Gross Bullion Revenue', q3Actual: '$72,608,450 AUD', q3Plan: '$69,350,000 AUD', ytdActual: '$142,850,000 AUD', variance: '+4.7%' },
    { metric: 'All-In Sustaining Cost (AISC)', q3Actual: '$1,684 AUD / oz', q3Plan: '$1,750 AUD / oz', ytdActual: '$1,684 AUD / oz', variance: '-3.8% (Cost control)' },
    { metric: 'Operating Cash Flow', q3Actual: '$37,208,450 AUD', q3Plan: '$35,000,000 AUD', ytdActual: '$64,430,000 AUD', variance: '+6.3%' },
    { metric: 'Ore Processed in CIP Mill', q3Actual: '643,000 Tonnes', q3Plan: '625,000 Tonnes', ytdActual: '1,173,000 Tonnes', variance: '+2.9%' },
    { metric: 'Lost Time Injury Free Days', q3Actual: '92 Days', q3Plan: '92 Days', ytdActual: '412 Days', variance: 'Zero Lost Time' },
    { metric: 'Tailings Water Recycling Rate', q3Actual: '84.5%', q3Plan: '80.0%', ytdActual: '84.5%', variance: '+4.5% Above GISTM' },
  ];

  const handleExport = () => {
    exportToCsv('investor_quarterly_disclosure', disclosureData, [
      { key: 'metric', header: 'Key Operational & Financial Indicator' },
      { key: 'q3Actual', header: 'Q3 Actual' },
      { key: 'q3Plan', header: 'Q3 Budget / Forecast' },
      { key: 'ytdActual', header: 'YTD Cumulative' },
      { key: 'variance', header: 'Variance Commentary' },
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Investor & Governance Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Formal macro production and financial disclosures for equity holders, debt financiers, and analysts.
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
              <option value="Q3 2026 Quarterly Performance Disclosure">Q3 2026 Disclosure</option>
              <option value="Q2 2026 Quarterly Performance Disclosure">Q2 2026 Disclosure</option>
              <option value="H1 2026 Half-Year Financial Report">H1 2026 Interim Report</option>
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
            <span>Print Disclosure</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Institutional Investor Briefing
            </span>
            <h1 className="text-lg font-bold text-slate-900 mt-2">
              Red Ridge Gold Project — Macro Performance Disclosure
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{period}</p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <span className="block font-semibold text-slate-800">Portfolio Director: Claire Beauchamp</span>
            <span>Aurum Resource Capital Governance Committee</span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-2">
          <p>
            <strong>Investor Digest:</strong> The Red Ridge Gold Project achieved steady-state commercial throughput during the period, pouring <strong>19,920 ounces of gold</strong> in Q3. YTD gold output reached 38,990 oz, representing a 4.8% outperformance against the feasibility ramp-up profile.
          </p>
          <p>
            All-In Sustaining Costs averaged <strong>$1,684 AUD/oz</strong>, delivering strong operating leverage at current prevailing gold prices. Project safety remains exemplary with <strong>412 days zero Lost Time Injury</strong> achieved. The Stage 2 cutback pushback remains on schedule with first ore scheduled for late November.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                <th className="p-3">Key Indicator</th>
                <th className="p-3">Q3 Actual</th>
                <th className="p-3">Q3 Plan</th>
                <th className="p-3">YTD Cumulative</th>
                <th className="p-3">Variance Commentary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {disclosureData.map((row) => (
                <tr key={row.metric} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-900">{row.metric}</td>
                  <td className="p-3 font-mono font-bold text-copper-700">{row.q3Actual}</td>
                  <td className="p-3 font-mono text-slate-600">{row.q3Plan}</td>
                  <td className="p-3 font-mono text-slate-900 font-bold">{row.ytdActual}</td>
                  <td className="p-3 font-medium text-slate-700">{row.variance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
