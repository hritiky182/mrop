import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { productionRepository } from '@/services/repositories/productionRepository';
import { Milestone, EsgIndicator, SafetyRecord, ProductionTrendPoint } from '@/types';
import { formatNumber, formatPercent, formatDate } from '@/utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Award,
  Calendar,
  Leaf,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  FileCheck,
} from 'lucide-react';

export const InvestorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [esgList, setEsgList] = useState<EsgIndicator[]>([]);
  const [safetyStats, setSafetyStats] = useState<{
    zeroLtiDays: number;
    totalRecordableIncidentRateTrifr: number;
    industryBenchmarkTrifr: number;
  } | null>(null);
  const [trends, setTrends] = useState<ProductionTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productionRepository.getMilestones(),
      productionRepository.getEsgIndicators(),
      productionRepository.getSafetyStats(),
      productionRepository.getProductionTrends(),
    ]).then(([mls, esg, saf, trn]) => {
      setMilestones(mls);
      setEsgList(esg);
      setSafetyStats(saf);
      setTrends(trn);
      setLoading(false);
    });
  }, []);

  if (loading || !safetyStats) return null;

  const totalGoldOz = trends.reduce((sum, item) => sum + item.actualGoldOz, 0);
  const totalTargetOz = trends.reduce((sum, item) => sum + item.targetGoldOz, 0);
  const completedMilestones = milestones.filter((m) => m.status === 'Completed').length;
  const overallProjectCompletion = Math.round(
    milestones.reduce((acc, m) => acc + m.completionPercentage, 0) / milestones.length
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#14283F] text-white p-6 rounded-xl border border-slate-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-600 text-white rounded uppercase tracking-wider">
              Corporate Governance & Macro Level
            </span>
            <span className="text-xs text-slate-300">Investor Relations Portal</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Red Ridge Gold Capital Performance & Governance
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Executive investor perspective detailing commercial gold ramp-up progress, statutory ESG stewardship, zero Lost Time Injury milestones, and project timeline schedule health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/investor/reports')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-copper-600 hover:bg-copper-700 rounded-lg transition-colors shadow-sm"
          >
            <FileCheck className="w-4 h-4" />
            <span>Quarterly Disclosures</span>
          </button>
          <button
            onClick={() => navigate('/investor/timeline')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <Calendar className="w-4 h-4" />
            <span>Gantt Timeline</span>
          </button>
        </div>
      </div>

      {/* 8 Primary Investor KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Gold Produced"
          value={formatNumber(totalGoldOz)}
          unit="oz Au"
          comparison="Poured Doré Bullion YTD"
          trend="up"
          accent="copper"
          iconName="Award"
          statusBadge={<StatusBadge status="Ramp-Up Achieved" variant="operational" size="sm" />}
        />

        <KpiCard
          title="Production Target"
          value="104.0%"
          comparison={`${formatPercent(((totalGoldOz - totalTargetOz) / totalTargetOz) * 100, 1, true)} vs Forecast`}
          trend="up"
          accent="emerald"
          iconName="TrendingUp"
        />

        <KpiCard
          title="Project Completion"
          value={`${overallProjectCompletion}%`}
          comparison="Aggregate Milestones Index"
          trend="up"
          accent="navy"
          iconName="CheckCircle"
        />

        <KpiCard
          title="Zero LTI Days"
          value={safetyStats.zeroLtiDays}
          unit="Days"
          comparison="Lost Time Injury Free Operation"
          trend="up"
          accent="emerald"
          iconName="ShieldCheck"
          statusBadge={<StatusBadge status="Zero Harm" variant="operational" size="sm" />}
        />

        <KpiCard
          title="ESG Compliance Status"
          value="100%"
          comparison="GISTM Tailings & Tenement Standard"
          trend="up"
          accent="emerald"
          iconName="Leaf"
          statusBadge={<StatusBadge status="Compliant" variant="operational" size="sm" />}
        />

        <KpiCard
          title="Milestones Delivered"
          value={`${completedMilestones} / ${milestones.length}`}
          comparison="6 Commercial Targets Met"
          accent="copper"
          iconName="Award"
        />

        <KpiCard
          title="Budget Utilization"
          value="98.0%"
          comparison="OpEx $78.4M vs $80M Budget"
          trend="down"
          trendPositive={true}
          accent="navy"
          iconName="DollarSign"
        />

        <KpiCard
          title="Project Schedule Health"
          value="On Track"
          comparison="Stage 2 Cutback Pushback Active"
          accent="emerald"
          iconName="Clock"
          statusBadge={<StatusBadge status="On Schedule" variant="operational" size="sm" />}
        />
      </div>

      {/* Milestones and Production Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Commercial Gold Output vs Production Plan (oz Au)"
            subtitle="Demonstrating ramp-up attainment to annualized 100,000 oz target"
            actions={
              <button
                onClick={() => navigate('/investor/milestones')}
                className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
              >
                <span>Milestone Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit=" oz" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    formatter={(val: any) => [`${formatNumber(Number(val))} oz Au`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="actualGoldOz" name="Actual Gold Produced (oz)" fill="#C47B45" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="targetGoldOz" name="Target Schedule (oz)" fill="#14283F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Safety & TRIFR Comparison */}
        <div>
          <ChartCard
            title="Workforce Safety Performance"
            subtitle="Lost Time Injury & TRIFR benchmark"
            actions={
              <button
                onClick={() => navigate('/investor/safety')}
                className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
              >
                <span>Safety KPIs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-72 flex flex-col justify-between py-2 text-xs">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Safety Milestone
                </span>
                <span className="text-3xl font-extrabold font-mono text-emerald-900 block my-1">
                  {safetyStats.zeroLtiDays}
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  Consecutive Days Zero Lost Time Injury
                </span>
              </div>

              <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Red Ridge TRIFR Rate:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {safetyStats.totalRecordableIncidentRateTrifr.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">WA Industry Peer Benchmark:</span>
                  <span className="font-mono text-slate-500">
                    {safetyStats.industryBenchmarkTrifr.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${(safetyStats.totalRecordableIncidentRateTrifr / safetyStats.industryBenchmarkTrifr) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  *TRIFR = Total Recordable Injury Frequency Rate per 1,000,000 man-hours.
                </p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Production Milestones Quick Table */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Project Development Milestones</h3>
            <p className="text-xs text-slate-500">Commercial ramp-up and infrastructure timeline deliverables</p>
          </div>
          <button
            onClick={() => navigate('/investor/milestones')}
            className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
          >
            <span>View All Milestones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                <th className="pb-2 font-semibold">ID</th>
                <th className="pb-2 font-semibold">Milestone Deliverable</th>
                <th className="pb-2 font-semibold">Planned Date</th>
                <th className="pb-2 font-semibold">Completion %</th>
                <th className="pb-2 font-semibold">Governance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {milestones.slice(0, 5).map((m) => (
                <tr
                  key={m.id}
                  onClick={() => navigate('/investor/milestones')}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <td className="py-2.5 font-mono font-bold text-copper-700">{m.id}</td>
                  <td className="py-2.5">
                    <span className="font-semibold text-slate-900 block">{m.title}</span>
                    <span className="text-[11px] text-slate-500">{m.summary}</span>
                  </td>
                  <td className="py-2.5 font-mono text-slate-600">{formatDate(m.plannedDate, 'dd MMM yyyy')}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-copper-600 h-full rounded-full"
                          style={{ width: `${m.completionPercentage}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-700">{m.completionPercentage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <StatusBadge status={m.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ESG Indicators Preview */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Environmental, Social & Governance (ESG) Highlights</h3>
          </div>
          <button
            onClick={() => navigate('/investor/esg')}
            className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
          >
            <span>Full ESG Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {esgList.slice(0, 3).map((esg) => (
            <div key={esg.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800 uppercase">
                  {esg.pillar}
                </span>
                <StatusBadge status={esg.status} size="sm" />
              </div>
              <h4 className="font-semibold text-slate-900 mt-2 line-clamp-1">{esg.metricName}</h4>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-mono font-bold text-sm text-slate-900">
                  {esg.currentValue} {esg.unit}
                </span>
                <span className="text-[10px] text-slate-500">Target: {esg.targetValue} {esg.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
