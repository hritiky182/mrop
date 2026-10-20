import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuthRole } from '@/context/AuthRoleContext';
import { useProject } from '@/context/ProjectContext';
import { ROLE_CONFIGS } from '@/config/roles';
import * as Icons from 'lucide-react';
import { ChevronLeft, ChevronRight, Layers, LogOut } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { role, user, logout } = useAuthRole();
  const { project } = useProject();
  const roleConfig = ROLE_CONFIGS[role];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0F1E30] text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-[#0A1522]">
          <Link to={roleConfig.homePath} className="flex items-center gap-3 overflow-hidden group">
            <div className="w-9 h-9 rounded-lg bg-copper-500/20 border border-copper-500/40 flex items-center justify-center text-copper-400 group-hover:scale-105 transition-transform shrink-0">
              <Layers className="w-5 h-5 text-copper-400" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-sm font-bold tracking-tight text-white block truncate leading-tight">
                  RED RIDGE
                </span>
                <span className="text-[10px] font-medium tracking-wider uppercase text-copper-400 block truncate">
                  Mining Operations
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Project Selector / Status Badge */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-slate-800/60 bg-[#122235]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Active Site
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs font-semibold text-white truncate">{project.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{project.region} • {project.primaryCommodity}</p>
          </div>
        )}

        {/* Role Identity Banner */}
        {!isCollapsed && (
          <div className="px-4 py-2 border-b border-slate-800/40 flex items-center justify-between text-[11px] bg-slate-900/50">
            <span className="text-slate-400 font-medium">Persona:</span>
            <span className="font-semibold text-copper-400 bg-copper-950/60 px-2 py-0.5 rounded border border-copper-800/60 truncate max-w-[130px]">
              {roleConfig.label}
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {roleConfig.navItems.map((item) => {
            const IconComponent = (Icons[item.iconName as keyof typeof Icons] as React.ElementType) || Icons.Circle;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === roleConfig.homePath}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-copper-500 text-white shadow-md font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <IconComponent
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-copper-400'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="flex-1 truncate tracking-tight">{item.name}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-copper-400 border border-copper-800/50'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Profile Card with Sign Out */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0A1522]">
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-copper-600/30 border border-copper-500/50 flex items-center justify-center text-xs font-bold text-copper-300 shrink-0">
                {user.avatar}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.title}</p>
                  <p className="text-[9px] text-copper-400/90 truncate">{user.department}</p>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
              title="Sign Out / Lock Terminal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
