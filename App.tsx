
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './platform/app/MainLayout';
import { AdminLayout } from './platform/app/AdminLayout';
import { Dashboard } from './platform/admin/Dashboard';
import { UserManager } from './platform/admin/user/UserManager';
import { LogViewer } from './platform/admin/system/LogViewer';
import { Icon } from './platform/ui/basic/Icon';
import { ColorCard } from './platform/ui/layout/ColorCard';
import { Button } from './platform/ui/basic/Button';

// Business Modules
import { DutyView } from './modules/duty/views/DutyView';
import { DutyDashboard } from './modules/duty/admin/DutyDashboard';

// Temporary Home View Component
const HomeView: React.FC = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <header className="max-w-2xl">
      <h2 className="text-6xl font-black text-slate-900 leading-tight">
        Next-gen <span className="text-indigo-600">Operations</span> for your team.
      </h2>
      <p className="mt-6 text-xl text-slate-500 font-medium leading-relaxed">
        A unified platform built on modular principles to help you manage logistics, 
        personnel, and resources with delightful precision.
      </p>
      <div className="mt-10 flex gap-4">
        <Button size="lg" className="rounded-2xl">Launch Workspace</Button>
        <Button size="lg" variant="secondary" className="rounded-2xl">View Documentation</Button>
      </div>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { title: 'Pluggable Modules', icon: 'Box', desc: 'Scale your operations by adding specialized business modules instantly.' },
        { title: 'Centralized Core', icon: 'Cpu', desc: 'One source of truth for all users, permissions, and security policies.' },
        { title: 'Vibrant Design', icon: 'Palette', desc: 'Crafted for productivity with a modern interface your team will love.' }
      ].map((f, i) => (
        <ColorCard key={i} variant="white" className="hover:border-indigo-200 transition-colors cursor-default">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
            <Icon name={f.icon as any} size={24} />
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h4>
          <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
        </ColorCard>
      ))}
    </div>
  </div>
);

// App Entry Point
const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Main Public/User Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeView />} />
          <Route path="/duty" element={<DutyView />} />
          <Route path="/apps" element={
            <div className="py-20 text-center">
              <Icon name="Search" size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-2xl font-bold text-slate-400">Application Center Coming Soon</h3>
            </div>
          } />
        </Route>

        {/* Admin Specific Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManager />} />
          <Route path="logs" element={<LogViewer />} />
          
          {/* Duty Module Admin */}
          <Route path="duty" element={<DutyDashboard />} />
          
          {/* Generic Module Slot (for future modules) */}
          <Route path="modules/:moduleId" element={
            <div className="py-20 text-center">
               <h3 className="text-2xl font-bold text-slate-400 italic">Module Dashboard Loading...</h3>
            </div>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
