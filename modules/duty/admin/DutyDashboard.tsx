
import React, { useState } from 'react';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Grid } from '../../../platform/ui/layout/Grid';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { RosterEditor } from './RosterEditor';
import { BatchManager } from './BatchManager';

export const DutyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roster' | 'batch'>('roster');

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Duty Administration</h2>
          <p className="text-slate-500 font-medium mt-1">Configure roster rules and manage automated scheduling for your team.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[20px] shadow-inner self-start">
          <button 
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-sm font-bold transition-all ${activeTab === 'roster' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="Users" size={16} />
            Roster Rules
          </button>
          <button 
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-sm font-bold transition-all ${activeTab === 'batch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="Zap" size={16} />
            Batch Engine
          </button>
        </div>
      </header>

      <div className="transition-all duration-300">
        {activeTab === 'roster' ? (
          <div className="space-y-6">
            <RosterEditor />
          </div>
        ) : (
          <div className="space-y-6">
            <BatchManager />
          </div>
        )}
      </div>
    </div>
  );
};
