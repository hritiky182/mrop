import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { Modal } from '@/components/common/Modal';
import { geologyRepository } from '@/services/repositories/geologyRepository';
import { useNotifications } from '@/context/NotificationContext';
import { AssayRecord, AssayStatus } from '@/types';
import { formatDate } from '@/utils/formatters';
import { FlaskConical, Clock, AlertTriangle, Filter, CheckCircle2, Edit3 } from 'lucide-react';

export const AssayTrackingPage: React.FC = () => {
  const [assays, setAssays] = useState<AssayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [labFilter, setLabFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Edit assay modal
  const [editingAssay, setEditingAssay] = useState<AssayRecord | null>(null);
  const [updatedStatus, setUpdatedStatus] = useState<AssayStatus>('Results Available');
  const [goldGradeInput, setGoldGradeInput] = useState<number>(3.5);

  const { showToast } = useNotifications();

  useEffect(() => {
    loadAssays();
  }, []);

  const loadAssays = async () => {
    const data = await geologyRepository.getAllAssays();
    setAssays(data);
    setLoading(false);
  };

  const handleUpdateAssay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssay) return;

    try {
      const updated = await geologyRepository.updateAssayStatus(
        editingAssay.id,
        updatedStatus,
        updatedStatus === 'Results Available' ? goldGradeInput : undefined
      );

      setAssays((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditingAssay(null);
      showToast(
        'Assay Status Updated',
        `Sample ${updated.id} status set to ${updatedStatus}${
          updated.goldResultGpt !== undefined ? ` (${updated.goldResultGpt} g/t Au)` : ''
        }.`,
        'success'
      );
    } catch {
      showToast('Error', 'Failed to update assay status.', 'error');
    }
  };

  const openEditModal = (assay: AssayRecord) => {
    setEditingAssay(assay);
    setUpdatedStatus(assay.assayStatus);
    setGoldGradeInput(assay.goldResultGpt ?? 3.5);
  };

  if (loading) return null;

  const delayedCount = assays.filter((a) => a.assayStatus === 'Delayed').length;
  const processingCount = assays.filter((a) => a.assayStatus === 'Processing').length;
  const completedCount = assays.filter((a) => a.assayStatus === 'Results Available').length;

  const filteredAssays = assays.filter((a) => {
    const matchLab = labFilter === 'All' || a.laboratory.toLowerCase().includes(labFilter.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.assayStatus === statusFilter;
    return matchLab && matchStatus;
  });

  const columns = [
    {
      key: 'id',
      header: 'Sample ID',
      render: (item: AssayRecord) => (
        <span className="font-mono font-bold text-copper-700">{item.id}</span>
      ),
      sortable: true,
    },
    {
      key: 'sampleLocation',
      header: 'Collar / Trench Location',
      render: (item: AssayRecord) => (
        <div>
          <span className="font-semibold text-slate-900 block">{item.sampleLocation}</span>
          <span className="font-mono text-[11px] text-slate-500">{item.miningBlockId}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'laboratory',
      header: 'Assay Laboratory',
      render: (item: AssayRecord) => (
        <span className="text-slate-700 font-medium">{item.laboratory}</span>
      ),
      sortable: true,
    },
    {
      key: 'turnaroundDays',
      header: 'Turnaround',
      render: (item: AssayRecord) => (
        <span
          className={`font-mono font-medium ${
            item.turnaroundDays >= 4 ? 'text-rose-700 font-bold' : 'text-slate-700'
          }`}
        >
          {item.turnaroundDays} days
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item: AssayRecord) => <StatusBadge status={item.priority} size="sm" />,
      sortable: true,
    },
    {
      key: 'assayStatus',
      header: 'Status',
      render: (item: AssayRecord) => (
        <StatusBadge
          status={item.assayStatus}
          variant={item.assayStatus === 'Delayed' ? 'critical' : undefined}
          size="sm"
        />
      ),
      sortable: true,
    },
    {
      key: 'goldResultGpt',
      header: 'Gold Result (g/t Au)',
      render: (item: AssayRecord) => (
        <span className="font-mono font-bold text-slate-900">
          {item.goldResultGpt !== undefined ? `${item.goldResultGpt.toFixed(2)} g/t` : '—'}
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'expectedResultDate',
      header: 'Expected By',
      render: (item: AssayRecord) => (
        <span className="font-mono text-slate-500 text-xs">
          {formatDate(item.expectedResultDate, 'dd MMM')}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: AssayRecord) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openEditModal(item);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-copper-600 hover:text-copper-700 bg-copper-50 hover:bg-copper-100 px-2 py-0.5 rounded border border-copper-200/60"
        >
          <Edit3 className="w-3 h-3" />
          <span>Update</span>
        </button>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assay Laboratory Tracking & SLA</h2>
        <p className="text-xs text-slate-500 mt-1">
          Tracking 50g fire assay turnaround times across commercial labs in Kalgoorlie and Perth. Highlight turnaround delays impacting blast releases.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Total Samples Monitored"
          value={assays.length}
          comparison="RC blast cones & channel lines"
          accent="navy"
          iconName="FlaskConical"
        />

        <KpiCard
          title="Delayed Beyond 48h SLA"
          value={delayedCount}
          comparison="ALS Kalgoorlie & Bureau Veritas"
          accent="rose"
          iconName="AlertTriangle"
          statusBadge={<StatusBadge status="Bottleneck Alert" variant="critical" size="sm" />}
        />

        <KpiCard
          title="In Lab Processing"
          value={processingCount}
          comparison="Fire assay digestion stage"
          accent="amber"
          iconName="Clock"
        />

        <KpiCard
          title="Assay Results Completed"
          value={completedCount}
          comparison="Uploaded to resource wireframe"
          accent="emerald"
          iconName="CheckCircle2"
        />
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Laboratory:</span>
          <select
            value={labFilter}
            onChange={(e) => setLabFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 font-medium"
          >
            <option value="All">All Laboratories</option>
            <option value="ALS">ALS Minerals Kalgoorlie</option>
            <option value="Bureau">Bureau Veritas Perth</option>
            <option value="Intertek">Intertek Genalysis</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Delayed">Delayed Only</option>
            <option value="Processing">Processing</option>
            <option value="Submitted">Submitted</option>
            <option value="Collected">Collected</option>
            <option value="Results Available">Results Available</option>
          </select>
        </div>
      </div>

      <DataTable
        title="Sample Fire Assay Ledger"
        subtitle="Click any row or 'Update' to simulate lab result returns and status modifications in LocalStorage"
        data={filteredAssays as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        onRowClick={(item) => openEditModal(item as unknown as AssayRecord)}
        exportFilename="assay_tracking_ledger"
      />

      {/* Update Assay Status Modal */}
      {editingAssay && (
        <Modal
          isOpen={true}
          onClose={() => setEditingAssay(null)}
          title={`Update Assay: ${editingAssay.id}`}
          description={`${editingAssay.sampleLocation} • Lab: ${editingAssay.laboratory}`}
          maxWidth="sm"
        >
          <form onSubmit={handleUpdateAssay} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assay Status</label>
              <select
                value={updatedStatus}
                onChange={(e) => setUpdatedStatus(e.target.value as AssayStatus)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-copper-500"
              >
                <option value="Collected">Collected</option>
                <option value="Submitted">Submitted</option>
                <option value="Processing">Processing</option>
                <option value="Delayed">Delayed</option>
                <option value="Results Available">Results Available</option>
              </select>
            </div>

            {updatedStatus === 'Results Available' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Received Gold Grade (g/t Au)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={goldGradeInput}
                  onChange={(e) => setGoldGradeInput(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 font-mono text-sm font-bold focus:outline-none focus:ring-1 focus:ring-copper-500 text-slate-900"
                />
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingAssay(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-copper-600 hover:bg-copper-700 rounded shadow-sm"
              >
                Save Assay Status
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
