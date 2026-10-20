import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { Modal } from '@/components/common/Modal';
import { inventoryRepository } from '@/services/repositories/inventoryRepository';
import { useNotifications } from '@/context/NotificationContext';
import { SparePart } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Package, AlertTriangle, ShieldCheck, DollarSign, Edit3, ArrowRight } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);

  const { showToast } = useNotifications();

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const data = await inventoryRepository.getAll();
    setParts(data);
    setLoading(false);
  };

  const handleUpdateQuantity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPart) return;

    try {
      const updated = await inventoryRepository.updateQuantity(editingPart.id, newQuantity);
      setParts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingPart(null);
      showToast(
        'Inventory Restocked',
        `${updated.partNumber} (${updated.name}) quantity updated to ${updated.availableQuantity}. Stock status recalculated: ${updated.stockStatus}`,
        'success'
      );
    } catch {
      showToast('Error', 'Failed to update inventory quantity.', 'error');
    }
  };

  const openRestockModal = (part: SparePart) => {
    setEditingPart(part);
    setNewQuantity(part.availableQuantity);
  };

  if (loading) return null;

  const outOfStock = parts.filter((p) => p.stockStatus === 'Out of Stock');
  const lowStock = parts.filter((p) => p.stockStatus === 'Low Stock');
  const totalValuation = parts.reduce((sum, p) => sum + p.availableQuantity * p.unitCostAud, 0);

  const filteredParts = selectedStatus === 'All'
    ? parts
    : parts.filter((p) => p.stockStatus === selectedStatus);

  const columns = [
    {
      key: 'partNumber',
      header: 'Part Number',
      render: (item: SparePart) => (
        <span className="font-mono font-bold text-copper-700">{item.partNumber}</span>
      ),
      sortable: true,
    },
    {
      key: 'name',
      header: 'Part Name & Description',
      render: (item: SparePart) => (
        <div>
          <span className="font-semibold text-slate-900 block">{item.name}</span>
          <span className="text-[11px] text-slate-400 block">{item.storageLocation}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'compatibleEquipment',
      header: 'Compatible Equipment',
      render: (item: SparePart) => (
        <div className="flex flex-wrap gap-1">
          {item.compatibleEquipment.map((eq) => (
            <span
              key={eq}
              className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200"
            >
              {eq}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'availableQuantity',
      header: 'Available Stock',
      render: (item: SparePart) => (
        <div>
          <span
            className={`font-mono font-bold text-sm ${
              item.availableQuantity === 0
                ? 'text-rose-700'
                : item.availableQuantity <= item.minimumStockLevel
                ? 'text-amber-700'
                : 'text-slate-800'
            }`}
          >
            {item.availableQuantity}
          </span>
          <span className="text-[10px] text-slate-400 block">Min: {item.minimumStockLevel}</span>
        </div>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'stockStatus',
      header: 'Calculated Status',
      render: (item: SparePart) => <StatusBadge status={item.stockStatus || 'In Stock'} size="sm" />,
      sortable: true,
    },
    {
      key: 'unitCostAud',
      header: 'Unit Cost (AUD)',
      render: (item: SparePart) => (
        <span className="font-mono text-slate-800 font-medium">
          {formatCurrency(item.unitCostAud)}
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'supplier',
      header: 'Primary Supplier',
      render: (item: SparePart) => (
        <div>
          <span className="text-slate-700 font-medium block truncate max-w-[150px]">{item.supplier}</span>
          <span className="text-[10px] text-slate-400 block">Lead: {item.leadTimeDays} days</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: SparePart) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openRestockModal(item);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-copper-600 hover:text-copper-700 bg-copper-50 hover:bg-copper-100 px-2 py-1 rounded border border-copper-200/60 transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          <span>Update Qty</span>
        </button>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Spare Parts & Warehouse Inventory</h2>
        <p className="text-xs text-slate-500 mt-1">
          Mechanical replacement components, hydraulic seal kits, filter packs, and mill consumables tracking.
        </p>
      </div>

      {/* Low stock alert banner */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block text-sm">Critical Inventory Alert:</span>
            <p className="mt-0.5 leading-relaxed">
              <strong>{outOfStock.length} items out of stock</strong> ({outOfStock.map((p) => p.partNumber).join(', ')}) and <strong>{lowStock.length} items at or below minimum threshold</strong>. Emergency requisitions initiated with Perth & Kalgoorlie hubs.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Total Catalog Items"
          value={parts.length}
          unit="SKUs"
          comparison="Critical Mining Spares"
          accent="navy"
          iconName="Package"
        />

        <KpiCard
          title="Out of Stock Items"
          value={outOfStock.length}
          comparison="Zero warehouse inventory"
          accent="rose"
          iconName="AlertTriangle"
          statusBadge={<StatusBadge status="Immediate Reorder" variant="critical" size="sm" />}
        />

        <KpiCard
          title="Low Stock Items"
          value={lowStock.length}
          comparison="Below safety threshold"
          accent="amber"
          iconName="AlertTriangle"
        />

        <KpiCard
          title="Total Inventory Valuation"
          value={formatCurrency(totalValuation, true)}
          comparison="Warehouse balance on site"
          accent="copper"
          iconName="DollarSign"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm text-xs">
        <span className="font-semibold text-slate-500">Filter Status:</span>
        {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedStatus === st
                ? 'bg-copper-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <DataTable
        title="Warehouse Inventory Roster"
        subtitle="Automatic stock status calculated from minimum threshold. Click 'Update Qty' to simulate restocking or usage."
        data={filteredParts as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        onRowClick={(item) => openRestockModal(item as unknown as SparePart)}
        exportFilename="spare_parts_inventory"
      />

      {/* Restock Quantity Modal */}
      {editingPart && (
        <Modal
          isOpen={true}
          onClose={() => setEditingPart(null)}
          title={`Update Inventory: ${editingPart.partNumber}`}
          description={editingPart.name}
          maxWidth="sm"
        >
          <form onSubmit={handleUpdateQuantity} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Storage Location:</span>
                <span className="font-semibold text-slate-800">{editingPart.storageLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Minimum Stock Level:</span>
                <span className="font-mono font-bold text-slate-800">{editingPart.minimumStockLevel} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Replacement Cost:</span>
                <span className="font-mono text-slate-800">{formatCurrency(editingPart.unitCostAud)}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                New Available Warehouse Quantity *
              </label>
              <input
                type="number"
                min={0}
                value={newQuantity}
                onChange={(e) => setNewQuantity(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 font-mono text-base font-bold focus:outline-none focus:ring-1 focus:ring-copper-500 text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Setting to 0 will mark as <strong>Out of Stock</strong>; setting ≤ {editingPart.minimumStockLevel} will mark as <strong>Low Stock</strong>.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPart(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-copper-600 hover:bg-copper-700 rounded shadow-sm"
              >
                Save & Update Inventory
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
