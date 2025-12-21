
import React, { useState } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Select } from '../../../platform/ui/form/Select';
import { useTranslation } from '../../../platform/core/i18n';
import { DutyConfig, DutyModuleSchema } from '../types';

export const RosterEditor: React.FC = () => {
  const { t } = useTranslation();
  const [db, setDb] = useState(loadDb());
  
  const dutyData: DutyModuleSchema = db.modules.duty || {
    categories: [],
    rules: [],
    calendarOverrides: [],
    slotConfigs: [],
    rosterConfigs: {},
    schedules: []
  };

  const users = db.sys_config.users;

  const updateConfig = (userId: string, updates: Partial<DutyConfig>) => {
    const newConfigs = { ...dutyData.rosterConfigs };
    newConfigs[userId] = {
      ...(newConfigs[userId] || { userId, categoryId: '', isExempt: false, sortOrder: 0 }),
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

  const categoryOptions = [
    { label: t('duty.roster.unassigned'), value: '' },
    ...(dutyData.categories || []).map(c => ({ label: c.name, value: c.id }))
  ];

  // Group users by category
  const groupedUsers = (() => {
    const groups: Record<string, typeof users> = { '': [] };
    (dutyData.categories || []).forEach(cat => { groups[cat.id] = []; });
    
    users.forEach(user => {
      const catId = dutyData.rosterConfigs[user.id]?.categoryId || '';
      if (groups[catId]) groups[catId].push(user);
      else groups[''].push(user);
    });
    
    return groups;
  })();

  const renderGroup = (userList: typeof users, categoryId: string, categoryName: string) => (
    <div key={categoryId} className="mb-6 last:mb-0 border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${categoryId === '' ? 'bg-slate-400' : 'bg-indigo-500'}`}>
            <Icon name={categoryId === '' ? 'UserMinus' : 'Folder'} size={16} />
          </div>
          <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{categoryName}</span>
          <span className="px-2 py-0.5 bg-slate-200 text-slate-500 rounded-md text-[10px] font-bold">{userList.length}</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-50">
            {userList.map(user => {
              const config = dutyData.rosterConfigs[user.id] || { categoryId: '', isExempt: false, sortOrder: 0 };
              return (
                <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4 w-1/3">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 overflow-hidden ring-2 ring-indigo-50">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" />
                       </div>
                       <div>
                         <span className="font-bold text-slate-800 block">{user.realName}</span>
                         <span className="text-[10px] text-slate-400 font-mono">@{user.username}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 w-1/3">
                    <Select 
                       options={categoryOptions}
                       value={config.categoryId}
                       onChange={(e) => updateConfig(user.id, { categoryId: e.target.value })}
                       className="!py-1.5 !text-xs !rounded-lg"
                    />
                  </td>
                  <td className="px-6 py-4 w-1/6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <button 
                        onClick={() => updateConfig(user.id, { isExempt: !config.isExempt })}
                        className={`w-10 h-5 rounded-full transition-all relative ${config.isExempt ? 'bg-rose-500' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${config.isExempt ? 'left-5' : 'left-1'}`} />
                      </button>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('duty.roster.exempt')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 w-1/6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-indigo-600">
                      <Icon name="History" size={14} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {userList.length === 0 && (
        <div className="py-8 text-center text-slate-300 text-xs italic">暂无人员</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-black text-slate-800 tracking-tight">{t('duty.roster.title')}</h3>
      </div>
      
      <div className="max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
        {/* Unassigned Group First */}
        {renderGroup(groupedUsers[''], '', t('duty.roster.unassigned'))}
        
        {/* Categorized Groups */}
        {(dutyData.categories || []).map(cat => (
          renderGroup(groupedUsers[cat.id], cat.id, cat.name)
        ))}
        
        {users.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Icon name="Users" size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">系统内尚未添加任何人员</p>
          </div>
        )}
      </div>
    </div>
  );
};
