import React from 'react';
import { useAuthRole } from '@/context/AuthRoleContext';
import { ROLE_CONFIGS } from '@/config/roles';
import { ShieldAlert, ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AccessDeniedPage: React.FC = () => {
  const { role, switchRole } = useAuthRole();
  const currentConfig = ROLE_CONFIGS[role];

  return (
    <div className="py-16 px-4 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
        Role Access Restriction
      </h2>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
        Your current active prototype persona (<span className="font-semibold text-slate-800">{currentConfig.label}</span>) is restricted from viewing this technical operational route.
      </p>

      <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-left w-full">
        <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
          Demonstration Role Switcher
        </h4>
        <p className="text-[11px] text-slate-500 mb-3">
          To view this page, switch to an authorized operational persona using the role switcher in the top header or quick-select below:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {(['owner', 'engineer', 'geologist', 'investor'] as const).map((r) => {
            const cfg = ROLE_CONFIGS[r];
            return (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`p-2 rounded-lg text-xs font-medium border text-left transition-colors flex items-center justify-between ${
                  r === role
                    ? 'bg-copper-50 border-copper-300 text-copper-900'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{cfg.label}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            );
          })}
        </div>
      </div>

      <Link
        to={currentConfig.homePath}
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Return to {currentConfig.label} Dashboard</span>
      </Link>
    </div>
  );
};
