import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthRole } from '@/context/AuthRoleContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuthRole();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect unauthenticated requests to /login and preserve destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
