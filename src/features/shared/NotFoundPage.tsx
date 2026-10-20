import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthRole } from '@/context/AuthRoleContext';
import { ROLE_CONFIGS } from '@/config/roles';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { role } = useAuthRole();
  const currentConfig = ROLE_CONFIGS[role];

  return (
    <div className="py-20 text-center flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <Compass className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">404 — Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-2">
        The requested mining operations route or asset record does not exist.
      </p>
      <Link
        to={currentConfig.homePath}
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-copper-600 text-white rounded-lg text-xs font-medium hover:bg-copper-700 transition-colors shadow-sm"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
