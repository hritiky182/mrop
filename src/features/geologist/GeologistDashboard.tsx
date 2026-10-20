import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { geologyRepository } from '@/services/repositories/geologyRepository';
import { GeologicalBlock, AssayRecord } from '@/types';
import { formatNumber, formatPercent, formatGrade } from '@/utils/formatters';
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
  Compass,
  Layers,
  FlaskConical,
  GitCompare,
  PieChart,
  Map,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export const GeologistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<GeologicalBlock[]>([]);
  const [assays, setAssays] = useState<AssayRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      geologyRepository.getAllBlocks(),
      geologyRepository.getAllAssays(),
    ]).then(([blk, asy]) => {
      setBlocks(blk);
      setAssays(asy);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  // Derive Geologist KPIs
  const avgGrade =
    blocks.reduce((sum, b) => sum + b.actualGradeGpt, 0) / (blocks.length || 1);
  const avgPlannedGrade =
    blocks.reduce((sum, b) => sum + b.plannedGradeGpt, 0) / (blocks.length || 1);
  const compliantCount = blocks.filter((b) => b.gradeComplianceStatus === 'Compliant').length;
  const gradeCompliancePct = (compliantCount / (blocks.length || 1)) * 100;
  const avgDilution =
    blocks.reduce((sum, b) => sum + b.dilutionPercentage, 0) / (blocks.length || 1);

  const pendingAssays = assays.filter((a) => a.assayStatus !== 'Results Available');
  const delayedAssays = assays.filter((a) => a.assayStatus === 'Delayed');
  const reviewRequiredBlocks = blocks.filter((b) => b.reviewStatus !== 'Verified');

  // Chart data: Planned vs Actual Grade by block
  const gradeComparisonData = blocks.slice(0, 8).map((b) => ({
    name: b.id.replace('BLK-', ''),
    planned: Number(b.plannedGradeGpt.toFixed(2)),
    actual: Number(b.actualGradeGpt.toFixed(2)),
  }));

  // Dilution trend by zone
  const dilutionByZone = [
    { zone: 'North Pit Footwall', dilution: 7.0, target: 5.0 },
    { zone: 'Stage 2 South', dilution: 9.6, target: 5.0 },
    { zone: 'Main Cutback Central', dilution: 7.7, target: 5.0 },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#14283F] text-white p-6 rounded-xl border border-slate-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded uppercase tracking-wider">
              Geological & Spatial Level
            </span>
            <span className="text-xs text-slate-300">Yilgarn Archean Greenstone Belt</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Resource Reconciliation & Grade Control
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Monitor fire assay turnarounds, block model grade variance, waste dilution per bench, and spatial mining block classifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/geologist/spatial')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
          >
            <Map className="w-4 h-4" />
            <span>Spatial Overview</span>
          </button>
          <button
            onClick={() => navigate('/geologist/variance')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <GitCompare className="w-4 h-4" />
            <span>Reconciliation ({reviewRequiredBlocks.length} Alerts)</span>
          </button>
        </div>
      </div>

      {/* 8 Primary Geologist KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Average Ore Grade"
          value={avgGrade.toFixed(2)}
          unit="g/t Au"
          comparison={`Planned: ${avgPlannedGrade.toFixed(2)} g/t Au`}
          trend={avgGrade >= avgPlannedGrade ? 'up' : 'down'}
          accent="copper"
          iconName="Compass"
          statusBadge={<StatusBadge status="High Grade" variant="operational" size="sm" />}
        />

        <KpiCard
          title="Grade Control Compliance"
          value={formatPercent(gradeCompliancePct, 1)}
          comparison={`${compliantCount} of ${blocks.length} Blocks within ±10%`}
          trend="up"
          accent="emerald"
          iconName="CheckCircle"
        />

        <KpiCard
          title="Dilution Percentage"
          value={formatPercent(avgDilution, 1)}
          comparison="Target: < 5.0% Mining Dilution"
          trend="up"
          trendPositive={false}
          accent="rose"
          iconName="PieChart"
          statusBadge={<StatusBadge status="Stage 2 Alert" variant="warning" size="sm" />}
        />

        <KpiCard
          title="Block Model Variance"
          value="-4.8%"
          comparison="Net reconciliation against 2025 resource"
          trend="down"
          trendPositive={false}
          accent="amber"
          iconName="GitCompare"
        />

        <KpiCard
          title="Pending Assays"
          value={pendingAssays.length}
          unit="Samples"
          comparison={`${delayedAssays.length} Delayed at ALS / Bureau Veritas`}
          accent="navy"
          iconName="FlaskConical"
          statusBadge={<StatusBadge status={`${delayedAssays.length} Delayed`} variant="critical" size="sm" />}
        />

        <KpiCard
          title="Avg Assay Turnaround"
          value="2.4"
          unit="Days"
          comparison="SLA Target: 48 Hours"
          trend="up"
          trendPositive={false}
          accent="default"
          iconName="Clock"
        />

        <KpiCard
          title="Active Geological Alerts"
          value={reviewRequiredBlocks.length}
          unit="Blocks"
          comparison="BLK-Z1-04 & BLK-Z2-02"
          accent="rose"
          iconName="AlertTriangle"
          statusBadge={<StatusBadge status="Review Req" variant="critical" size="sm" />}
        />

        <KpiCard
          title="Ore Tonnage Milled YTD"
          value="1.17M"
          unit="Tonnes"
          comparison="Run of Mine (ROM) Feed"
          accent="copper"
          iconName="Layers"
        />
      </div>

      {/* Charts: Planned vs Actual Grade & Dilution by Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Block Model Planned vs Actual Grade (g/t Au)"
            subtitle="Comparing resource model grade against lab fire assay reconciliation"
            actions={
              <button
                onClick={() => navigate('/geologist/variance')}
                className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
              >
                <span>Full Variance Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit=" g/t" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    formatter={(val: any) => [`${Number(val).toFixed(2)} g/t Au`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="planned" name="Planned Model (g/t Au)" fill="#14283F" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual Assay (g/t Au)" fill="#C47B45" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div>
          <ChartCard
            title="Dilution by Mining Zone (%)"
            subtitle="Waste rock ingress per sector"
            actions={
              <button
                onClick={() => navigate('/geologist/dilution')}
                className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
              >
                <span>Dilution Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dilutionByZone} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis type="number" unit="%" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis type="category" dataKey="zone" tick={{ fontSize: 10, fill: '#64748B' }} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                    formatter={(val: any) => [`${val}%`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="dilution" name="Actual Dilution (%)" fill="#C74646" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="target" name="Target (<5%)" fill="#16805D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Spatial Overview Quick Grid Preview */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-900">Illustrative Spatial Block Map Preview</h3>
            </div>
            <p className="text-xs text-slate-500">
              Interactive 2D spatial overview of mining blocks. Click any block to inspect drill assays and dilution.
            </p>
          </div>

          <button
            onClick={() => navigate('/geologist/spatial')}
            className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
          >
            <span>Open Interactive Spatial Canvas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Simplified grid preview */}
        <div className="grid grid-cols-5 gap-2.5 p-4 bg-slate-50 rounded-lg border border-slate-200">
          {blocks.map((b) => {
            const isHighGrade = b.actualGradeGpt >= 3.5;
            const isCriticalVariance = b.gradeComplianceStatus === 'Variance Critical';
            const isHighVariance = b.gradeComplianceStatus === 'Variance High';

            return (
              <div
                key={b.id}
                onClick={() => navigate(`/geologist/blocks/${b.id}`)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all hover:scale-102 hover:shadow-md ${
                  isCriticalVariance
                    ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-400'
                    : isHighVariance
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : isHighGrade
                    ? 'bg-copper-50 border-copper-300 text-copper-900 font-semibold'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[11px]">{b.id}</span>
                  <span className="text-[10px] text-slate-500">{b.benchLevel}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="font-mono font-bold text-xs">{b.actualGradeGpt.toFixed(2)} g/t</span>
                  <span className="text-[10px] text-slate-500 font-medium">{b.dilutionPercentage}% dil</span>
                </div>
                <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] uppercase font-bold">
                  <span className="truncate">{b.reviewStatus}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delayed Assays & Grade Control Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assay Laboratory Turnaround Watch */}
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-slate-900">Commercial Assay Laboratory SLA</h3>
            </div>
            <button
              onClick={() => navigate('/geologist/assays')}
              className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
            >
              <span>View All ({assays.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {assays.slice(0, 4).map((asy) => (
              <div
                key={asy.id}
                onClick={() => navigate('/geologist/assays')}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{asy.id}</span>
                      <span className="text-[11px] text-slate-500">{asy.laboratory}</span>
                    </div>
                    <span className="text-[11px] text-slate-600 block mt-0.5">{asy.sampleLocation}</span>
                  </div>

                  <div className="text-right">
                    <StatusBadge status={asy.assayStatus} size="sm" />
                    {asy.goldResultGpt !== undefined && (
                      <span className="font-mono text-xs font-bold text-copper-700 block mt-1">
                        {asy.goldResultGpt.toFixed(2)} g/t Au
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geological Blocks Requiring Review */}
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-semibold text-slate-900">Blocks Flagged for Geological Review</h3>
            </div>
            <button
              onClick={() => navigate('/geologist/variance')}
              className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
            >
              <span>Review Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {reviewRequiredBlocks.map((blk) => (
              <div
                key={blk.id}
                onClick={() => navigate(`/geologist/blocks/${blk.id}`)}
                className="p-3 rounded-lg border border-rose-200/60 bg-rose-50/30 hover:bg-rose-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{blk.id}</span>
                    <span className="text-[11px] text-slate-600">{blk.miningZone}</span>
                  </div>
                  <StatusBadge status={blk.reviewStatus} size="sm" />
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    Planned: {blk.plannedGradeGpt.toFixed(2)} g/t → Actual: <span className="font-bold text-rose-700">{blk.actualGradeGpt.toFixed(2)} g/t</span>
                  </span>
                  <span className="text-[11px] text-rose-800 font-mono font-bold">
                    {blk.dilutionPercentage}% Dilution
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
