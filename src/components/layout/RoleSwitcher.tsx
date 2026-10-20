import React, { useState, useRef, useEffect } from 'react';
import { useAuthRole } from '@/context/AuthRoleContext';
import { UserRole } from '@/types';
import { ROLE_CONFIGS } from '@/config/roles';
import { ChevronDown, Check, UserCheck, Shield } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { role, switchRole } = useAuthRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConfig = ROLE_CONFIGS[role];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: UserRole[] = ['owner', 'engineer', 'geologist', 'investor'];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Demo Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-copper-200/80 bg-copper-50/70 hover:bg-copper-100/70 text-copper-900 transition-all text-xs font-medium shadow-sm group"
        title="Switch Prototype Role (Demonstration Feature)"
      >
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-copper-500 animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-copper-700 bg-white/80 px-1.5 py-0.2 rounded border border-copper-300">
            DEMO ROLE
          </span>
          <span className="font-semibold text-slate-800">{currentConfig.label}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-copper-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Role Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Demonstration Mode
              </span>
              <span className="text-xs font-semibold text-slate-800">
                Switch Operational Persona
              </span>
            </div>
            <Shield className="w-4 h-4 text-copper-600" />
          </div>

          <div className="p-1.5 space-y-1">
            {roles.map((r) => {
              const cfg = ROLE_CONFIGS[r];
              const isSelected = r === role;

              return (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg flex items-start justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-copper-50 text-copper-950 border border-copper-200/60 font-medium'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">{cfg.label}</span>
                      {isSelected && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-copper-600 text-white rounded">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                      {cfg.tagline}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {cfg.userProfile.name}
                    </span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-copper-600 mt-0.5 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50/70 rounded-b-lg">
            <p className="text-[10px] text-slate-500 leading-tight">
              Switching roles updates navigation, KPIs, permissions, and available operational actions without requiring login.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
