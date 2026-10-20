import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { geologyRepository } from '@/services/repositories/geologyRepository';
import { GeologicalBlock, AssayRecord, GeologicalReviewStatus } from '@/types';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { Modal } from '@/components/common/Modal';
import { useNotifications } from '@/context/NotificationContext';
import { formatNumber, formatPercent, formatDate } from '@/utils/formatters';
import { ArrowLeft, Compass, FlaskConical, Layers, Edit3, ShieldAlert } from 'lucide-react';

export const BlockDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [block, setBlock] = useState<GeologicalBlock | null>(null);
  const [associatedAssays, setAssociatedAssays] = useState<AssayRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<GeologicalReviewStatus>('Verified');
  const [notesInput, setNotesInput] = useState('');

  useEffect(() => {
    if (!id) return;
    loadBlockData(id);
  }, [id]);

  const loadBlockData = async (blockId: string) => {
    try {
      const b = await geologyRepository.getBlockById(blockId);
      if (!b) {
        navigate('/geologist/variance');
        return;
      }
      const allAssays = await geologyRepository.getAllAssays();
      setBlock(b);
      setNewStatus(b.reviewStatus);
      setNotesInput(b.geologicalNotes || '');
      // Find assays corresponding to this block
      setAssociatedAssays(allAssays.filter((a) => a.miningBlockId.toLowerCase() === blockId.toLowerCase()));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!block) return;

    try {
      const updated = await geologyRepository.updateBlockReview(block.id, newStatus, notesInput);
      setBlock(updated);
      setIsReviewModalOpen(false);
      showToast('Review Saved', `Block ${block.id} status updated to ${newStatus}.`, 'success');
    } catch {
      showToast('Error', 'Failed to update review status.', 'error');
    }
  };

  if (loading || !block) return null;

  const assayColumns = [
    {
      key: 'id',
      header: 'Sample ID',
      render: (a: AssayRecord) => <span className="font-mono font-bold text-copper-700">{a.id}</span>,
    },
    {
      key: 'sampleLocation',
      header: 'Collar / Location',
      render: (a: AssayRecord) => <span className="text-slate-800">{a.sampleLocation}</span>,
    },
    {
      key: 'laboratory',
      header: 'Assay Lab',
      render: (a: AssayRecord) => <span className="text-slate-700">{a.laboratory}</span>,
    },
    {
      key: 'turnaroundDays',
      header: 'Turnaround',
      render: (a: AssayRecord) => <span className="font-mono text-slate-700">{a.turnaroundDays} days</span>,
    },
    {
      key: 'assayStatus',
      header: 'Status',
      render: (a: AssayRecord) => <StatusBadge status={a.assayStatus} size="sm" />,
    },
    {
      key: 'goldResultGpt',
      header: 'Gold Grade (g/t Au)',
      render: (a: AssayRecord) => (
        <span className="font-mono font-bold text-slate-900">
          {a.goldResultGpt !== undefined ? `${a.goldResultGpt.toFixed(2)} g/t` : 'Pending'}
        </span>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/geologist/variance')}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-copper-700 bg-copper-50 px-2 py-0.5 rounded border border-copper-200">
                {block.id}
              </span>
              <StatusBadge status={block.oreClassification} size="sm" />
              <StatusBadge status={block.reviewStatus} size="sm" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Geological Block: {block.id} ({block.miningZone})
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-copper-600 text-white rounded-lg text-xs font-semibold hover:bg-copper-700 transition-colors shadow-sm shrink-0"
        >
          <Edit3 className="w-4 h-4" />
          <span>Update Review Status</span>
        </button>
      </div>

      {/* Block Profile Grid */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-card grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Mining Zone</span>
          <span className="font-semibold text-slate-800">{block.miningZone}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Bench Level</span>
          <span className="font-semibold text-slate-800">{block.benchLevel}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Grid Position</span>
          <span className="font-mono text-slate-800">X: {block.xCoord}, Y: {block.yCoord}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Assigned Geologist</span>
          <span className="font-semibold text-slate-800">{block.assignedGeologist}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Sampling Status</span>
          <StatusBadge status={block.samplingStatus} size="sm" />
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Last Reconciliation</span>
          <span className="font-mono text-slate-600">{formatDate(block.lastUpdatedDate)}</span>
        </div>
      </div>

      {/* Grade and Tonnage Variance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Actual Assay Grade"
          value={`${block.actualGradeGpt.toFixed(2)} g/t`}
          comparison={`Planned: ${block.plannedGradeGpt.toFixed(2)} g/t Au`}
          trend={block.actualGradeGpt >= block.plannedGradeGpt ? 'up' : 'down'}
          accent="copper"
          iconName="Compass"
        />

        <KpiCard
          title="Grade Variance"
          value={formatPercent(block.gradeVariancePct ?? 0, 1, true)}
          comparison="Mathematical variance vs 3D model"
          accent={(block.gradeVariancePct ?? 0) < -15 ? 'rose' : 'emerald'}
          iconName="Layers"
        />

        <KpiCard
          title="Mined Tonnage"
          value={`${formatNumber(block.actualTonnage)} t`}
          comparison={`Planned: ${formatNumber(block.plannedTonnage)} t`}
          accent="navy"
          iconName="Activity"
        />

        <KpiCard
          title="Dilution Ingress"
          value={`${block.dilutionPercentage}%`}
          comparison="Waste rock contamination"
          accent={block.dilutionPercentage > 8 ? 'rose' : 'emerald'}
          iconName="AlertTriangle"
        />
      </div>

      {/* Geological Notes Box */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-card">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Geological Field Observations</h3>
        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
          {block.geologicalNotes || 'Coarse auriferous quartz stockwork hosted within sheared ultramafic basalt contact. Reconciles favorably with 2025 diamond core resource wireframe.'}
        </p>
      </div>

      {/* Associated Assays Table */}
      <DataTable
        title={`Associated Fire Assays (${associatedAssays.length} Samples)`}
        subtitle={`Lab assay results linking to block ${block.id}`}
        data={associatedAssays as unknown as Record<string, unknown>[]}
        columns={assayColumns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        exportFilename={`${block.id}_assays`}
      />

      {/* Review Modal */}
      {isReviewModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsReviewModalOpen(false)}
          title={`Update Geological Review: ${block.id}`}
          description="Record formal reconciliation verdict and sampling instructions."
          maxWidth="sm"
        >
          <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Review Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as GeologicalReviewStatus)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-copper-500"
              >
                <option value="Verified">Verified</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Flagged for Resampling">Flagged for Resampling</option>
                <option value="Dilution Alert">Dilution Alert</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Geological Review Notes</label>
              <textarea
                rows={3}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-copper-600 hover:bg-copper-700 rounded shadow-sm"
              >
                Save Status
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
