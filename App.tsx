
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

import { MainLayout } from './platform/app/MainLayout';
import { AdminLayout } from './platform/app/AdminLayout';
import { Dashboard } from './platform/admin/Dashboard';
import { UserManager } from './platform/admin/user/UserManager';
import { LogViewer } from './platform/admin/system/LogViewer';
import { Icon } from './platform/ui/basic/Icon';
import { ColorCard } from './platform/ui/layout/ColorCard';
import { Button } from './platform/ui/basic/Button';
import { LanguageProvider, useTranslation } from './platform/core/i18n';
import { LoginPage } from './platform/app/LoginPage';
import { getCurrentUser } from './platform/core/db';
import { UserRole } from './platform/core/types';

// Business Modules
import { DutyView } from './modules/duty/views/DutyView';
import { DutyDashboard } from './modules/duty/admin/DutyDashboard';
import { MenuView } from './modules/menu/views/MenuView';

// --- Auth Guard (DISABLED FOR DEBUGGING) ---
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  // Directly return children to skip login during development
  return children;
};

// --- Role Guard (DISABLED FOR DEBUGGING) ---
const RequireAdmin: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  // Directly return children to skip role checks during development
  return children;
};

// Helper component to use translation hook inside Routes
const AppsCenter: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-900">{t('apps.title')}</h2>
        <p className="text-slate-500 font-medium">{t('apps.subtitle')}</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Duty Module Card */}
        <Link to="/duty" className="block group">
          <ColorCard variant="blue" className="h-full hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl text-white">
                <Icon name="CalendarClock" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">{t('module.duty.name')}</h3>
            </div>
            <p className="text-blue-100 font-medium">{t('module.duty.desc')}</p>
          </ColorCard>
        </Link>

        {/* Menu Module Card */}
        <Link to="/menu" className="block group">
          <ColorCard variant="orange" className="h-full hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl text-white">
                <Icon name="Utensils" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">{t('module.menu.name')}</h3>
            </div>
            <p className="text-orange-100 font-medium">{t('module.menu.desc')}</p>
          </ColorCard>
        </Link>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* User Area */}
          <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
            <Route path="/" element={<Navigate to="/apps" replace />} />
            <Route path="/apps" element={<AppsCenter />} />
            <Route path="/duty" element={<DutyView />} />
            <Route path="/menu" element={<MenuView />} />
          </Route>

          {/* Admin Area */}
          <Route path="/admin" element={<RequireAuth><RequireAdmin><AdminLayout /></RequireAdmin></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManager />} />
            <Route path="logs" element={<LogViewer />} />
            
            {/* Duty Module Admin */}
            <Route path="duty" element={<DutyDashboard />} />
            
            <Route path="modules/:moduleId" element={
              <div className="py-20 text-center">
                 <h3 className="text-2xl font-bold text-slate-400 italic">Module Dashboard Loading...</h3>
              </div>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;
