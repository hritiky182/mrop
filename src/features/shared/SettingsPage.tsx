import React, { useState } from 'react';
import { useAuthRole } from '@/context/AuthRoleContext';
import { useNotifications } from '@/context/NotificationContext';
import { useProject } from '@/context/ProjectContext';
import { ROLE_CONFIGS, PROTOTYPE_USERS } from '@/config/roles';
import { getDataSourceConfig, setDataSourceMode, DataSourceMode } from '@/config/dataSource';
import { Database, Shield, Server, Check, Info, FileSpreadsheet, Cpu, Lock, Sparkles } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { role, switchRole } = useAuthRole();
  const { showToast } = useNotifications();
  const { project } = useProject();

  const [dataSourceConfig, setDataSourceConfigState] = useState(getDataSourceConfig());

  const handleDataSourceChange = (mode: DataSourceMode) => {
    setDataSourceMode(mode);
    setDataSourceConfigState(getDataSourceConfig());
    showToast(
      'Data Source Updated',
      `Application data source set to ${mode.toUpperCase()} repository mode.`,
      'info'
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Platform Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure demonstration personas, data persistence layers, and architectural simulation parameters.
        </p>
      </div>

      {/* Demo Persona Switcher */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-copper-600" />
          <h3 className="text-sm font-semibold text-slate-900">Prototype Role & Access Control</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Select a role to demonstrate dedicated perspectives, permission restrictions, and role-tailored dashboards.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['owner', 'engineer', 'geologist', 'investor'] as const).map((r) => {
            const cfg = ROLE_CONFIGS[r];
            const isSelected = r === role;
            const usr = PROTOTYPE_USERS[r];

            return (
              <div
                key={r}
                onClick={() => switchRole(r)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-copper-500 bg-copper-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{cfg.label}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{cfg.tagline}</span>
                  </div>
                  {isSelected ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-copper-600 text-white rounded">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Switch</span>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100/80 text-[11px] text-slate-500 flex items-center justify-between">
                  <span className="truncate">{usr.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{usr.department}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Static vs API Data Source Architecture */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-copper-600" />
          <h3 className="text-sm font-semibold text-slate-900">Data Source Architecture</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          The platform employs clean repository contracts. Switch between local deterministic mock repositories and future REST API backends.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div
            onClick={() => handleDataSourceChange('mock')}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              dataSourceConfig.mode === 'mock'
                ? 'border-copper-500 bg-copper-50/50 shadow-sm'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Deterministic Static Mock (Default)</span>
              {dataSourceConfig.mode === 'mock' && <Check className="w-4 h-4 text-copper-600" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Zero backend dependencies. Operations and mutations persist to browser LocalStorage.
            </p>
          </div>

          <div
            onClick={() => handleDataSourceChange('api')}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              dataSourceConfig.mode === 'api'
                ? 'border-copper-500 bg-copper-50/50 shadow-sm'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Live REST Microservices (Future)</span>
              {dataSourceConfig.mode === 'api' && <Check className="w-4 h-4 text-copper-600" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Directs repository calls through <code className="text-copper-700 bg-slate-100 px-1 py-0.5 rounded font-mono">apiClient</code> to configured REST endpoints.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Configured REST Base URL:</span>
            <span className="font-mono text-slate-600 text-[11px]">{dataSourceConfig.apiBaseUrl}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Mock Simulated Latency:</span>
            <span className="font-mono text-slate-600 text-[11px]">{dataSourceConfig.simulatedDelayMs} ms</span>
          </div>
        </div>
      </div>

      {/* Recommended Scalable Backend & AI Stack Architecture */}
      <div className="bg-gradient-to-br from-slate-900 to-[#14283F] text-white rounded-lg border border-slate-700 p-5 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-4 h-4 text-copper-400" />
          <h3 className="text-sm font-semibold text-white">Target Production Architecture (Python + FastAPI + TimescaleDB)</h3>
          <span className="px-2 py-0.5 text-[9px] font-bold bg-copper-500/20 text-copper-300 border border-copper-400/30 rounded uppercase">
            Cost-Effective & Scalable
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          The frontend data contracts and repositories are designed to map 1:1 to this modern backend specification:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-copper-300 mb-1">
              <Server className="w-3.5 h-3.5" />
              <span>Backend Framework</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              <strong>Python (FastAPI)</strong>: High-throughput async framework with native Python AI/ML ecosystem integration (pandas, numpy, scikit-learn).
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Engine & Structured Outputs</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              <strong>OpenAI GPT-4o / Claude 3.5 Sonnet API</strong>: JSON Structured Outputs guaranteeing prescriptive pivot plans map precisely into UI tables.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-blue-400 mb-1">
              <Database className="w-3.5 h-3.5" />
              <span>Database & Time-Series</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              <strong>PostgreSQL + TimescaleDB</strong>: Hypertable partitioning optimized for fleet telematic streams, grade variances, and mill trends.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-purple-400 mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Hosting & Defense-Grade Security</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              <strong>AWS / Google Cloud + E2E Encryption</strong>: Secures confidential reserve calculations, assay results, and drill coordinates from competitors.
            </p>
          </div>
        </div>
      </div>

      {/* System Project Information */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Mining Tenement Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Project Name</span>
            <span className="font-semibold text-slate-800">{project.name}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Location</span>
            <span className="font-semibold text-slate-800">{project.location}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Primary Commodity</span>
            <span className="font-semibold text-slate-800">{project.primaryCommodity}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Operational Status</span>
            <span className="font-semibold text-emerald-700">{project.operationalStatus}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Current Mine Phase</span>
            <span className="font-semibold text-slate-800">{project.currentPhase}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">System Build</span>
            <span className="font-mono text-slate-600">v1.4.2-PROTOTYPE (Frontend Only)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
