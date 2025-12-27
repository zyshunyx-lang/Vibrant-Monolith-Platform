
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from './platform/app/MainLayout';
import { AdminLayout } from './platform/app/AdminLayout';
import { LanguageProvider } from './platform/core/i18n';
import { AuthProvider } from './platform/core/AuthContext';
import { LoginPage } from './platform/app/LoginPage';
import { HomeView } from './platform/app/HomeView';
import { RequireModulePermission } from './platform/core/accessControl';

// Admin Components
import { Dashboard } from './platform/admin/Dashboard';
import { UserManager } from './platform/admin/user/UserManager';
import { LogViewer } from './platform/admin/system/LogViewer';
import { ModuleSettings } from './platform/admin/system/ModuleSettings';

// Unified Module Entries
import { DutyModuleEntry } from './modules/duty/index';
import { MenuModuleEntry } from './modules/menu/index';
import { SystemModuleEntry } from './modules/system/index';
import { MeetingModuleEntry } from './modules/meeting/index';
import { AssetsModuleEntry } from './modules/assets/index';
import { MeetingNoticeModuleEntry } from './modules/meetingNotice/index';
import { ToolsModuleEntry } from './modules/tools/index';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Client / Workplace Routes */}
            <Route element={<MainLayout />}>
              <Route index element={<HomeView />} />
              
              <Route 
                path="/duty/*" 
                element={<RequireModulePermission module="duty"><DutyModuleEntry /></RequireModulePermission>} 
              />
              <Route 
                path="/menu/*" 
                element={<RequireModulePermission module="menu"><MenuModuleEntry /></RequireModulePermission>} 
              />
              <Route 
                path="/meeting/*" 
                element={<RequireModulePermission module="meeting"><MeetingModuleEntry /></RequireModulePermission>} 
              />
              <Route 
                path="/meeting-notice/*" 
                element={<RequireModulePermission module="meeting-notice"><MeetingNoticeModuleEntry /></RequireModulePermission>} 
              />
              <Route 
                path="/assets/*" 
                element={<RequireModulePermission module="assets"><AssetsModuleEntry /></RequireModulePermission>} 
              />
              <Route 
                path="/tools/*" 
                element={<RequireModulePermission module="tools"><ToolsModuleEntry /></RequireModulePermission>} 
              />
              <Route 
                path="/system/*" 
                element={<RequireModulePermission module="system"><SystemModuleEntry /></RequireModulePermission>} 
              />
            </Route>

            {/* Admin Console Routes */}
            <Route path="/admin" element={<AdminLayout />}>
               <Route index element={<Dashboard />} />
               <Route path="users" element={<UserManager />} />
               <Route path="logs" element={<LogViewer />} />
               <Route path="system/modules" element={<ModuleSettings />} />
               
               {/* Business Module Admin Routes (Handled inside ModuleEntry or specific routes) */}
               <Route path="duty/*" element={<DutyModuleEntry />} />
               <Route path="menu/*" element={<MenuModuleEntry />} />
               <Route path="meeting/*" element={<MeetingModuleEntry />} />
               <Route path="assets/*" element={<AssetsModuleEntry />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
