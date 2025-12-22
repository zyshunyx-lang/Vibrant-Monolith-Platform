
import React, { useState } from 'react';
import { getCurrentUser } from '../../platform/core/db';
import { Icon } from '../../platform/ui/basic/Icon';
import { DailyBriefReport as NoticeUserView } from './admin/DailyBriefReport';
import { NoticeDashboard as NoticeAdminDashboard } from './admin/NoticeDashboard';

export const MeetingNoticeModuleEntry: React.FC = () => {
  const user = getCurrentUser();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'duty_admin';
  const [viewMode, setViewMode] = useState<'user' | 'admin'>(isAdmin ? 'admin' : 'user');

  if (!isAdmin) return <NoticeUserView />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200 shadow-inner">
           <button 
            onClick={() => setViewMode('user')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'user' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
           >
             <Icon name="FileText" size={14} /> 查看简报
           </button>
           <button 
            onClick={() => setViewMode('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
           >
             <Icon name="ClipboardList" size={14} /> 分派处置
           </button>
        </div>
      </div>
      {viewMode === 'admin' ? <NoticeAdminDashboard /> : <NoticeUserView />}
    </div>
  );
};
