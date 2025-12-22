
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from './platform/app/MainLayout';
import { LanguageProvider } from './platform/core/i18n';
import { LoginPage } from './platform/app/LoginPage';
import { HomeView } from './platform/app/HomeView';

// Unified Module Entries (The "Switchers")
import { DutyModuleEntry } from './modules/duty/index';
import { MenuModuleEntry } from './modules/menu/index';
import { SystemModuleEntry } from './modules/system/index';
import { MeetingModuleEntry } from './modules/meeting/index';
import { AssetsModuleEntry } from './modules/assets/index';
import { MeetingNoticeModuleEntry } from './modules/meetingNotice/index';

// --- Auth Guard ---
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const session = localStorage.getItem('APP_SESSION');
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* 所有功能统一在 MainLayout 下，通过首页模块卡片进入 */}
          <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
            <Route index element={<HomeView />} />
            
            {/* 顶级扁平化路由：每个路由对应一个功能领域的 index 入口 */}
            <Route path="/duty" element={<DutyModuleEntry />} />
            <Route path="/menu" element={<MenuModuleEntry />} />
            <Route path="/meeting" element={<MeetingModuleEntry />} />
            <Route path="/meeting-notice" element={<MeetingNoticeModuleEntry />} />
            <Route path="/assets" element={<AssetsModuleEntry />} />
            <Route path="/system" element={<SystemModuleEntry />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;
