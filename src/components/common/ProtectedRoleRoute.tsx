import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthRole } from '@/context/AuthRoleContext';
import { UserRole } from '@/types';
import { getStoredItem, STORAGE_KEYS } from '@/utils/storage';
import { ROLE_CONFIGS } from '@/config/roles';

interface ProtectedRoleRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoleRoute: React.FC<ProtectedRoleRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { role } = useAuthRole();
  const location = useLocation();

  // Read stored role synchronously as fallback to prevent any state propagation race conditions
  const storedRole = getStoredItem<UserRole>(STORAGE_KEYS.CURRENT_ROLE, role);
  const activeRole = role || storedRole || 'owner';

  if (!allowedRoles.includes(activeRole)) {
    // Seamlessly redirect to the user's current role dashboard without flashing /access-denied
    const targetHome = ROLE_CONFIGS[activeRole]?.homePath || '/owner';
    return <Navigate to={targetHome} replace />;
  }

  return <>{children}</>;
};
