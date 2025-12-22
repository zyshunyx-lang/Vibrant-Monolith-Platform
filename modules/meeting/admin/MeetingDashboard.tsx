
import React, { useState } from 'react';
import { loadDb } from '../../../platform/core/db';
import { Icon } from '../../../platform/ui/basic/Icon';
import { RoomManager } from './RoomManager';
import { MeetingAuditPanel } from './MeetingAuditPanel';
import { MeetingStatsPanel } from './MeetingStatsPanel';
import { ExternalMeetingManager } from './ExternalMeetingManager';
import { MeetingModuleSchema } from '../types';

type TabType = 'rooms' | 'bookings' | 'external' | 'stats';

export const MeetingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('rooms');
  const db = loadDb();
  
  const meetingData = db.modules.meeting as MeetingModuleSchema;
  const pendingCount = meetingData.bookings?.filter(b => b.status === 'pending').length || 0;
  const externalPending = meetingData.externalMeetings?.filter(m => m.status === 'pending').length || 0;

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-20 no-print">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            会议资源管理
            <div className="px-3 py-1 bg-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl border border-indigo-200">
               Meeting v1.2
            </div>
          </h2>
          <p className="text-slate-500 font-medium mt-1">管理会议室硬件资源、监控预定流量及处理外部会议通知。</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[24px] shadow-inner self-start flex-wrap gap-1 border border-slate-200/50">
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'rooms' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="Layout" size={16} />
            会议室管理
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'bookings' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="CheckSquare" size={16} />
            预定审批
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                {pendingCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('external')}
            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'external' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="Globe" size={16} />
            外来会议
            {externalPending > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                {externalPending}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'stats' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="BarChart" size={16} />
            使用统计
          </button>
        </div>
      </header>

      <div className="transition-all duration-300 min-h-[500px]">
        {activeTab === 'rooms' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <RoomManager />
          </div>
        )}
        {activeTab === 'bookings' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <MeetingAuditPanel />
          </div>
        )}
        {activeTab === 'external' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ExternalMeetingManager />
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <MeetingStatsPanel />
          </div>
        )}
      </div>
    </div>
  );
};
