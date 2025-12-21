
import React, { useState } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Input } from '../../../platform/ui/form/Input';
import { Modal } from '../../../platform/ui/layout/Modal'; 
import { Select } from '../../../platform/ui/form/Select';
import { ProfileManager } from '../../../platform/ui/complex/ProfileManager';
import { useTranslation } from '../../../platform/core/i18n';
import { DutyModuleSchema, RuleType, DutyRule, RotationStrategy, DutyConfigProfile } from '../types';

export const ParameterSettings: React.FC = () => {
  const { t } = useTranslation();
  const [db, setDb] = useState(loadDb());
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const dutyData = (db.modules.duty || {}) as DutyModuleSchema;

  const updateDutyData = (updates: Partial<DutyModuleSchema>) => {
    // 1. Get truly fresh DB from storage to avoid overwrite races
    const freshDb = loadDb();
    const currentDuty = (freshDb.modules.duty || {}) as DutyModuleSchema;
    
    // 2. Perform deep merge of the duty module data
    const updatedDuty = { ...currentDuty, ...updates };
    
    // 3. Save back to root DB
    const newDb = {
      ...freshDb,
      modules: { ...freshDb.modules, duty: updatedDuty }
    };
    saveDb(newDb);
    setDb(newDb); // Trigger React re-render
  };

  // --- Profile Logic ---
  const handleSaveProfile = () => {
    const profile: DutyConfigProfile = {
      id: Date.now().toString(),
      name: dutyData.currentProfileName,
      categories: dutyData.categories,
      rules: dutyData.rules,
      slotConfigs: dutyData.slotConfigs,
      rosterConfigs: dutyData.rosterConfigs
    };
    const existingIdx = dutyData.savedProfiles.findIndex(p => p.name === profile.name);
    let nextProfiles = [...dutyData.savedProfiles];
    if (existingIdx >= 0) nextProfiles[existingIdx] = { ...profile, id: nextProfiles[existingIdx].id };
    else nextProfiles.push(profile);
    
    updateDutyData({ savedProfiles: nextProfiles });
    alert(`Configuration saved to scheme: ${profile.name}`);
  };

  const handleLoadProfile = (id: string) => {
    const profile = dutyData.savedProfiles.find(p => p.id === id);
    if (!profile || !confirm(`Load scheme [${profile.name}]?`)) return;
    updateDutyData({
      categories: profile.categories,
      rules: profile.rules,
      slotConfigs: profile.slotConfigs,
      rosterConfigs: profile.rosterConfigs,
      currentProfileName: profile.name
    });
  };

  const handleSaveAs = (name: string) => {
    const profile: DutyConfigProfile = { id: Date.now().toString(), name, categories: [...dutyData.categories], rules: [...dutyData.rules], slotConfigs: [...dutyData.slotConfigs], rosterConfigs: {...dutyData.rosterConfigs} };
    updateDutyData({ savedProfiles: [...dutyData.savedProfiles, profile], currentProfileName: name });
    alert(`Saved as new scheme: ${name}`);
  };

  const handleRename = (name: string) => {
    updateDutyData({ currentProfileName: name });
  };

  // --- Categories ---
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const id = `cat_${Date.now()}`;
    updateDutyData({
      categories: [...dutyData.categories, { id, name: newCategoryName.trim(), description: '' }],
      rules: [...dutyData.rules, { id: `rule_${id}`, categoryId: id, ruleTypes: ['ordinary'], strategy: 'unified_loop' }]
    });
    setIsAddCatModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <ProfileManager 
        currentProfileName={dutyData.currentProfileName}
        profiles={dutyData.savedProfiles}
        onSave={handleSaveProfile}
        onSaveAs={handleSaveAs}
        onRename={handleRename}
        onLoad={handleLoadProfile}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ColorCard title={t('duty.params.categories.title')} variant="white" headerAction={<Button size="sm" onClick={() => { setNewCategoryName(''); setIsAddCatModalOpen(true); }}><Icon name="Plus" size={14} className="mr-1"/> Add</Button>}>
          <div className="space-y-6">
            {dutyData.categories.map(cat => {
              const rule = dutyData.rules.find(r => r.categoryId === cat.id);
              const isSplit = rule?.strategy === 'split_loop';
              return (
                <div key={cat.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-800 uppercase">{cat.name}</span>
                    <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => updateDutyData({ categories: dutyData.categories.filter(c => c.id !== cat.id), rules: dutyData.rules.filter(r => r.categoryId !== cat.id) })}><Icon name="Trash2" size={14}/></Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Rotation Logic</label>
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                      <button onClick={() => updateDutyData({ rules: dutyData.rules.map(r => r.categoryId === cat.id ? {...r, strategy: 'unified_loop'} : r) })} className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${!isSplit ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>Unified</button>
                      <button onClick={() => updateDutyData({ rules: dutyData.rules.map(r => r.categoryId === cat.id ? {...r, strategy: 'split_loop'} : r) })} className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${isSplit ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>Split</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['ordinary', 'workday', 'weekend', 'holiday'] as RuleType[]).map(type => (
                      <button key={type} onClick={() => {
                        const nextRules = dutyData.rules.map(r => {
                          if (r.categoryId !== cat.id) return r;
                          const has = r.ruleTypes.includes(type);
                          return { ...r, ruleTypes: has ? r.ruleTypes.filter(t => t !== type) : [...r.ruleTypes, type] };
                        });
                        updateDutyData({ rules: nextRules });
                      }} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${rule?.ruleTypes.includes(type) ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200'}`}>{type}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ColorCard>

        <ColorCard title={t('duty.params.slots.title')} variant="white" headerAction={<Button size="sm" onClick={() => updateDutyData({ slotConfigs: [...dutyData.slotConfigs, { id: Date.now(), name: `Seat`, allowedCategoryIds: [] }] })}><Icon name="Plus" size={14} className="mr-1"/> Add</Button>}>
          <div className="space-y-4">
            {dutyData.slotConfigs.map(slot => (
              <div key={slot.id} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <div className="flex justify-between items-center">
                  <Input value={slot.name} onChange={e => updateDutyData({ slotConfigs: dutyData.slotConfigs.map(s => s.id === slot.id ? {...s, name: e.target.value} : s) })} className="!bg-transparent !border-none !p-0 font-bold" />
                  <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => updateDutyData({ slotConfigs: dutyData.slotConfigs.filter(s => s.id !== slot.id) })}><Icon name="X" size={14}/></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dutyData.categories.map(c => (
                    <button key={c.id} onClick={() => {
                      const next = dutyData.slotConfigs.map(s => {
                        if (s.id !== slot.id) return s;
                        const has = s.allowedCategoryIds.includes(c.id);
                        return { ...s, allowedCategoryIds: has ? s.allowedCategoryIds.filter(id => id !== c.id) : [...s.allowedCategoryIds, c.id] };
                      });
                      updateDutyData({ slotConfigs: next });
                    }} className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${slot.allowedCategoryIds.includes(c.id) ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>{c.name}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ColorCard>
      </div>

      <Modal isOpen={isAddCatModalOpen} onClose={() => setIsAddCatModalOpen(false)} title="New Category">
        <div className="space-y-4">
          <Input label="Name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} autoFocus />
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setIsAddCatModalOpen(false)}>Cancel</Button><Button onClick={handleAddCategory}>Save</Button></div>
        </div>
      </Modal>
    </div>
  );
};
