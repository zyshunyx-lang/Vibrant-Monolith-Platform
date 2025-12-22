
import React, { useState } from 'react';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Button } from '../../../platform/ui/basic/Button';
import { ParameterSettings } from './ParameterSettings';
import { DishLibrary } from './DishLibrary';
import { MenuCalendarManager } from './MenuCalendarManager';

type TabType = 'plan' | 'dishes' | 'params';

export const MenuDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('plan');

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            食堂管理后台
            <div className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest rounded-xl border border-orange-200">
               Menu v2.5
            </div>
          </h2>
          <p className="text-slate-500 font-medium mt-1">管理菜品库、配置供餐结构并制定每月或每周的营养排餐计划。</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[24px] shadow-inner self-start flex-wrap gap-1 border border-slate-200/50">
          <button 
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'plan' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="CalendarDays" size={16} />
            排餐工作台
          </button>
          <button 
            onClick={() => setActiveTab('dishes')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'dishes' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="BarChart3" size={16} />
            菜品评价库
          </button>
          <button 
            onClick={() => setActiveTab('params')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'params' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="Settings" size={16} />
            参数设置
          </button>
        </div>
      </header>

      <div className="transition-all duration-300">
        {activeTab === 'params' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ParameterSettings />
          </div>
        )}
        {activeTab === 'dishes' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <DishLibrary />
          </div>
        )}
        {activeTab === 'plan' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <MenuCalendarManager />
          </div>
        )}
      </div>
    </div>
  );
};
