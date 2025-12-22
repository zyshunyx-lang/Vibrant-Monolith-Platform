
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

  const dutyData = (db.modules.duty || {
    categories: [],
    rules: [],
    slotConfigs: [],
    rosterConfigs: {},
    savedProfiles: [],
    currentProfileName: '默认方案'
  }) as DutyModuleSchema;

  const updateDutyData = (updates: Partial<DutyModuleSchema>) => {
    const freshDb = loadDb();
    const currentDuty = (freshDb.modules.duty || {}) as DutyModuleSchema;
    const updatedDuty = { ...currentDuty, ...updates };
    const newDb = {
      ...freshDb,
      modules: { ...freshDb.modules, duty: updatedDuty }
    };
    saveDb(newDb);
    setDb(newDb);
  };

  const handleSaveProfile = () => {
    const profile: DutyConfigProfile = {
      id: Date.now().toString(),
      name: dutyData.currentProfileName,
      categories: dutyData.categories || [],
      rules: dutyData.rules || [],
      slotConfigs: dutyData.slotConfigs || [],
      rosterConfigs: dutyData.rosterConfigs || {}
    };
    const existingIdx = (dutyData.savedProfiles || []).findIndex(p => p.name === profile.name);
    let nextProfiles = [...(dutyData.savedProfiles || [])];
    if (existingIdx >= 0) nextProfiles[existingIdx] = { ...profile, id: nextProfiles[existingIdx].id };
    else nextProfiles.push(profile);
    updateDutyData({ savedProfiles: nextProfiles });
    alert(`配置已成功保存至方案：${profile.name}`);
  };

  const handleLoadProfile = (id: string) => {
    const profile = (dutyData.savedProfiles || []).find(p => p.id === id);
    if (!profile) return;
    
    updateDutyData({
      categories: profile.categories || [],
      rules: profile.rules || [],
      slotConfigs: profile.slotConfigs || [],
      rosterConfigs: profile.rosterConfigs || {},
      currentProfileName: profile.name
    });
  };

  const handleSaveAs = (name: string) => {
    const profile: DutyConfigProfile = { 
      id: Date.now().toString(), 
      name, 
      categories: [...(dutyData.categories || [])], 
      rules: [...(dutyData.rules || [])], 
      slotConfigs: [...(dutyData.slotConfigs || [])], 
      rosterConfigs: {...(dutyData.rosterConfigs || {})} 
    };
    updateDutyData({ savedProfiles: [...(dutyData.savedProfiles || []), profile], currentProfileName: name });
    alert(`已另存为新方案：${name}`);
  };

  const handleRename = (name: string) => {
    updateDutyData({ currentProfileName: name });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const id = `cat_${Date.now()}`;
    updateDutyData({
      categories: [...(dutyData.categories || []), { id, name: newCategoryName.trim(), description: '' }],
      rules: [...(dutyData.rules || []), { id: `rule_${id}`, categoryId: id, ruleTypes: ['ordinary'], strategy: 'unified_loop' }]
    });
    setIsAddCatModalOpen(false);
  };

  const ruleTypeLegend: { type: RuleType; label: string; desc: string }[] = [
    { type: 'ordinary', label: '通用 (Ordinary)', desc: '日历上的每一天均生效。' },
    { type: 'workday', label: '工作日 (Workday)', desc: '仅周一至周五（含调休，扣除法定节假）。' },
    { type: 'weekend', label: '周末 (Weekend)', desc: '仅周六、周日。' },
    { type: 'holiday', label: '法定节假 (Holiday)', desc: '仅国家法定节假日。' },
    { type: 'deholiday', label: '非节假日 (Deholiday)', desc: '包含工作日和周末，但排除法定节假日。' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <ProfileManager 
        currentProfileName={dutyData.currentProfileName}
        profiles={dutyData.savedProfiles || []}
        onSave={handleSaveProfile}
        onSaveAs={handleSaveAs}
        onRename={handleRename}
        onLoad={handleLoadProfile}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ColorCard title="1. 分组与策略配置" variant="white" headerAction={<Button size="sm" onClick={() => { setNewCategoryName(''); setIsAddCatModalOpen(true); }}><Icon name="Plus" size={14} className="mr-1"/> 新增分组</Button>}>
          <div className="space-y-6">
            {(dutyData.categories || []).map(cat => {
              const rule = (dutyData.rules || []).find(r => r.categoryId === cat.id);
              const isSplit = rule?.strategy === 'split_loop';
              
              return (
                <div key={cat.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-800 uppercase">{cat.name}</span>
                    <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => updateDutyData({ categories: dutyData.categories.filter(c => c.id !== cat.id), rules: dutyData.rules.filter(r => r.categoryId !== cat.id) })}><Icon name="Trash2" size={14}/></Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">轮询策略 (Rotation Strategy)</label>
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                      <button 
                        onClick={() => updateDutyData({ 
                          rules: dutyData.rules.map(r => r.categoryId === cat.id ? {...r, strategy: 'unified_loop', ruleTypes: [r.ruleTypes[0] || 'ordinary']} : r) 
                        })} 
                        className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${!isSplit ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}
                      >
                        单线轮询 (Unified)
                      </button>
                      <button 
                        onClick={() => updateDutyData({ 
                          rules: dutyData.rules.map(r => r.categoryId === cat.id ? {...r, strategy: 'split_loop'} : r) 
                        })} 
                        className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${isSplit ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}
                      >
                        双线分流 (Split)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase">生效日期范围</label>
                    <div className="flex flex-wrap gap-2">
                      {ruleTypeLegend.map(item => {
                        const isActive = rule?.ruleTypes.includes(item.type);
                        return (
                          <button 
                            key={item.type} 
                            onClick={() => {
                              const nextRules = dutyData.rules.map(r => {
                                if (r.categoryId !== cat.id) return r;
                                
                                if (r.strategy === 'unified_loop') {
                                  return { ...r, ruleTypes: [item.type] };
                                } else {
                                  const has = r.ruleTypes.includes(item.type);
                                  if (!has && r.ruleTypes.length >= 2) {
                                    alert("双线分流模式最多支持选择 2 种日期类型（通常为工作日和节假日各一线）。");
                                    return r;
                                  }
                                  return { ...r, ruleTypes: has ? r.ruleTypes.filter(t => t !== item.type) : [...r.ruleTypes, item.type] };
                                }
                              });
                              updateDutyData({ rules: nextRules });
                            }} 
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${
                              isActive ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {item.label.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="p-3 bg-white/50 rounded-xl border border-slate-200/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">生效范围定义图例</p>
                        <ul className="space-y-1">
                            {ruleTypeLegend.map(item => (
                                <li key={item.type} className="flex items-start gap-2">
                                    <span className="text-[10px] font-bold text-slate-700 w-24 shrink-0">{item.label}:</span>
                                    <span className="text-[10px] text-slate-500 italic leading-tight">{item.desc}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ColorCard>

        <ColorCard title="2. 值班席位(岗位)定义" variant="white" headerAction={<Button size="sm" onClick={() => updateDutyData({ slotConfigs: [...(dutyData.slotConfigs || []), { id: Date.now(), name: `新席位`, allowedCategoryIds: [] }] })}><Icon name="Plus" size={14} className="mr-1"/> 添加席位</Button>}>
          <div className="space-y-4">
            {(dutyData.slotConfigs || []).map(slot => (
              <div key={slot.id} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <div className="flex justify-between items-center">
                  <Input value={slot.name} onChange={e => updateDutyData({ slotConfigs: dutyData.slotConfigs.map(s => s.id === slot.id ? {...s, name: e.target.value} : s) })} className="!bg-transparent !border-none !p-0 font-bold" />
                  <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => updateDutyData({ slotConfigs: dutyData.slotConfigs.filter(s => s.id !== slot.id) })}><Icon name="X" size={14}/></Button>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">允许参与该席位排班的人员分组：</p>
                <div className="flex flex-wrap gap-2">
                  {(dutyData.categories || []).map(c => (
                    <button key={c.id} onClick={() => {
                      const next = dutyData.slotConfigs.map(s => {
                        if (s.id !== slot.id) return s;
                        const has = s.allowedCategoryIds.includes(c.id);
                        return { ...s, allowedCategoryIds: has ? s.allowedCategoryIds.filter(id => id !== c.id) : [...s.allowedCategoryIds, c.id] };
                      });
                      updateDutyData({ slotConfigs: next });
                    }} className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${slot.allowedCategoryIds.includes(c.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}>{c.name}</button>
                  ))}
                </div>
              </div>
            ))}
            {(dutyData.slotConfigs || []).length === 0 && (
               <div className="py-12 text-center text-slate-300 italic text-sm">
                 尚未定义席位
               </div>
            )}
          </div>
        </ColorCard>
      </div>

      <Modal isOpen={isAddCatModalOpen} onClose={() => setIsAddCatModalOpen(false)} title="新建人员分组">
        <div className="space-y-4">
          <Input label="分组名称" placeholder="例如：行政值班、技术保障..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} autoFocus />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsAddCatModalOpen(false)}>取消</Button>
            <Button onClick={handleAddCategory}>确认创建</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
