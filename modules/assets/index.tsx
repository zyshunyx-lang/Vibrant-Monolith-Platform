
import React, { useState } from 'react';
import { getCurrentUser } from '../../platform/core/db';
import { Icon } from '../../platform/ui/basic/Icon';
import { AssetLedger as AssetUserView } from './admin/AssetLedger'; // 暂时共用 Ledger 视图，未来可精简
import { AssetsDashboard as AssetAdminDashboard } from './admin/AssetsDashboard';

export const AssetsModuleEntry: React.FC = () => {
  const user = getCurrentUser();
  const isAdmin = user?.role === 'super_admin';
  const [viewMode, setViewMode] = useState<'user' | 'admin'>(isAdmin ? 'admin' : 'user');

  if (!isAdmin) return <AssetUserView />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200 shadow-inner">
           <button 
            onClick={() => setViewMode('user')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'user' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
           >
             <Icon name="Search" size={14} /> 资产查询
           </button>
           <button 
            onClick={() => setViewMode('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
           >
             <Icon name="Settings" size={14} /> 管理后台
           </button>
        </div>
      </div>
      {viewMode === 'admin' ? <AssetAdminDashboard /> : <AssetUserView />}
    </div>
  );
};
