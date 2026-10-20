import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '@/types';
import { PROTOTYPE_USERS, ROLE_CONFIGS } from '@/config/roles';
import { getStoredItem, setStoredItem, removeStoredItem, STORAGE_KEYS } from '@/utils/storage';
import { useNavigate } from 'react-router-dom';

interface AuthRoleContextType {
  role: UserRole;
  user: UserProfile;
  isAuthenticated: boolean;
  login: (role: UserRole, email?: string, rememberMe?: boolean) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  canAccessPath: (path: string) => boolean;
}

const AuthRoleContext = createContext<AuthRoleContextType | undefined>(undefined);

export const AuthRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return getStoredItem<boolean>(STORAGE_KEYS.AUTH_SESSION, false);
  });

  const [role, setRole] = useState<UserRole>(() => {
    return getStoredItem<UserRole>(STORAGE_KEYS.CURRENT_ROLE, 'owner');
  });

  const navigate = useNavigate();

  const user = PROTOTYPE_USERS[role];

  const login = (selectedRole: UserRole, email?: string, rememberMe: boolean = true) => {
    setIsAuthenticated(true);
    setRole(selectedRole);
    setStoredItem(STORAGE_KEYS.AUTH_SESSION, true);
    setStoredItem(STORAGE_KEYS.CURRENT_ROLE, selectedRole);
    if (rememberMe && email) {
      setStoredItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
    }

    const targetHome = ROLE_CONFIGS[selectedRole].homePath;
    navigate(targetHome, { replace: true });
  };

  const logout = () => {
    setIsAuthenticated(false);
    removeStoredItem(STORAGE_KEYS.AUTH_SESSION);
    navigate('/login');
  };

  const switchRole = (newRole: UserRole) => {
    setStoredItem(STORAGE_KEYS.CURRENT_ROLE, newRole);
    setRole(newRole);

    const targetHome = ROLE_CONFIGS[newRole].homePath;
    navigate(targetHome, { replace: true });
  };

  const canAccessPath = (pathname: string): boolean => {
    if (pathname === '/settings' || pathname === '/access-denied') return true;
    const allowedPrefix = `/${role}`;
    return pathname.startsWith(allowedPrefix);
  };

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.CURRENT_ROLE, role);
  }, [role]);

  return (
    <AuthRoleContext.Provider
      value={{
        role,
        user,
        isAuthenticated,
        login,
        logout,
        switchRole,
        canAccessPath,
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = (): AuthRoleContextType => {
  const context = useContext(AuthRoleContext);
  if (!context) {
    throw new Error('useAuthRole must be used within an AuthRoleProvider');
  }
  return context;
};
