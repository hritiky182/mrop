import React, { useState, useEffect } from 'react';
import { productionRepository } from '@/services/repositories/productionRepository';
import { Milestone } from '@/types';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { formatDate } from '@/utils/formatters';
import { Calendar, CheckCircle2, Clock, AlertTriangle, ArrowRight, Layers } from 'lucide-react';

export const ProjectTimelinePage: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    productionRepository.getMilestones().then((data) => {
      setMilestones(data);
      if (data.length > 0) setSelectedMilestone(data[6]); // default select Stage 2
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Project Development Timeline & Gantt Schedule</h2>
        <p className="text-xs text-slate-500 mt-1">
          Multi-phase capital delivery overview showing critical path dependencies, ramp-up phases, and schedule variances.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Gantt-style container */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-copper-600" />
              <h3 className="text-sm font-semibold text-slate-900">Capital Development Schedule (2024 — 2027)</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Current: Q4 2026</span>
          </div>

          {/* Timeline Bar Progression */}
          <div className="mt-6 space-y-4">
            {milestones.map((m) => {
              const isSelected = selectedMilestone?.id === m.id;
              const isDone = m.status === 'Completed';
              const isAtRisk = m.status === 'At Risk';

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMilestone(m)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-copper-500 bg-copper-50/40 shadow-sm'
                      : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{m.id}</span>
                        <span className="font-semibold text-xs text-slate-800">{m.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{m.category}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <StatusBadge status={m.status} size="sm" />
                      <span className="font-mono text-[10px] text-slate-500 block mt-1">
                        {formatDate(m.plannedDate, 'MMM yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Gantt Progress Bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone ? 'bg-emerald-600' : isAtRisk ? 'bg-amber-500' : 'bg-copper-600'
                      }`}
                      style={{ width: `${m.completionPercentage}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {m.actualDate ? `Delivered: ${formatDate(m.actualDate)}` : 'In Progress'}
                    </span>
                    <span className="font-mono font-bold text-slate-800">{m.completionPercentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Inspector Card */}
        {selectedMilestone && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-copper-700 bg-copper-50 px-2.5 py-1 rounded border border-copper-200">
                    {selectedMilestone.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">
                    {selectedMilestone.title}
                  </h3>
                  <span className="text-xs text-slate-500">{selectedMilestone.category}</span>
                </div>
                <StatusBadge status={selectedMilestone.status} />
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Planned Date:</span>
                  <span className="font-mono font-medium text-slate-800">{formatDate(selectedMilestone.plannedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Actual Delivery:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {selectedMilestone.actualDate ? formatDate(selectedMilestone.actualDate) : 'Pending Delivery'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Progress:</span>
                  <span className="font-mono font-bold text-copper-700">{selectedMilestone.completionPercentage}%</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">Executive Summary:</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {selectedMilestone.summary}
                </p>
              </div>

              {selectedMilestone.dependencies && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1">Schedule Dependencies:</h4>
                  <div className="flex gap-1.5">
                    {selectedMilestone.dependencies.map((dep) => (
                      <span key={dep} className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold text-slate-700">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
              Audited by Independent Competent Person & Board Technical Committee
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
