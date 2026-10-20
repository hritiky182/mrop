import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { Modal } from '@/components/common/Modal';
import { geologyRepository } from '@/services/repositories/geologyRepository';
import { useNotifications } from '@/context/NotificationContext';
import { GeologicalBlock, GeologicalReviewStatus } from '@/types';
import { formatNumber, formatPercent, formatGrade } from '@/utils/formatters';
import { GitCompare, AlertTriangle, ShieldCheck, Filter, Edit3, ArrowRight } from 'lucide-react';

export const BlockModelVariancePage: React.FC = () => {
  const [blocks, setBlocks] = useState<GeologicalBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [editingBlock, setEditingBlock] = useState<GeologicalBlock | null>(null);
  const [reviewStatus, setReviewStatus] = useState<GeologicalReviewStatus>('Verified');
  const [reviewNotes, setReviewNotes] = useState<string>('');

  const navigate = useNavigate();
  const { showToast } = useNotifications();

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = async () => {
    const data = await geologyRepository.getAllBlocks();
    setBlocks(data);
    setLoading(false);
  };

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock) return;

    try {
      const updated = await geologyRepository.updateBlockReview(
        editingBlock.id,
        reviewStatus,
        reviewNotes
      );
      setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setEditingBlock(null);
      showToast(
        'Review Status Updated',
        `${updated.id} marked as ${reviewStatus}. Local audit record updated.`,
        'success'
      );
    } catch {
      showToast('Error', 'Failed to update geological review.', 'error');
    }
  };

  const openReviewModal = (block: GeologicalBlock) => {
    setEditingBlock(block);
    setReviewStatus(block.reviewStatus);
    setReviewNotes(block.geologicalNotes || '');
  };

  if (loading) return null;

  const reviewAlertCount = blocks.filter((b) => b.reviewStatus !== 'Verified').length;
  const filteredBlocks = zoneFilter === 'All'
    ? blocks
    : blocks.filter((b) => b.miningZone.toLowerCase().includes(zoneFilter.toLowerCase()));

  const columns = [
    {
      key: 'id',
      header: 'Block ID',
      render: (item: GeologicalBlock) => (
        <span className="font-mono font-bold text-copper-700">{item.id}</span>
      ),
      sortable: true,
    },
    {
      key: 'miningZone',
      header: 'Mining Sector',
      render: (item: GeologicalBlock) => (
        <div>
          <span className="font-semibold text-slate-900 block">{item.miningZone}</span>
          <span className="text-[11px] text-slate-500">{item.benchLevel}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'plannedTonnage',
      header: 'Planned (t)',
      render: (item: GeologicalBlock) => (
        <span className="font-mono text-slate-600">{formatNumber(item.plannedTonnage)} t</span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'actualTonnage',
      header: 'Actual (t)',
      render: (item: GeologicalBlock) => (
        <span className="font-mono font-medium text-slate-800">{formatNumber(item.actualTonnage)} t</span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'tonnageVariancePct',
      header: 'Tonnage Var %',
      render: (item: GeologicalBlock) => {
        const v = item.tonnageVariancePct ?? 0;
        const isPos = v >= 0;
        return (
          <span className={`font-mono text-xs font-semibold ${isPos ? 'text-emerald-700' : 'text-slate-700'}`}>
            {formatPercent(v, 1, true)}
          </span>
        );
      },
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'plannedGradeGpt',
      header: 'Planned Grade',
      render: (item: GeologicalBlock) => (
        <span className="font-mono text-slate-600">{item.plannedGradeGpt.toFixed(2)} g/t</span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'actualGradeGpt',
      header: 'Actual Grade',
      render: (item: GeologicalBlock) => (
        <span className="font-mono font-bold text-slate-900">{item.actualGradeGpt.toFixed(2)} g/t</span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'gradeVariancePct',
      header: 'Grade Var %',
      render: (item: GeologicalBlock) => {
        const v = item.gradeVariancePct ?? 0;
        const isCritical = v <= -20;
        const isWarning = v <= -10;
        return (
          <span
            className={`font-mono font-bold text-xs ${
              isCritical ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            {formatPercent(v, 1, true)}
          </span>
        );
      },
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'dilutionPercentage',
      header: 'Dilution',
      render: (item: GeologicalBlock) => (
        <span className="font-mono font-medium text-slate-800">{item.dilutionPercentage}%</span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'reviewStatus',
      header: 'Review Status',
      render: (item: GeologicalBlock) => <StatusBadge status={item.reviewStatus} size="sm" />,
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: GeologicalBlock) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openReviewModal(item);
          }}
          className="text-xs font-semibold text-copper-600 hover:text-copper-700 hover:underline"
        >
          Review
        </button>
      ),
      sortable: false,
    },
  ];

  const zones = ['All', 'North Pit', 'Stage 2 South', 'Main Cutback'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Block Model Variance & Reconciliation</h2>
        <p className="text-xs text-slate-500 mt-1">
          Comparison between 3D resource block models and actual production blast hole assays. Mathematical variance: ((Actual - Planned) / Planned) × 100.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Total Reconciled Blocks"
          value={blocks.length}
          unit="Blocks"
          comparison="Covering Bench 310m to 340m"
          accent="navy"
          iconName="GitCompare"
        />

        <KpiCard
          title="Review Alerts Triggered"
          value={reviewAlertCount}
          comparison="Variance exceeds ±15% threshold"
          accent="rose"
          iconName="AlertTriangle"
          statusBadge={<StatusBadge status={`${reviewAlertCount} Flagged`} variant="critical" size="sm" />}
        />

        <KpiCard
          title="Net Grade Reconciliation"
          value="-4.8%"
          comparison="Cumulative actual vs planned grade"
          accent="amber"
          iconName="Compass"
        />

        <KpiCard
          title="Net Tonnage Variance"
          value="-1.2%"
          comparison="Near-neutral mass recovery"
          accent="emerald"
          iconName="ShieldCheck"
        />
      </div>

      {/* Zone Filter Toolbar */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm text-xs">
        <span className="font-semibold text-slate-500 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Mining Zone:
        </span>
        {zones.map((z) => (
          <button
            key={z}
            onClick={() => setZoneFilter(z)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              zoneFilter === z
                ? 'bg-copper-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {z}
          </button>
        ))}
      </div>

      {/* Variance DataTable */}
      <DataTable
        title="Block Model Reconciliation Ledger"
        subtitle="Click any row to open Block Detail Page. Click 'Review' to update geological verification status."
        data={filteredBlocks as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        onRowClick={(item) => navigate(`/geologist/blocks/${item.id}`)}
        exportFilename="block_model_variance_ledger"
      />

      {/* Review Status Modal */}
      {editingBlock && (
        <Modal
          isOpen={true}
          onClose={() => setEditingBlock(null)}
          title={`Geological Review: ${editingBlock.id}`}
          description={`${editingBlock.miningZone} • Bench ${editingBlock.benchLevel}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateReview} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Planned Grade:</span>
                <span className="font-mono font-bold text-slate-800">{editingBlock.plannedGradeGpt.toFixed(2)} g/t</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Actual Assay Grade:</span>
                <span className="font-mono font-bold text-slate-900">{editingBlock.actualGradeGpt.toFixed(2)} g/t</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Grade Variance:</span>
                <span className="font-mono font-bold text-rose-700">
                  {formatPercent(editingBlock.gradeVariancePct ?? 0, 1, true)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Dilution Ingress:</span>
                <span className="font-mono font-bold text-slate-800">{editingBlock.dilutionPercentage}%</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Geological Review Status *
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as GeologicalReviewStatus)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-copper-500"
              >
                <option value="Verified">Verified</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Flagged for Resampling">Flagged for Resampling</option>
                <option value="Dilution Alert">Dilution Alert</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Geologist Notes & Investigation Observations
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Document shear pinch-out, hanging-wall overbreak, or resampling instructions..."
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingBlock(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-copper-600 hover:bg-copper-700 rounded shadow-sm"
              >
                Save Review
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
