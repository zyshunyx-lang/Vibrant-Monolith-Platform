import React, { useState } from 'react';
import { Icon } from '../../../platform/ui/basic/Icon';
import { RosterEditor } from './RosterEditor';
import { BatchManager } from './BatchManager';
import { ParameterSettings } from './ParameterSettings';
import { useTranslation } from '../../../platform/core/i18n';

export const DutyDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'roster' | 'batch' | 'params'>('roster');

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t('duty.admin.title')}</h2>
          <p className="text-slate-500 font-medium mt-1">{t('duty.admin.subtitle')}</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[20px] shadow-inner self-start overflow-x-auto">
          <button 
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'roster' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="Users" size={16} />
            {t('duty.tab.personnel')}
          </button>
          <button 
            onClick={() => setActiveTab('params')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'params' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="Settings2" size={16} />
            {t('duty.tab.params')}
          </button>
          <button 
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'batch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="Zap" size={16} />
            {t('duty.tab.engine')}
          </button>
        </div>
      </header>

      <div className="transition-all duration-300">
        {activeTab === 'roster' && <RosterEditor />}
        {activeTab === 'params' && <ParameterSettings />}
        {activeTab === 'batch' && <BatchManager />}
      </div>
    </div>
  );
};