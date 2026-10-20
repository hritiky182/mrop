import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Truck, Layers, Wrench, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { equipmentRepository } from '@/services/repositories/equipmentRepository';
import { geologyRepository } from '@/services/repositories/geologyRepository';
import { maintenanceRepository } from '@/services/repositories/maintenanceRepository';
import { aiRecommendationRepository } from '@/services/repositories/aiRecommendationRepository';
import { productionRepository } from '@/services/repositories/productionRepository';
import { Equipment, GeologicalBlock, WorkOrder, AiRecommendation, OperationalRisk } from '@/types';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Equipment' | 'Geology Block' | 'Work Order' | 'AI Recommendation' | 'Operational Risk';
  link: string;
  badge?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [blocksList, setBlocksList] = useState<GeologicalBlock[]>([]);
  const [ordersList, setOrdersList] = useState<WorkOrder[]>([]);
  const [recsList, setRecsList] = useState<AiRecommendation[]>([]);
  const [risksList, setRisksList] = useState<OperationalRisk[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // Load mock dataset for search indexing
      Promise.all([
        equipmentRepository.getAll(),
        geologyRepository.getAllBlocks(),
        maintenanceRepository.getAll(),
        aiRecommendationRepository.getAll(),
        productionRepository.getOperationalRisks(),
      ]).then(([eq, blk, ord, rec, rsk]) => {
        setEquipmentList(eq);
        setBlocksList(blk);
        setOrdersList(ord);
        setRecsList(rec);
        setRisksList(rsk);
      });
    }
  }, [isOpen]);

  // Global keyboard shortcut Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo<SearchResultItem[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const results: SearchResultItem[] = [];

    // Search Equipment
    equipmentList.forEach((e) => {
      if (
        e.id.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      ) {
        results.push({
          id: e.id,
          title: `${e.id} — ${e.name}`,
          subtitle: `${e.category} • ${e.location} • Status: ${e.status}`,
          category: 'Equipment',
          link: `/engineer/equipment/${e.id}`,
          badge: e.status,
        });
      }
    });

    // Search Geological Blocks
    blocksList.forEach((b) => {
      if (
        b.id.toLowerCase().includes(q) ||
        b.miningZone.toLowerCase().includes(q) ||
        b.benchLevel.toLowerCase().includes(q) ||
        b.oreClassification.toLowerCase().includes(q)
      ) {
        results.push({
          id: b.id,
          title: `${b.id} (${b.miningZone})`,
          subtitle: `${b.benchLevel} • ${b.oreClassification} • Actual: ${b.actualGradeGpt.toFixed(2)} g/t Au`,
          category: 'Geology Block',
          link: `/geologist/blocks/${b.id}`,
          badge: b.reviewStatus,
        });
      }
    });

    // Search Work Orders
    ordersList.forEach((o) => {
      if (
        o.id.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.equipmentName.toLowerCase().includes(q) ||
        o.assignedTechnician.toLowerCase().includes(q)
      ) {
        results.push({
          id: o.id,
          title: `${o.id}: ${o.title}`,
          subtitle: `${o.equipmentName} • Tech: ${o.assignedTechnician} • Priority: ${o.priority}`,
          category: 'Work Order',
          link: `/engineer/maintenance`,
          badge: o.status,
        });
      }
    });

    // Search AI Recommendations
    recsList.forEach((r) => {
      if (
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: r.id,
          title: r.title,
          subtitle: `Category: ${r.category} • Impact: $${(r.estimatedFinancialImpactAud / 1000).toFixed(0)}k AUD`,
          category: 'AI Recommendation',
          link: `/owner/ai-recommendations`,
          badge: r.status,
        });
      }
    });

    // Search Operational Risks
    risksList.forEach((rsk) => {
      if (
        rsk.title.toLowerCase().includes(q) ||
        rsk.potentialImpact.toLowerCase().includes(q) ||
        rsk.affectedDepartment.toLowerCase().includes(q)
      ) {
        results.push({
          id: rsk.id,
          title: rsk.title,
          subtitle: `Dept: ${rsk.affectedDepartment} • Severity: ${rsk.severity} • Status: ${rsk.currentStatus}`,
          category: 'Operational Risk',
          link: `/owner/risks`,
          badge: rsk.severity,
        });
      }
    });

    return results.slice(0, 15);
  }, [query, equipmentList, blocksList, ordersList, recsList, risksList]);

  if (!isOpen) return null;

  const handleSelectResult = (link: string) => {
    navigate(link);
    onClose();
    setQuery('');
  };

  const categoryIcon = {
    Equipment: <Truck className="w-4 h-4 text-copper-600" />,
    'Geology Block': <Layers className="w-4 h-4 text-emerald-600" />,
    'Work Order': <Wrench className="w-4 h-4 text-blue-600" />,
    'AI Recommendation': <Sparkles className="w-4 h-4 text-purple-600" />,
    'Operational Risk': <AlertTriangle className="w-4 h-4 text-amber-600" />,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:p-6 sm:pt-20">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200 transition-all">
          {/* Search Input Bar */}
          <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search equipment, blocks, work orders, AI plans, risks..."
              className="w-full text-sm bg-transparent border-none focus:outline-none placeholder-slate-400 text-slate-800"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-500 rounded border border-slate-200">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 p-2">
            {!query.trim() ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Type equipment ID (e.g. <span className="font-mono text-copper-600">EX-101</span>,{' '}
                <span className="font-mono text-copper-600">HT-204</span>), block (e.g.{' '}
                <span className="font-mono text-copper-600">BLK-Z1-01</span>), work orders, or risks.
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No matching operational entities found for &quot;{query}&quot;.
              </div>
            ) : (
              searchResults.map((item) => (
                <div
                  key={`${item.category}-${item.id}`}
                  onClick={() => handleSelectResult(item.link)}
                  className="p-3 rounded-lg hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-md bg-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                      {categoryIcon[item.category]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 font-medium">
                          {item.category}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-copper-50 text-copper-700 shrink-0 border border-copper-200/50">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-copper-600 transition-colors shrink-0" />
                </div>
              ))
            )}
          </div>

          {/* Search Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Global Search index updated in real-time</span>
            <div className="flex items-center gap-2">
              <span>Navigate with click</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
