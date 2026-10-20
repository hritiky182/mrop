import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthRoleProvider } from '@/context/AuthRoleContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ProjectProvider } from '@/context/ProjectContext';
import { AppRoutes } from '@/router/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthRoleProvider>
        <NotificationProvider>
          <ProjectProvider>
            <AppRoutes />
          </ProjectProvider>
        </NotificationProvider>
      </AuthRoleProvider>
    </BrowserRouter>
  );
};

export default App;
