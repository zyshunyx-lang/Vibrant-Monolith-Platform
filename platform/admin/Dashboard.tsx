
import React from 'react';
import { ColorCard } from '../ui/layout/ColorCard';
import { Grid } from '../ui/layout/Grid';
import { Icon } from '../ui/basic/Icon';
import { loadDb } from '../core/db';

export const Dashboard: React.FC = () => {
  const db = loadDb();
  
  const metrics = [
    { label: 'Total Users', value: db.sys_config.users.length, icon: 'Users' as const, color: 'blue' as const },
    { label: 'System Logs', value: db.logs.length, icon: 'History' as const, color: 'orange' as const },
    { label: 'Modules', value: Object.keys(db.modules).length, icon: 'Layers' as const, color: 'indigo' as const },
    { label: 'Uptime', value: '99.9%', icon: 'Zap' as const, color: 'rose' as const },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
        <p className="text-slate-500 mt-1 font-medium">Real-time snapshots of your modular ecosystem.</p>
      </header>

      <Grid cols={4}>
        {metrics.map((m) => (
          <ColorCard key={m.label} variant={m.color} className="!p-0 border-none">
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold opacity-70 mb-1">{m.label}</p>
                <h4 className="text-3xl font-black">{m.value}</h4>
              </div>
              <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center">
                <Icon name={m.icon} size={24} />
              </div>
            </div>
          </ColorCard>
        ))}
      </Grid>

      <Grid cols={2}>
        <ColorCard title="System Status" variant="white">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600">Database Engine</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black uppercase">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600">Module Registry</span>
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black uppercase">0/2 Loaded</span>
            </div>
             <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600">Memory Usage (Local)</span>
              <div className="w-48 bg-slate-100 h-2 rounded-full">
                <div className="bg-indigo-500 h-2 rounded-full w-[15%]"></div>
              </div>
            </div>
          </div>
        </ColorCard>

        <ColorCard title="Admin Activity" variant="white">
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <Icon name="Inbox" size={48} />
            <p className="mt-4 font-bold text-sm">No recent alerts or tasks.</p>
          </div>
        </ColorCard>
      </Grid>
    </div>
  );
};
