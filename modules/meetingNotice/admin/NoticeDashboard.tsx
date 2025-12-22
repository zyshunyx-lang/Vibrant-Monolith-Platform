
import React, { useState } from 'react';
import { Icon } from '../../../platform/ui/basic/Icon';
import { NoticeWorkbench } from './NoticeWorkbench';
import { DailyBriefReport } from './DailyBriefReport';
import { NoticeStats } from './NoticeStats';

type TabType = 'workbench' | 'report' | 'stats';

export const NoticeDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('workbench');

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20 no-print">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            会议通知处置中心
            <div className="px-3 py-1 bg-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl border border-indigo-200">
               Notice OS v1.0
            </div>
          </h2>
          <p className="text-slate-500 font-medium mt-1">智能提取外来通知，一键分派保障任务，自动生成领导日程简报。</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[24px] shadow-inner self-start flex-wrap gap-1 border border-slate-200/50">
          <button 
            onClick={() => setActiveTab('workbench')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'workbench' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="ClipboardList" size={16} />
            分派处置台
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'report' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="FileText" size={16} />
            领导简报
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'stats' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="PieChart" size={16} />
            统计分析
          </button>
        </div>
      </header>

      <div className="transition-all duration-300">
        {activeTab === 'workbench' && <NoticeWorkbench />}
        {activeTab === 'report' && <DailyBriefReport />}
        {activeTab === 'stats' && <NoticeStats />}
      </div>
    </div>
  );
};
