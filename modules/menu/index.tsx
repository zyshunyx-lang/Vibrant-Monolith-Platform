
import React, { useState } from 'react';
import { getCurrentUser } from '../../platform/core/db';
import { Icon } from '../../platform/ui/basic/Icon';
import { MenuView } from './views/MenuView';
import { MenuDashboard } from './admin/MenuDashboard';

export const MenuModuleEntry: React.FC = () => {
  const user = getCurrentUser();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'menu_admin';
  const [viewMode, setViewMode] = useState<'user' | 'admin'>(isAdmin ? 'admin' : 'user');

  if (!isAdmin) return <MenuView />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200 shadow-inner">
           <button 
            onClick={() => setViewMode('user')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'user' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}
           >
             <Icon name="Utensils" size={14} /> 今日菜谱
           </button>
           <button 
            onClick={() => setViewMode('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'admin' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}
           >
             <Icon name="Settings" size={14} /> 后台管理
           </button>
        </div>
      </div>
      {viewMode === 'admin' ? <MenuDashboard /> : <MenuView />}
    </div>
  );
};
