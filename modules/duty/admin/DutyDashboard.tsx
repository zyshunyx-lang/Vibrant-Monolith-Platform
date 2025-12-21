
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
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Duty Administration</h2>
          <p className="text-slate-500 font-medium mt-1">Configure roster rules and manage automated scheduling.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'roster' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            Roster Rules
          </button>
          <button 
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'batch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            Batch Engine
          </button>
        </div>
      </header>

      {activeTab === 'roster' ? <RosterEditor /> : <BatchManager />}
    </div>
  );
};
