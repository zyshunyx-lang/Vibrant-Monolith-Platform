
import React, { useState } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Input } from '../../../platform/ui/form/Input';
import { Select } from '../../../platform/ui/form/Select';
import { ProfileManager } from '../../../platform/ui/complex/ProfileManager';
import { MenuModuleSchema, MenuConfigSchema, MenuProfile, MealConfig, MenuSlot } from '../types';

export const ParameterSettings: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const menuData = db.modules.menu as MenuModuleSchema;

  const updateMenuData = (updates: Partial<MenuModuleSchema>) => {
    const freshDb = loadDb();
    const currentMenu = freshDb.modules.menu as MenuModuleSchema;
    const newDb = {
      ...freshDb,
      modules: { ...freshDb.modules, menu: { ...currentMenu, ...updates } }
    };
    saveDb(newDb);
    setDb(newDb);
  };

  const handleConfigUpdate = (updates: Partial<MenuConfigSchema>) => {
    updateMenuData({ currentConfig: { ...menuData.currentConfig, ...updates } });
  };

  const handleAddMeal = () => {
    const newMeal: MealConfig = {
      id: `meal_${Date.now()}`,
      name: '新餐次',
      slots: []
    };
    handleConfigUpdate({ meals: [...menuData.currentConfig.meals, newMeal] });
  };

  const handleRemoveMeal = (id: string) => {
    handleConfigUpdate({ meals: menuData.currentConfig.meals.filter(m => m.id !== id) });
  };

  const handleAddSlot = (mealId: string) => {
    const meals = menuData.currentConfig.meals.map(m => {
      if (m.id !== mealId) return m;
      const newSlot: MenuSlot = { id: `slot_${Date.now()}`, name: '新席位', tags: [] };
      return { ...m, slots: [...m.slots, newSlot] };
    });
    handleConfigUpdate({ meals });
  };

  const handleUpdateSlot = (mealId: string, slotId: string, updates: Partial<MenuSlot>) => {
    const meals = menuData.currentConfig.meals.map(m => {
      if (m.id !== mealId) return m;
      return {
        ...m,
        slots: m.slots.map(s => s.id === slotId ? { ...s, ...updates } : s)
      };
    });
    handleConfigUpdate({ meals });
  };

  const handleAddTag = (mealId: string, slotId: string, tag: string) => {
    if (!tag.trim()) return;
    const meals = menuData.currentConfig.meals.map(m => {
      if (m.id !== mealId) return m;
      return {
        ...m,
        slots: m.slots.map(s => {
          if (s.id !== slotId) return s;
          if (s.tags.includes(tag.trim())) return s;
          return { ...s, tags: [...s.tags, tag.trim()] };
        })
      };
    });
    handleConfigUpdate({ meals });
  };

  const handleRemoveTag = (mealId: string, slotId: string, tag: string) => {
    const meals = menuData.currentConfig.meals.map(m => {
      if (m.id !== mealId) return m;
      return {
        ...m,
        slots: m.slots.map(s => {
          if (s.id !== slotId) return s;
          return { ...s, tags: s.tags.filter(t => t !== tag) };
        })
      };
    });
    handleConfigUpdate({ meals });
  };

  // Profile Management Logic
  const handleSaveProfile = () => {
    const profile: MenuProfile = {
      id: Date.now().toString(),
      name: menuData.currentProfileName,
      config: menuData.currentConfig
    };
    const existingIdx = menuData.savedProfiles.findIndex(p => p.name === profile.name);
    let nextProfiles = [...menuData.savedProfiles];
    if (existingIdx >= 0) nextProfiles[existingIdx] = profile;
    else nextProfiles.push(profile);
    updateMenuData({ savedProfiles: nextProfiles });
    alert(`配置已保存至方案：${profile.name}`);
  };

  const handleLoadProfile = (id: string) => {
    const profile = menuData.savedProfiles.find(p => p.id === id);
    if (!profile) return;
    updateMenuData({
      currentConfig: profile.config,
      currentProfileName: profile.name
    });
  };

  const handleSaveAs = (name: string) => {
    const profile: MenuProfile = { id: Date.now().toString(), name, config: menuData.currentConfig };
    updateMenuData({ savedProfiles: [...menuData.savedProfiles, profile], currentProfileName: name });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <ProfileManager 
        currentProfileName={menuData.currentProfileName}
        profiles={menuData.savedProfiles}
        onSave={handleSaveProfile}
        onSaveAs={handleSaveAs}
        onRename={(name) => updateMenuData({ currentProfileName: name })}
        onLoad={handleLoadProfile}
      />

      {/* Global Config */}
      <ColorCard title="全局配置项" variant="white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-800">展示菜品图片</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Enable Dish Images</p>
            </div>
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={menuData.currentConfig.enableImages}
              onChange={(e) => handleConfigUpdate({ enableImages: e.target.checked })}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-800">启用菜品评分</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Enable Ratings</p>
            </div>
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={menuData.currentConfig.enableRating}
              onChange={(e) => handleConfigUpdate({ enableRating: e.target.checked })}
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <p className="text-sm font-bold text-slate-800">评分统计周期</p>
            <Select 
              value={menuData.currentConfig.ratingScope}
              onChange={(e) => handleConfigUpdate({ ratingScope: e.target.value as any })}
              options={[
                { label: '累计至今 (All Time)', value: 'all' },
                { label: '本年度 (Yearly)', value: 'year' },
                { label: '本月度 (Monthly)', value: 'month' },
              ]}
              className="!py-1 !text-xs"
            />
          </div>
        </div>
      </ColorCard>

      {/* Meals & Slots Editor */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Icon name="Layers" size={20} className="text-indigo-600" />
            供餐结构编辑器
          </h3>
          <Button size="sm" onClick={handleAddMeal}>
            <Icon name="Plus" size={16} className="mr-2" />
            添加餐次
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {menuData.currentConfig.meals.map(meal => (
            <ColorCard 
              key={meal.id} 
              variant="white"
              title={
                <div className="flex items-center gap-2">
                  <Input 
                    value={meal.name} 
                    onChange={(e) => handleConfigUpdate({ 
                      meals: menuData.currentConfig.meals.map(m => m.id === meal.id ? { ...m, name: e.target.value } : m) 
                    })}
                    className="!bg-transparent !border-none !p-0 font-black text-slate-800 w-32"
                  />
                  <span className="text-[10px] font-black text-slate-300 uppercase px-2 py-0.5 bg-slate-50 rounded border border-slate-100">Meal</span>
                </div>
              }
              headerAction={
                <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => handleRemoveMeal(meal.id)}>
                  <Icon name="Trash2" size={16} />
                </Button>
              }
            >
              <div className="space-y-4">
                {meal.slots.map(slot => (
                  <div key={slot.id} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Icon name="GripVertical" size={14} className="text-indigo-300 cursor-move" />
                        <Input 
                          value={slot.name} 
                          onChange={(e) => handleUpdateSlot(meal.id, slot.id, { name: e.target.value })}
                          className="!bg-transparent !border-none !p-0 font-bold text-indigo-900 text-sm"
                        />
                      </div>
                      <Button variant="ghost" size="sm" className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleConfigUpdate({
                        meals: menuData.currentConfig.meals.map(m => m.id === meal.id ? { ...m, slots: m.slots.filter(s => s.id !== slot.id) } : m)
                      })}>
                        <Icon name="X" size={14} />
                      </Button>
                    </div>

                    {/* Tag Editor */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {slot.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-[10px] font-bold">
                          {tag}
                          <button onClick={() => handleRemoveTag(meal.id, slot.id, tag)} className="hover:text-rose-500">
                            <Icon name="X" size={10} />
                          </button>
                        </span>
                      ))}
                      <input 
                        placeholder="+ 标签"
                        className="bg-transparent border-none focus:ring-0 text-[10px] font-bold text-slate-400 w-16"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddTag(meal.id, slot.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => handleAddSlot(meal.id)}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 text-xs font-bold hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="PlusCircle" size={14} />
                  添加席位 (如：硬菜、汤品)
                </button>
              </div>
            </ColorCard>
          ))}
        </div>
      </div>
    </div>
  );
};
