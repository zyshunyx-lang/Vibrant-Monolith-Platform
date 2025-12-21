
import React, { useState, useEffect } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Input } from '../../../platform/ui/form/Input';
import { useTranslation } from '../../../platform/core/i18n';
import { DutyModuleSchema, RuleType, DutyRule } from '../types';

export const ParameterSettings: React.FC = () => {
  const { t } = useTranslation();
  const [db, setDb] = useState(loadDb());

  // Helper to get current duty data safely
  const getDutyData = (currentDb: typeof db): DutyModuleSchema => {
    return currentDb.modules.duty || {
      categories: [],
      rules: [],
      calendarOverrides: [],
      slotConfigs: [],
      rosterConfigs: {},
      schedules: []
    };
  };

  const dutyData = getDutyData(db);

  const updateDutyData = (updates: Partial<DutyModuleSchema>) => {
    const freshDb = loadDb(); // Load freshest from storage to avoid overwriting other module updates
    const currentDuty = getDutyData(freshDb);
    const updatedDuty = { ...currentDuty, ...updates };
    
    const newDb = {
      ...freshDb,
      modules: {
        ...freshDb.modules,
        duty: updatedDuty
      }
    };
    saveDb(newDb);
    setDb(newDb);
  };

  const handleAddCategory = () => {
    const name = prompt(t('duty.params.prompt.category_name'));
    if (!name || name.trim() === '') return;
    
    const newId = "cat_" + Date.now().toString();
    const currentCats = dutyData.categories || [];
    const currentRules = dutyData.rules || [];

    const newCats = [...currentCats, { id: newId, name: name.trim(), description: '' }];
    const newRule: DutyRule = { 
      id: `rule-${newId}`, 
      categoryId: newId, 
      ruleTypes: ['ordinary' as RuleType] 
    };
    const newRules = [...currentRules, newRule];
    
    updateDutyData({ categories: newCats, rules: newRules });
  };

  const handleDeleteCategory = (id: string) => {
    const newCats = (dutyData.categories || []).filter(c => c.id !== id);
    const newRules = (dutyData.rules || []).filter(r => r.categoryId !== id);
    updateDutyData({ categories: newCats, rules: newRules });
  };

  const toggleRuleType = (categoryId: string, type: RuleType) => {
    const nextRules = (dutyData.rules || []).map(r => {
      if (r.categoryId === categoryId) {
        const hasType = r.ruleTypes.includes(type);
        return {
          ...r,
          ruleTypes: hasType ? r.ruleTypes.filter(t => t !== type) : [...r.ruleTypes, type]
        };
      }
      return r;
    });
    updateDutyData({ rules: nextRules });
  };

  const handleAddSlot = () => {
    const currentSlots = dutyData.slotConfigs || [];
    const nextId = currentSlots.length > 0 
      ? Math.max(...currentSlots.map(s => s.id)) + 1 
      : 1;
    updateDutyData({
      slotConfigs: [...currentSlots, { id: nextId, name: `席位 ${nextId}`, allowedCategoryIds: [] }]
    });
  };

  const toggleCategoryInSlot = (slotId: number, categoryId: string) => {
    const nextSlots = (dutyData.slotConfigs || []).map(s => {
      if (s.id === slotId) {
        const hasCat = s.allowedCategoryIds.includes(categoryId);
        return {
          ...s,
          allowedCategoryIds: hasCat ? s.allowedCategoryIds.filter(id => id !== categoryId) : [...s.allowedCategoryIds, categoryId]
        };
      }
      return s;
    });
    updateDutyData({ slotConfigs: nextSlots });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      {/* Category & Rules */}
      <ColorCard 
        title={t('duty.params.categories.title')} 
        variant="white" 
        headerAction={
          <Button size="sm" onClick={handleAddCategory}>
            <Icon name="Plus" size={14} className="mr-1"/> {t('duty.params.categories.add')}
          </Button>
        }
      >
        <div className="space-y-4">
          {(dutyData.categories || []).map(cat => (
            <div key={cat.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-black text-slate-800 uppercase tracking-tight">{cat.name}</span>
                <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50" onClick={() => handleDeleteCategory(cat.id)}>
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['ordinary', 'workday', 'weekend', 'holiday'] as RuleType[]).map(type => {
                  const isActive = (dutyData.rules || []).find(r => r.categoryId === cat.id)?.ruleTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleRuleType(cat.id, type)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all border ${
                        isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {t(`duty.rules.${type}`)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {(dutyData.categories?.length || 0) === 0 && <p className="text-center py-8 text-slate-400 italic">{t('duty.params.categories.empty')}</p>}
        </div>
      </ColorCard>

      {/* Daily Slots */}
      <ColorCard 
        title={t('duty.params.slots.title')} 
        variant="white" 
        headerAction={
          <Button size="sm" onClick={handleAddSlot}>
            <Icon name="Plus" size={14} className="mr-1"/> {t('duty.params.slots.add')}
          </Button>
        }
      >
        <div className="space-y-4">
          {(dutyData.slotConfigs || []).map(slot => (
            <div key={slot.id} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <div className="flex justify-between items-center">
                <Input 
                   value={slot.name} 
                   onChange={(e) => updateDutyData({ 
                     slotConfigs: dutyData.slotConfigs.map(s => s.id === slot.id ? {...s, name: e.target.value} : s) 
                   })}
                   className="!bg-transparent !border-none !p-0 font-bold text-indigo-900"
                />
                <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => updateDutyData({ 
                  slotConfigs: dutyData.slotConfigs.filter(s => s.id !== slot.id)
                })}>
                  <Icon name="X" size={14} />
                </Button>
              </div>
              <p className="text-[10px] text-indigo-400 font-bold uppercase">{t('duty.params.slots.allowed')}</p>
              <div className="flex flex-wrap gap-2">
                {(dutyData.categories || []).map(cat => {
                  const isAllowed = slot.allowedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategoryInSlot(slot.id, cat.id)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                        isAllowed ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {(dutyData.slotConfigs?.length || 0) === 0 && <p className="text-center py-8 text-slate-400 italic">{t('duty.params.slots.empty')}</p>}
        </div>
      </ColorCard>
    </div>
  );
};
