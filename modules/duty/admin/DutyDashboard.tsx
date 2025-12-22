
import React, { useState } from 'react';
import { Icon } from '../../../platform/ui/basic/Icon';
import { ParameterSettings } from './ParameterSettings'; 
import { RosterEditor } from './RosterEditor';
import { BatchManager } from './BatchManager';
import { CalendarManager } from './CalendarManager';

type TabType = 'roster' | 'batch' | 'params' | 'calendar';

export const DutyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('params');

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">值班行政管理</h2>
          <p className="text-slate-500 font-medium mt-1">配置人员分组、排班规则，并利用自动引擎生成多席位月度值班表。</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[20px] shadow-inner self-start flex-wrap gap-1">
          <button 
            onClick={() => setActiveTab('params')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-sm font-bold transition-all ${activeTab === 'params' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="Settings" size={16} />
            规则参数
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="CalendarDays" size={16} />
            节假设置
          </button>
          <button 
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-sm font-bold transition-all ${activeTab === 'roster' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="Users" size={16} />
            人员分组
          </button>
          <button 
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-sm font-bold transition-all ${activeTab === 'batch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="Zap" size={16} />
            排班引擎
          </button>
        </div>
      </header>

      <div className="transition-all duration-300">
        {activeTab === 'params' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ParameterSettings />
          </div>
        )}
        {activeTab === 'calendar' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CalendarManager />
          </div>
        )}
        {activeTab === 'roster' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <RosterEditor />
          </div>
        )}
        {activeTab === 'batch' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <BatchManager />
          </div>
        )}
      </div>
    </div>
  );
};
