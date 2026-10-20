import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { geologyRepository } from '@/services/repositories/geologyRepository';
import { GeologicalBlock } from '@/types';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { formatNumber, formatPercent, formatDate } from '@/utils/formatters';
import { Map, Layers, Compass, ArrowRight, Info, AlertTriangle, Eye } from 'lucide-react';

export const SpatialOverviewPage: React.FC = () => {
  const [blocks, setBlocks] = useState<GeologicalBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBench, setSelectedBench] = useState<string>('All');
  const [selectedBlock, setSelectedBlock] = useState<GeologicalBlock | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    geologyRepository.getAllBlocks().then((data) => {
      setBlocks(data);
      if (data.length > 0) setSelectedBlock(data[0]);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const benches = ['All', 'RL 340m', 'RL 325m', 'RL 310m'];

  const filteredBlocks = selectedBench === 'All'
    ? blocks
    : blocks.filter((b) => b.benchLevel === selectedBench);

  return (
    <div className="space-y-6">
      {/* Header & Disclaimer */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded uppercase tracking-wider">
            Illustrative Spatial Overview — Demo Data
          </span>
          <span className="text-xs text-slate-500">2D Mining Block Visualization</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Mine Pit Bench & Block Spatial Grid
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Interactive schematic representation of open pit benches. Click any geological block to inspect planned versus actual performance, dilution, and fire assays.
        </p>
      </div>

      <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2.5 shadow-2xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Prototype Disclaimer:</strong> This schematic grid is a stylized operational demonstration component, not a validated GIS spatial map or sub-surface wireframe model.
        </span>
      </div>

      {/* Main Spatial Grid and Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Spatial Grid Canvas */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-copper-600" />
                <span className="text-xs font-bold text-slate-800">
                  Open Pit Bench Plan
                </span>
              </div>

              {/* Bench Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Bench Level:</span>
                {benches.map((bench) => (
                  <button
                    key={bench}
                    onClick={() => setSelectedBench(bench)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      selectedBench === bench
                        ? 'bg-navy-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {bench}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Legend */}
            <div className="flex flex-wrap items-center gap-4 py-3 text-[11px] text-slate-600 border-b border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-copper-600" /> High-Grade (&gt;3.5 g/t)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600" /> Medium-Grade
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-300" /> Low-Grade
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500 animate-pulse" /> Critical Variance (&gt;20%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400" /> Pending Review
              </span>
            </div>

            {/* The Stylized Mine Block Grid */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {filteredBlocks.map((block) => {
                const isSelected = selectedBlock?.id === block.id;
                const isCriticalVariance = block.gradeComplianceStatus === 'Variance Critical';
                const isHighVariance = block.gradeComplianceStatus === 'Variance High';
                const isHighGrade = block.actualGradeGpt >= 3.5;
                const isMediumGrade = block.actualGradeGpt >= 2.5 && block.actualGradeGpt < 3.5;

                let cardBg = 'bg-slate-50 border-slate-200 text-slate-800';
                if (isCriticalVariance) {
                  cardBg = 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-500/50';
                } else if (isHighVariance) {
                  cardBg = 'bg-amber-50 border-amber-400 text-amber-950';
                } else if (isHighGrade) {
                  cardBg = 'bg-copper-50 border-copper-400 text-copper-950 font-medium';
                } else if (isMediumGrade) {
                  cardBg = 'bg-sky-50 border-sky-300 text-sky-950';
                }

                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlock(block)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all duration-150 transform hover:scale-102 hover:shadow-md flex flex-col justify-between min-h-[110px] ${cardBg} ${
                      isSelected ? 'ring-3 ring-copper-500 shadow-lg scale-102' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs">{block.id}</span>
                        <span className="text-[10px] text-slate-500">{block.benchLevel}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                        {block.miningZone}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/50">
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono font-bold text-sm">
                          {block.actualGradeGpt.toFixed(2)}
                          <span className="text-[10px] font-normal text-slate-500 ml-0.5">g/t</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {formatNumber(block.actualTonnage / 1000, 0)}kt
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[9px] uppercase font-bold">
                        <span className="truncate">{block.reviewStatus}</span>
                        {isCriticalVariance && (
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Grid Coordinates: North Pit Footwall to Stage 2 South Cutback</span>
            <span>Total Shown: {filteredBlocks.length} Blocks</span>
          </div>
        </div>

        {/* Right: Block Inspector Detail Card */}
        {selectedBlock && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-copper-700 bg-copper-50 px-2.5 py-1 rounded border border-copper-200">
                    {selectedBlock.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">
                    {selectedBlock.miningZone}
                  </h3>
                  <span className="text-xs text-slate-500">{selectedBlock.benchLevel}</span>
                </div>

                <StatusBadge status={selectedBlock.reviewStatus} />
              </div>

              {/* Grade and Tonnage Comparison */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Classification:</span>
                  <span className="font-semibold text-slate-800">{selectedBlock.oreClassification}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Model Grade:</span>
                  <span className="font-mono text-slate-700">{selectedBlock.plannedGradeGpt.toFixed(2)} g/t Au</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Actual Assay Grade:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedBlock.actualGradeGpt.toFixed(2)} g/t Au</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Grade Variance:</span>
                  <span
                    className={`font-mono font-bold ${
                      (selectedBlock.gradeVariancePct ?? 0) <= -15 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {formatPercent(selectedBlock.gradeVariancePct ?? 0, 1, true)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Dilution Ingress:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedBlock.dilutionPercentage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Milled Tonnage:</span>
                  <span className="font-mono text-slate-800">{formatNumber(selectedBlock.actualTonnage)} t</span>
                </div>
              </div>

              {/* Geological Observations */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">Geological Review Notes:</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {selectedBlock.geologicalNotes || 'Normal basalt stockwork quartz veins. Reconciling within normal JORC confidence bounds.'}
                </p>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <div>Lead Geologist: <span className="font-medium text-slate-800">{selectedBlock.assignedGeologist}</span></div>
                <div>Last Updated: <span className="font-mono text-slate-600">{formatDate(selectedBlock.lastUpdatedDate)}</span></div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => navigate(`/geologist/blocks/${selectedBlock.id}`)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-copper-600 hover:bg-copper-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Open Full Block Dossier</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
