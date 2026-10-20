import React, { useState } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { RoleSwitcher } from './RoleSwitcher';
import { useNotifications } from '@/context/NotificationContext';
import { useProject } from '@/context/ProjectContext';
import { useAuthRole } from '@/context/AuthRoleContext';
import { NotificationPanel } from '@/components/common/NotificationPanel';
import { formatDate } from '@/utils/formatters';
import { Menu, Search, Bell, Calendar, MapPin, LogOut } from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  pageTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenSearch,
  pageTitle,
}) => {
  const { unreadCount } = useNotifications();
  const { project } = useProject();
  const { logout } = useAuthRole();
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between gap-4 shadow-sm">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <Breadcrumbs />
          {pageTitle && (
            <h1 className="text-base font-bold text-slate-900 tracking-tight truncate hidden sm:block">
              {pageTitle}
            </h1>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Project Selector Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-copper-600" />
          <span className="font-semibold text-slate-800">{project.code}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600 truncate max-w-[140px]">{project.name}</span>
        </div>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs transition-colors shadow-sm"
          title="Search entire platform (Cmd/Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline text-slate-600">Global Search...</span>
          <kbd className="hidden md:inline px-1.5 py-0.2 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Mock Reporting Date */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/70 text-slate-600 text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{formatDate(project.reportingDate, 'dd MMM yyyy')}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifPanelOpen(!isNotifPanelOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Operational Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationPanel
            isOpen={isNotifPanelOpen}
            onClose={() => setIsNotifPanelOpen(false)}
          />
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Prototype Role Switcher */}
        <RoleSwitcher />

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold"
          title="Sign Out of Operations Console"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
