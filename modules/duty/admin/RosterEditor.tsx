
import React, { useState, useEffect } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Badge } from '../../../platform/ui/basic/Badge';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { DutyConfig, DutyModuleSchema } from '../types';

export const RosterEditor: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const dutyData: DutyModuleSchema = db.modules.duty || { rosterConfigs: {}, schedules: [] };

  const users = db.sys_config.users;

  const updateConfig = (userId: string, updates: Partial<DutyConfig>) => {
    const newConfigs = { ...dutyData.rosterConfigs };
    newConfigs[userId] = {
      ...(newConfigs[userId] || { userId, isExempt: false, sortOrder: 0 }),
      ...updates
    };

    const newDb = {
      ...db,
      modules: {
        ...db.modules,
        duty: { ...dutyData, rosterConfigs: newConfigs }
      }
    };
    saveDb(newDb);
    setDb(newDb);
  };

  return (
    <ColorCard title="Personnel Eligibility" variant="white" className="!p-0 border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Exempt</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Priority</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(user => {
              const config = dutyData.rosterConfigs[user.id] || { isExempt: false, sortOrder: 0 };
              return (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${config.isExempt ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
                         {user.realName.charAt(0)}
                       </div>
                       <span className={`font-bold ${config.isExempt ? 'text-slate-400' : 'text-slate-800'}`}>
                         {user.realName}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => updateConfig(user.id, { isExempt: !config.isExempt })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${config.isExempt ? 'bg-rose-500' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.isExempt ? 'left-7' : 'left-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="number"
                      value={config.sortOrder}
                      onChange={(e) => updateConfig(user.id, { sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-16 text-center bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-sm"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 !p-0">
                      <Icon name="History" size={14} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ColorCard>
  );
};
