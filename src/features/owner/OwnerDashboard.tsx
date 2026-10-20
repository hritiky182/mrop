import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { Modal } from '@/components/common/Modal';
import { useNotifications } from '@/context/NotificationContext';
import { productionRepository } from '@/services/repositories/productionRepository';
import { equipmentRepository } from '@/services/repositories/equipmentRepository';
import { aiRecommendationRepository } from '@/services/repositories/aiRecommendationRepository';
import {
  FinancialOverview,
  ProductionTrendPoint,
  Equipment,
  OperationalRisk,
  AiRecommendation,
  AiRecommendationStatus,
} from '@/types';
import { formatCurrency, formatNumber, formatPercent, formatGoldOz } from '@/utils/formatters';
import { calculateRiskScore } from '@/utils/calculations';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Wrench,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [finances, setFinances] = useState<FinancialOverview | null>(null);
  const [trends, setTrends] = useState<ProductionTrendPoint[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [risks, setRisks] = useState<OperationalRisk[]>([]);
  const [aiRecs, setAiRecs] = useState<AiRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Decision Dialog State
  const [selectedRec, setSelectedRec] = useState<AiRecommendation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    rec: AiRecommendation;
    action: AiRecommendationStatus;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fin, trn, eq, rsk, rec] = await Promise.all([
        productionRepository.getFinances(),
        productionRepository.getProductionTrends(),
        equipmentRepository.getAll(),
        productionRepository.getOperationalRisks(),
        aiRecommendationRepository.getAll(),
      ]);
      setFinances(fin);
      setTrends(trn);
      setEquipmentList(eq);
      setRisks(rsk);
      setAiRecs(rec);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (rec: AiRecommendation, newStatus: AiRecommendationStatus) => {
    try {
      const updated = await aiRecommendationRepository.updateStatus(
        rec.id,
        newStatus,
        'Sir Arthur Stirling (Owner)',
        `Action recorded via Executive Root Control.`
      );

      setAiRecs((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      if (selectedRec?.id === updated.id) {
        setSelectedRec(updated);
      }
      setConfirmAction(null);

      showToast(
        `AI Plan ${newStatus}`,
        `Operational recommendation "${rec.title}" updated to ${newStatus}. Prototype decision saved.`,
        newStatus === 'Approved' ? 'success' : newStatus === 'Rejected' ? 'warning' : 'info'
      );
    } catch {
      showToast('Error', 'Failed to update recommendation status.', 'error');
    }
  };

  if (loading || !finances) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Derive Owner KPIs
  const cumulativeGoldOz = trends.reduce((sum, item) => sum + item.actualGoldOz, 0);
  const cumulativeTargetGoldOz = trends.reduce((sum, item) => sum + item.targetGoldOz, 0);
  const productionVariancePct = ((cumulativeGoldOz - cumulativeTargetGoldOz) / cumulativeTargetGoldOz) * 100;

  const riskMetric = calculateRiskScore(risks);
  const unresolvedRisks = risks.filter((r) => r.currentStatus !== 'Resolved');

  // Sorted Equipment by repair expenditure
  const equipmentByCost = [...equipmentList].sort(
    (a, b) => b.historicalRepairCostAud - a.historicalRepairCostAud
  );

  const COST_COLORS = ['#C47B45', '#14283F', '#23446B', '#16805D', '#94A3B8'];

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Disclaimer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-[#14283F] to-[#23446B] text-white p-6 rounded-xl shadow-md border border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-copper-500 text-white rounded uppercase tracking-wider">
              Executive Root Control
            </span>
            <span className="text-xs text-slate-300">Western Australia • Tenement RRG-01</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Red Ridge Gold Operations Overview
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Consolidated enterprise view of gold production, operating expenditures, capital repair exposures, and decision-support intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/owner/ai-recommendations')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-copper-600 hover:bg-copper-700 rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Decision Center</span>
          </button>
          <button
            onClick={() => navigate('/owner/finances')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
          >
            <DollarSign className="w-4 h-4" />
            <span>Financials</span>
          </button>
        </div>
      </div>

      {/* 8 Primary Owner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Gold Produced"
          value={formatNumber(cumulativeGoldOz)}
          unit="oz Au"
          comparison={`${formatPercent(productionVariancePct, 1, true)} vs Target`}
          trend={productionVariancePct >= 0 ? 'up' : 'down'}
          accent="copper"
          iconName="Award"
          statusBadge={<StatusBadge status="Above Target" variant="operational" size="sm" />}
        />

        <KpiCard
          title="Revenue to Date"
          value={formatCurrency(finances.totalRevenueYtdAud, true)}
          unit="AUD"
          comparison="YTD Realized Price $3,645/oz"
          trend="up"
          accent="navy"
          iconName="DollarSign"
          statusBadge={<StatusBadge status="Positive" variant="operational" size="sm" />}
        />

        <KpiCard
          title="Operating Cost (OpEx)"
          value={formatCurrency(finances.operatingCostYtdAud, true)}
          unit="AUD"
          comparison={`AISC $${formatNumber(finances.allInSustainingCostAiscPerOzAud)}/oz`}
          trend="down"
          trendPositive={false}
          accent="default"
          iconName="TrendingDown"
          statusBadge={<StatusBadge status="On Budget" variant="info" size="sm" />}
        />

        <KpiCard
          title="Equipment Repair Costs"
          value={formatCurrency(finances.equipmentRepairCostsYtdAud, true)}
          unit="AUD"
          comparison="19.0% of Total OpEx"
          trend="up"
          trendPositive={false}
          accent="amber"
          iconName="Wrench"
          statusBadge={<StatusBadge status="High Exposure" variant="warning" size="sm" />}
        />

        <KpiCard
          title="Plant Availability"
          value="96.2%"
          comparison="FLSmidth SAG & Ball Mill"
          trend="up"
          accent="emerald"
          iconName="Activity"
          statusBadge={<StatusBadge status="Optimal" variant="operational" size="sm" />}
        />

        <KpiCard
          title="Operational Risk Score"
          value={`${riskMetric.score}/100`}
          comparison={`${riskMetric.criticalCount} Critical Unresolved`}
          trend="up"
          trendPositive={false}
          accent="rose"
          iconName="AlertTriangle"
          statusBadge={<StatusBadge status={riskMetric.level} variant="critical" size="sm" />}
        />

        <KpiCard
          title="Production Target"
          value="104.4%"
          comparison="7,310 oz vs 7,000 oz MTD"
          trend="up"
          accent="copper"
          iconName="Target"
          statusBadge={<StatusBadge status="+4.4% Attainment" variant="operational" size="sm" />}
        />

        <KpiCard
          title="Critical Alerts"
          value={unresolvedRisks.filter((r) => r.severity === 'Critical').length}
          unit="Actions"
          comparison="HT-204 & Stage 2 Dilution"
          trend="neutral"
          accent="rose"
          iconName="ShieldAlert"
          statusBadge={<StatusBadge status="Immediate Action" variant="critical" size="sm" />}
        />
      </div>

      {/* Production Trends & Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Trend Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Gold Production vs Target (Monthly Run-Rate)"
            subtitle="Actual ounces poured vs mine schedule plan"
            badge={<span className="text-[11px] font-mono text-copper-600 bg-copper-50 px-2 py-0.5 rounded">oz Au</span>}
            actions={
              <button
                onClick={() => navigate('/owner/production')}
                className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
              >
                <span>Full Trends</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={[4500, 8000]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    formatter={(val: any) => [`${formatNumber(Number(val))} oz Au`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="actualGoldOz"
                    name="Actual Gold (oz)"
                    stroke="#C47B45"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#C47B45' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="targetGoldOz"
                    name="Target Plan (oz)"
                    stroke="#14283F"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Operating Cost Breakdown Donut Chart */}
        <div>
          <ChartCard
            title="Operating Expenditure Breakdown"
            subtitle="YTD operational cost distribution"
            badge={<span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">$78.4M AUD</span>}
          >
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={finances.costBreakdown}
                    dataKey="amountAud"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {finances.costBreakdown.map((entry, index) => (
                      <Cell key={entry.category} fill={COST_COLORS[index % COST_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                    formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-1 gap-1.5 w-full mt-2 text-[11px]">
                {finances.costBreakdown.map((item, idx) => (
                  <div key={item.category} className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COST_COLORS[idx % COST_COLORS.length] }} />
                      <span className="truncate">{item.category}</span>
                    </span>
                    <span className="font-semibold text-slate-800 shrink-0 font-mono">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* AI RECOMMENDATIONS CENTER (Executive Decision Center) */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-purple-50 text-purple-600 border border-purple-200/60">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                AI Operational Recommendations
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded uppercase">
                Decision Support
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Illustrative AI Analysis — Simulated operational decisions for executive review. Actions persist to browser LocalStorage.
            </p>
          </div>

          <button
            onClick={() => navigate('/owner/ai-recommendations')}
            className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1 shrink-0"
          >
            <span>View All ({aiRecs.length}) Plans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Recommendations Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {aiRecs.slice(0, 3).map((rec) => {
            const isApproved = rec.status === 'Approved';
            const isRejected = rec.status === 'Rejected';
            const isReview = rec.status === 'Marked for Review';

            return (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isApproved
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : isRejected
                    ? 'border-rose-300 bg-rose-50/20 opacity-75'
                    : 'border-slate-200 bg-slate-50/30 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
                      {rec.category}
                    </span>
                    <StatusBadge status={rec.status} size="sm" />
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{rec.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {rec.summary}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Est. Financial Value</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatCurrency(rec.estimatedFinancialImpactAud)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Model Confidence</span>
                      <span className="font-mono font-bold text-slate-800">{rec.confidenceScore}%</span>
                    </div>
                  </div>

                  {/* Direct Toggle for AI Pivot Plan */}
                  <div className="mt-3 p-2 bg-slate-100/80 rounded-lg border border-slate-200/90 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <div>
                        <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                          AI Pivot Plan
                        </span>
                        <span className="text-[9px] text-slate-500 block">
                          {isApproved ? 'Plan approved & active' : isRejected ? 'Plan rejected' : 'Direct toggle to approve'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isApproved}
                      onClick={() => {
                        if (isApproved) {
                          setConfirmAction({ rec, action: 'Pending Review' });
                        } else {
                          setConfirmAction({ rec, action: 'Approved' });
                        }
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-copper-500 focus:ring-offset-1 ${
                        isApproved ? 'bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                      title={isApproved ? 'Click to reset/re-evaluate' : 'Direct toggle to approve AI pivot plan'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isApproved ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedRec(rec);
                      setIsDetailModalOpen(true);
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline"
                  >
                    <span>View Detail</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {rec.status === 'Pending Review' ? (
                      <>
                        <button
                          onClick={() => setConfirmAction({ rec, action: 'Approved' })}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-2xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setConfirmAction({ rec, action: 'Rejected' })}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmAction({ rec, action: 'Pending Review' })}
                        className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                      >
                        Reset Status
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment Cost Exposure Table & Operational Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment Cost Exposure */}
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Equipment Cost Exposure</h3>
              <p className="text-xs text-slate-500">Highest cumulative maintenance expenditure</p>
            </div>
            <button
              onClick={() => navigate('/owner/equipment-costs')}
              className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                  <th className="pb-2 font-semibold">Equipment</th>
                  <th className="pb-2 font-semibold">Condition</th>
                  <th className="pb-2 font-semibold text-right">Downtime</th>
                  <th className="pb-2 font-semibold text-right">Repair Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipmentByCost.slice(0, 5).map((eq) => (
                  <tr
                    key={eq.id}
                    onClick={() => navigate(`/engineer/equipment/${eq.id}`)}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-2.5">
                      <span className="font-semibold text-slate-900 block">{eq.id}</span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-[150px]">
                        {eq.name}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={eq.status} size="sm" />
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-700">
                      {eq.downtimeHoursTotal} hrs
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-copper-700">
                      {formatCurrency(eq.historicalRepairCostAud)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Vulnerabilities Matrix */}
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Operational Vulnerabilities</h3>
              <p className="text-xs text-slate-500">Active operational risks requiring mitigation</p>
            </div>
            <button
              onClick={() => navigate('/owner/risks')}
              className="text-xs font-semibold text-copper-600 hover:text-copper-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {risks.slice(0, 4).map((rsk) => (
              <div
                key={rsk.id}
                onClick={() => navigate('/owner/risks')}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100/60 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {rsk.title}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        {rsk.affectedDepartment}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                      {rsk.potentialImpact}
                    </p>
                  </div>
                  <StatusBadge status={rsk.severity} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal for Selected AI Recommendation */}
      {selectedRec && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedRec.title}
          description={`Category: ${selectedRec.category} • Confidence: ${selectedRec.confidenceScore}%`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400">
                Decision simulation only. Does not alter real machinery.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Close
                </button>
                {selectedRec.status === 'Pending Review' && (
                  <>
                    <button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        setConfirmAction({ rec: selectedRec, action: 'Rejected' });
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md"
                    >
                      Reject Plan
                    </button>
                    <button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        setConfirmAction({ rec: selectedRec, action: 'Approved' });
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm"
                    >
                      Approve Plan
                    </button>
                  </>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-purple-50/70 border border-purple-200/60 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-purple-700 block mb-1">
                Illustrative AI Analysis — Prototype Data
              </span>
              <p className="text-slate-700 leading-relaxed">{selectedRec.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Operational Impact</span>
                <span className="font-semibold text-slate-800 block mt-1 leading-snug">
                  {selectedRec.operationalImpact}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-700 block">Estimated Financial Value</span>
                <span className="font-bold font-mono text-emerald-800 text-sm block mt-1">
                  {formatCurrency(selectedRec.estimatedFinancialImpactAud)}
                </span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-2">Telemetry & Supporting Metrics:</h5>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {selectedRec.supportingMetrics.map((m) => (
                  <div key={m.metricName} className="p-2.5 flex items-center justify-between bg-white text-xs">
                    <span className="text-slate-600">{m.metricName}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-500">{m.currentValue}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-emerald-700">{m.projectedValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-2">Recommended Next Actions:</h5>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                {selectedRec.recommendedNextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog Before Approving/Rejecting AI Decision */}
      {confirmAction && (
        <ConfirmationDialog
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => handleDecision(confirmAction.rec, confirmAction.action)}
          title={`Confirm ${confirmAction.action} Decision`}
          message={`Are you sure you want to mark recommendation "${confirmAction.rec.title}" as ${confirmAction.action}? This updates prototype state and records an executive audit trail in LocalStorage. No physical machinery or actual mine schedule is altered.`}
          confirmLabel={`Confirm ${confirmAction.action}`}
          variant={confirmAction.action === 'Approved' ? 'success' : 'danger'}
        />
      )}
    </div>
  );
};
