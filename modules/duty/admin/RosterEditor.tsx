
import React, { useState } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Select } from '../../../platform/ui/form/Select';
// Added missing Badge import
import { Badge } from '../../../platform/ui/basic/Badge';
import { BulkActionToolbar } from '../../../platform/ui/complex/BulkActionToolbar';
import { useTranslation } from '../../../platform/core/i18n';
import { DutyConfig, DutyModuleSchema } from '../types';

export const RosterEditor: React.FC = () => {
  const { t } = useTranslation();
  const [db, setDb] = useState(loadDb());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const dutyData: DutyModuleSchema = db.modules.duty || {
    categories: [],
    rules: [],
    calendarOverrides: [],
    slotConfigs: [],
    rosterConfigs: {},
    schedules: [],
    rotationState: {},
    changeLogs: [],
    savedProfiles: [],
    currentProfileName: '默认方案'
  };
  const users = db.sys_config.users || [];

  const updateConfig = (userIds: string[], updates: Partial<DutyConfig>) => {
    const newConfigs = { ...dutyData.rosterConfigs };
    userIds.forEach(uid => {
      newConfigs[uid] = {
        ...(newConfigs[uid] || { userId: uid, categoryId: '', isExempt: false, sortOrder: 0 }),
        ...updates
      };
    });

    const newDb = { ...db, modules: { ...db.modules, duty: { ...dutyData, rosterConfigs: newConfigs } } };
    saveDb(newDb);
    setDb(newDb);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkAssignCategory = (catId: string) => {
    updateConfig(Array.from(selectedIds), { categoryId: catId });
    setSelectedIds(new Set());
  };

  const renderGroup = (userList: typeof users, categoryId: string, categoryName: string) => {
    const isCollapsed = collapsedGroups.has(categoryId);
    return (
      <div key={categoryId} className="mb-6 border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between cursor-pointer" onClick={() => {
          const next = new Set(collapsedGroups);
          if (next.has(categoryId)) next.delete(categoryId); else next.add(categoryId);
          setCollapsedGroups(next);
        }}>
          <div className="flex items-center gap-3">
            <Icon name={categoryId === '' ? 'UserMinus' : 'Folder'} size={16} />
            <span className="text-sm font-black text-slate-800 uppercase">{categoryName}</span>
            <Badge>{userList.length}</Badge>
          </div>
          <Icon name={isCollapsed ? 'ChevronDown' : 'ChevronUp'} size={16} />
        </div>
        {!isCollapsed && (
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-50">
              {userList.map(user => {
                const config = dutyData.rosterConfigs[user.id] || { categoryId: '', isExempt: false, sortOrder: 0 };
                return (
                  <tr key={user.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="px-6 py-4 w-12">
                      <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => toggleSelect(user.id)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full overflow-hidden border">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" />
                         </div>
                         <span className="font-bold text-slate-800">{user.realName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Select options={[{label:'Unassigned', value:''}, ...(dutyData.categories || []).map(c => ({label:c.name, value:c.id}))]} value={config.categoryId} onChange={e => updateConfig([user.id], { categoryId: e.target.value })} />
                    </td>
                  </tr>
                );
              })}
              {userList.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-300 italic text-sm">No users in this category.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const groupedUsers = (() => {
    const groups: Record<string, typeof users> = { '': [] };
    (dutyData.categories || []).forEach(c => groups[c.id] = []);
    users.forEach(u => {
      const catId = dutyData.rosterConfigs[u.id]?.categoryId || '';
      if (groups[catId]) groups[catId].push(u); else groups[''].push(u);
    });
    return groups;
  })();

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-800">{t('duty.roster.title')}</h3>
      </div>
      {renderGroup(groupedUsers[''], '', 'Unassigned')}
      {(dutyData.categories || []).map(cat => renderGroup(groupedUsers[cat.id], cat.id, cat.name))}

      <BulkActionToolbar 
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        actions={[
          { label: 'Clear Category', icon: 'UserMinus', onClick: () => handleBulkAssignCategory('') },
          ...(dutyData.categories || []).map(cat => ({
            label: `Assign to ${cat.name}`,
            icon: 'ArrowRightCircle' as const,
            onClick: () => handleBulkAssignCategory(cat.id)
          }))
        ]}
      />
    </div>
  );
};
