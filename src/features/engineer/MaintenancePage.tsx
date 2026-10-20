import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { Modal } from '@/components/common/Modal';
import { maintenanceRepository } from '@/services/repositories/maintenanceRepository';
import { equipmentRepository } from '@/services/repositories/equipmentRepository';
import { useNotifications } from '@/context/NotificationContext';
import { WorkOrder, Equipment, MaintenanceType, PriorityLevel, WorkOrderStatus } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wrench, Plus, Filter, Calendar, User, DollarSign, CheckCircle2, Clock } from 'lucide-react';

const workOrderSchema = z.object({
  equipmentId: z.string().min(1, 'Please select equipment'),
  type: z.enum(['Preventative', 'Corrective', 'Emergency', 'Inspection', 'Overhaul']),
  title: z.string().min(4, 'Title must have at least 4 characters'),
  description: z.string().min(10, 'Provide a detailed technical description'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  assignedTechnician: z.string().min(2, 'Technician name required'),
  plannedStartDate: z.string().min(1, 'Planned start date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  estimatedCostAud: z.number().min(0, 'Estimated cost must be positive'),
  status: z.enum(['Open', 'Scheduled', 'In Progress', 'Completed', 'On Hold']),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

export const MaintenancePage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);

  const { showToast } = useNotifications();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      type: 'Preventative',
      priority: 'Medium',
      status: 'Open',
      estimatedCostAud: 5000,
      plannedStartDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [orders, eq] = await Promise.all([
      maintenanceRepository.getAll(),
      equipmentRepository.getAll(),
    ]);
    setWorkOrders(orders);
    setEquipmentList(eq);
    setLoading(false);
  };

  const onSubmitCreate = async (data: WorkOrderFormData) => {
    try {
      const targetEq = equipmentList.find((e) => e.id === data.equipmentId);
      const equipmentName = targetEq ? targetEq.name : data.equipmentId;

      const created = await maintenanceRepository.create({
        ...data,
        equipmentName,
        plannedStartDate: new Date(data.plannedStartDate).toISOString(),
        dueDate: new Date(data.dueDate).toISOString(),
      });

      setWorkOrders((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      reset();
      showToast('Work Order Created', `Successfully issued ${created.id}: ${created.title}`, 'success');
    } catch {
      showToast('Error', 'Failed to create work order.', 'error');
    }
  };

  const onSubmitEdit = async (data: WorkOrderFormData) => {
    if (!editingOrder) return;
    try {
      const targetEq = equipmentList.find((e) => e.id === data.equipmentId);
      const equipmentName = targetEq ? targetEq.name : data.equipmentId;

      const updated = await maintenanceRepository.update(editingOrder.id, {
        ...data,
        equipmentName,
        plannedStartDate: new Date(data.plannedStartDate).toISOString(),
        dueDate: new Date(data.dueDate).toISOString(),
      });

      setWorkOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setEditingOrder(null);
      reset();
      showToast('Work Order Updated', `Changes saved to ${updated.id}.`, 'info');
    } catch {
      showToast('Error', 'Failed to update work order.', 'error');
    }
  };

  const handleQuickStatusChange = async (orderId: string, newStatus: WorkOrderStatus) => {
    try {
      const updated = await maintenanceRepository.update(orderId, {
        status: newStatus,
        completedDate: newStatus === 'Completed' ? new Date().toISOString() : undefined,
      });
      setWorkOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast('Status Updated', `${orderId} marked as ${newStatus}.`, 'info');
    } catch {
      showToast('Error', 'Failed to update status.', 'error');
    }
  };

  const openEditModal = (order: WorkOrder) => {
    setEditingOrder(order);
    setValue('equipmentId', order.equipmentId);
    setValue('type', order.type);
    setValue('title', order.title);
    setValue('description', order.description);
    setValue('priority', order.priority);
    setValue('assignedTechnician', order.assignedTechnician);
    setValue('plannedStartDate', order.plannedStartDate.slice(0, 10));
    setValue('dueDate', order.dueDate.slice(0, 10));
    setValue('estimatedCostAud', order.estimatedCostAud);
    setValue('status', order.status);
  };

  if (loading) return null;

  const statuses = ['All', 'Open', 'Scheduled', 'In Progress', 'Completed', 'On Hold'];
  const priorities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  const filteredOrders = workOrders.filter((wo) => {
    const matchStatus = statusFilter === 'All' || wo.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || wo.priority === priorityFilter;
    return matchStatus && matchPriority;
  });

  const columns = [
    {
      key: 'id',
      header: 'WO Number',
      render: (wo: WorkOrder) => (
        <span className="font-mono font-bold text-copper-700">{wo.id}</span>
      ),
      sortable: true,
    },
    {
      key: 'title',
      header: 'Task & Description',
      render: (wo: WorkOrder) => (
        <div>
          <span className="font-semibold text-slate-900 block">{wo.title}</span>
          <span className="text-[11px] text-slate-500 line-clamp-1">{wo.description}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'equipmentId',
      header: 'Equipment',
      render: (wo: WorkOrder) => (
        <div>
          <span className="font-mono font-bold text-slate-800 block">{wo.equipmentId}</span>
          <span className="text-[10px] text-slate-500 truncate block max-w-[120px]">{wo.equipmentName}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'type',
      header: 'Type',
      render: (wo: WorkOrder) => <span className="text-xs font-medium text-slate-700">{wo.type}</span>,
      sortable: true,
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (wo: WorkOrder) => <StatusBadge status={wo.priority} size="sm" />,
      sortable: true,
    },
    {
      key: 'assignedTechnician',
      header: 'Assigned Lead',
      render: (wo: WorkOrder) => (
        <span className="text-xs text-slate-700 font-medium">{wo.assignedTechnician}</span>
      ),
      sortable: true,
    },
    {
      key: 'dueDate',
      header: 'Target Date',
      render: (wo: WorkOrder) => (
        <span className="text-xs font-mono text-slate-600">{formatDate(wo.dueDate, 'dd MMM')}</span>
      ),
      sortable: true,
    },
    {
      key: 'estimatedCostAud',
      header: 'Est. Cost',
      render: (wo: WorkOrder) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(wo.estimatedCostAud)}
        </span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'status',
      header: 'Status',
      render: (wo: WorkOrder) => (
        <select
          value={wo.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => handleQuickStatusChange(wo.id, e.target.value as WorkOrderStatus)}
          className="text-xs bg-white border border-slate-200 rounded px-2 py-0.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-copper-500"
        >
          <option value="Open">Open</option>
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (wo: WorkOrder) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openEditModal(wo);
          }}
          className="text-xs font-semibold text-copper-600 hover:text-copper-700 hover:underline"
        >
          Edit
        </button>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Maintenance & Work Orders Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track preventative maintenance shutdowns, emergency work orders, technician allocation, and component costs.
          </p>
        </div>

        <button
          onClick={() => {
            reset();
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-copper-600 text-white rounded-lg text-xs font-semibold hover:bg-copper-700 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Work Order</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Total Work Orders"
          value={workOrders.length}
          comparison="Full CMMS registry"
          accent="navy"
          iconName="Wrench"
        />

        <KpiCard
          title="Active / In Progress"
          value={workOrders.filter((w) => w.status === 'In Progress').length}
          comparison="2 Heavy Vehicle Bays Occupied"
          accent="amber"
          iconName="Activity"
        />

        <KpiCard
          title="Critical Priority"
          value={workOrders.filter((w) => w.priority === 'Critical').length}
          comparison="Immediate safety / asset risk"
          accent="rose"
          iconName="AlertTriangle"
        />

        <KpiCard
          title="Completed This Month"
          value={workOrders.filter((w) => w.status === 'Completed').length}
          comparison="Closed out on schedule"
          accent="emerald"
          iconName="CheckCircle2"
        />
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-copper-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-copper-500"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Orders Table */}
      <DataTable
        title="Active Maintenance Registry"
        subtitle="Click any row or 'Edit' to adjust parameters. All mutations persist in LocalStorage."
        data={filteredOrders as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        onRowClick={(item) => openEditModal(item as unknown as WorkOrder)}
        exportFilename="maintenance_work_orders"
      />

      {/* Create Work Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Maintenance Work Order"
        description="Issue preventative or corrective order into local maintenance ledger."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Equipment *</label>
              <select
                {...register('equipmentId')}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
              >
                <option value="">Select Asset...</option>
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.id} — {eq.name}
                  </option>
                ))}
              </select>
              {errors.equipmentId && (
                <span className="text-rose-600 text-[10px] block mt-0.5">{errors.equipmentId.message}</span>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Maintenance Type *</label>
              <select
                {...register('type')}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
              >
                <option value="Preventative">Preventative</option>
                <option value="Corrective">Corrective</option>
                <option value="Emergency">Emergency</option>
                <option value="Inspection">Inspection</option>
                <option value="Overhaul">Overhaul</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Work Order Title *</label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. 500-Hour Hydraulic System Seal Inspection"
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
            />
            {errors.title && (
              <span className="text-rose-600 text-[10px] block mt-0.5">{errors.title.message}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Technical Description *</label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Scope of work, diagnostic observations, safety precautions..."
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
            />
            {errors.description && (
              <span className="text-rose-600 text-[10px] block mt-0.5">{errors.description.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                {...register('priority')}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Lead Technician *</label>
              <input
                type="text"
                {...register('assignedTechnician')}
                placeholder="e.g. Steve Kowalski (Heavy Vehicle)"
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
              />
              {errors.assignedTechnician && (
                <span className="text-rose-600 text-[10px] block mt-0.5">
                  {errors.assignedTechnician.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Planned Start</label>
              <input
                type="date"
                {...register('plannedStartDate')}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Est. Cost (AUD)</label>
              <input
                type="number"
                {...register('estimatedCostAud', { valueAsNumber: true })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-copper-600 hover:bg-copper-700 rounded-md shadow-sm"
            >
              Save & Issue Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Work Order Modal */}
      {editingOrder && (
        <Modal
          isOpen={true}
          onClose={() => setEditingOrder(null)}
          title={`Edit Work Order: ${editingOrder.id}`}
          description="Update status, assigned technician, or task details."
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Equipment</label>
                <select
                  {...register('equipmentId')}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
                >
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.id} — {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Order Status</label>
                <select
                  {...register('status')}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
                >
                  <option value="Open">Open</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                {...register('title')}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                {...register('description')}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Lead Technician</label>
                <input
                  type="text"
                  {...register('assignedTechnician')}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  {...register('priority')}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Planned Start</label>
                <input
                  type="date"
                  {...register('plannedStartDate')}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  {...register('dueDate')}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Est. Cost (AUD)</label>
                <input
                  type="number"
                  {...register('estimatedCostAud', { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-copper-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-copper-600 hover:bg-copper-700 rounded-md shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
