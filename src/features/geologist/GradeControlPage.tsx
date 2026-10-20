import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { geologyRepository } from '@/services/repositories/geologyRepository';
import { GeologicalBlock, OreClassification } from '@/types';
import { formatDate } from '@/utils/formatters';
import { Layers, Filter, CheckCircle, AlertTriangle } from 'lucide-react';

export const GradeControlPage: React.FC = () => {
  const [blocks, setBlocks] = useState<GeologicalBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoneFilter, setZoneFilter] = useState('All');
  const [complianceFilter, setComplianceFilter] = useState('All');
  const [samplingFilter, setSamplingFilter] = useState('All');

  const navigate = useNavigate();

  useEffect(() => {
    geologyRepository.getAllBlocks().then((data) => {
      setBlocks(data);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const compliantCount = blocks.filter((b) => b.gradeComplianceStatus === 'Compliant').length;
  const highGradeCount = blocks.filter((b) => b.oreClassification === 'High-Grade Ore').length;

  const filteredBlocks = blocks.filter((b) => {
    const matchZone = zoneFilter === 'All' || b.miningZone.toLowerCase().includes(zoneFilter.toLowerCase());
    const matchCompliance = complianceFilter === 'All' || b.gradeComplianceStatus === complianceFilter;
    const matchSampling = samplingFilter === 'All' || b.samplingStatus === samplingFilter;
    return matchZone && matchCompliance && matchSampling;
  });

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
      header: 'Mining Sector & Bench',
      render: (item: GeologicalBlock) => (
        <div>
          <span className="font-semibold text-slate-900 block">{item.miningZone}</span>
          <span className="text-[11px] text-slate-500">{item.benchLevel}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'plannedGradeGpt',
      header: 'Target Cut-Off Grade',
      render: (item: GeologicalBlock) => (
        <span className="font-mono text-slate-600">{item.plannedGradeGpt.toFixed(2)} g/t Au</span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'actualGradeGpt',
      header: 'Actual Milled Grade',
      render: (item: GeologicalBlock) => (
        <span className="font-mono font-bold text-slate-900">{item.actualGradeGpt.toFixed(2)} g/t Au</span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'oreClassification',
      header: 'Ore Classification',
      render: (item: GeologicalBlock) => (
        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-800">
          {item.oreClassification}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'samplingStatus',
      header: 'Sampling Status',
      render: (item: GeologicalBlock) => <StatusBadge status={item.samplingStatus} size="sm" />,
      sortable: true,
    },
    {
      key: 'gradeComplianceStatus',
      header: 'Grade Compliance',
      render: (item: GeologicalBlock) => (
        <StatusBadge status={item.gradeComplianceStatus} size="sm" />
      ),
      sortable: true,
    },
    {
      key: 'assignedGeologist',
      header: 'Lead Geologist',
      render: (item: GeologicalBlock) => (
        <span className="text-slate-700 text-xs truncate block max-w-[140px]">{item.assignedGeologist}</span>
      ),
      sortable: true,
    },
    {
      key: 'lastUpdatedDate',
      header: 'Updated',
      render: (item: GeologicalBlock) => (
        <span className="text-[11px] font-mono text-slate-500">{formatDate(item.lastUpdatedDate, 'dd MMM')}</span>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Grade Control & Ore Classification</h2>
        <p className="text-xs text-slate-500 mt-1">
          Daily dig face boundary delineation, blast hole grade reconciliation, and cut-off classification monitoring.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Grade Compliance Rate"
          value={`${((compliantCount / blocks.length) * 100).toFixed(1)}%`}
          comparison={`${compliantCount} of ${blocks.length} blocks compliant`}
          accent="emerald"
          iconName="CheckCircle"
        />

        <KpiCard
          title="High-Grade Ore Blocks"
          value={highGradeCount}
          comparison="Assaying > 3.5 g/t Au"
          accent="copper"
          iconName="Layers"
        />

        <KpiCard
          title="Under Active Sampling"
          value={blocks.filter((b) => b.samplingStatus === 'Under Sampling').length}
          comparison="Main Cutback Central"
          accent="navy"
          iconName="Compass"
        />

        <KpiCard
          title="Critical Variance Alert"
          value={blocks.filter((b) => b.gradeComplianceStatus === 'Variance Critical').length}
          comparison="Stage 2 & North Pit Footwall"
          accent="rose"
          iconName="AlertTriangle"
        />
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Zone:</span>
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 font-medium"
          >
            <option value="All">All Sectors</option>
            <option value="North Pit">North Pit</option>
            <option value="Stage 2">Stage 2 South</option>
            <option value="Main Cutback">Main Cutback</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Compliance:</span>
          <select
            value={complianceFilter}
            onChange={(e) => setComplianceFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Compliant">Compliant</option>
            <option value="Variance High">Variance High</option>
            <option value="Variance Critical">Variance Critical</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Sampling:</span>
          <select
            value={samplingFilter}
            onChange={(e) => setSamplingFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 font-medium"
          >
            <option value="All">All Sampling Stages</option>
            <option value="Completed">Completed</option>
            <option value="Pending Assays">Pending Assays</option>
            <option value="Under Sampling">Under Sampling</option>
          </select>
        </div>
      </div>

      <DataTable
        title="Grade Control Roster"
        subtitle="Click any block to inspect full assay drill holes, dilution ratios, and variance history"
        data={filteredBlocks as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        keyExtractor={(item) => String(item.id)}
        onRowClick={(item) => navigate(`/geologist/blocks/${item.id}`)}
        exportFilename="grade_control_records"
      />
    </div>
  );
};
