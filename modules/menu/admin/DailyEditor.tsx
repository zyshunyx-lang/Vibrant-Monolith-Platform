
import React, { useState, useEffect } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { MenuModuleSchema, Dish, MenuStatus, DailyMenu } from '../types';

interface DailyEditorProps {
  dateStr: string;
  onSave: () => void;
  onClose: () => void;
}

export const DailyEditor: React.FC<DailyEditorProps> = ({ dateStr, onSave, onClose }) => {
  const [db, setDb] = useState(loadDb());
  const menuData = db.modules.menu as MenuModuleSchema;
  const config = menuData.currentConfig;
  const dishes = menuData.dishes || [];

  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<MenuStatus>('draft');

  useEffect(() => {
    const existing = menuData.schedules.find(s => s.date === dateStr);
    
    if (existing) {
      setAssignments(existing.assignments);
      setStatus(existing.status);
    } else {
      const initial: Record<string, string[]> = {};
      config.meals.forEach(meal => {
        initial[meal.id] = new Array(meal.slots.length).fill('');
      });
      setAssignments(initial);
      setStatus('draft');
    }
  }, [dateStr]);

  const handleDishChange = (mealId: string, slotIdx: number, dishId: string) => {
    setAssignments(prev => ({
      ...prev,
      [mealId]: (prev[mealId] || []).map((id, idx) => idx === slotIdx ? dishId : id)
    }));
  };

  const handleSave = (targetStatus: MenuStatus) => {
    const freshDb = loadDb();
    const currentMenu = freshDb.modules.menu as MenuModuleSchema;
    
    const newEntry: DailyMenu = {
      date: dateStr,
      assignments,
      status: targetStatus,
      lastUpdated: new Date().toISOString()
    };

    let nextSchedules = [...currentMenu.schedules];
    const existingIdx = nextSchedules.findIndex(s => s.date === dateStr);
    
    if (existingIdx >= 0) {
      nextSchedules[existingIdx] = newEntry;
    } else {
      nextSchedules.push(newEntry);
    }

    const newDb = {
      ...freshDb,
      modules: { ...freshDb.modules, menu: { ...currentMenu, schedules: nextSchedules } }
    };
    
    saveDb(newDb);
    onSave();
  };

  const getSmartSortedOptions = (slotTags: string[]) => {
    const recommended = dishes.filter(d => d.tags.some(t => slotTags.includes(t)));
    const others = dishes.filter(d => !d.tags.some(t => slotTags.includes(t)));
    
    return [
      ...recommended.map(d => ({ ...d, isRecommended: true })),
      ...others.map(d => ({ ...d, isRecommended: false }))
    ];
  };

  return (
    <div className="space-y-8 py-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{dateStr} 排餐管理</h2>
          <div className="flex items-center gap-2 mt-1">
             <Badge variant={status === 'published' ? 'success' : 'neutral'} className="text-[10px] font-black uppercase">
               {status === 'published' ? '已发布' : '编辑中'}
             </Badge>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Planning</span>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
        {config.meals.map(meal => (
          <ColorCard 
            key={meal.id} 
            variant="white"
            title={
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Icon name={meal.name.includes('午') ? 'Sun' : 'Moon'} size={16} />
                </div>
                {meal.name}
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {meal.slots.map((slot, idx) => {
                const options = getSmartSortedOptions(slot.tags);
                const currentDishId = assignments[meal.id]?.[idx] || '';
                
                return (
                  <div key={slot.id} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{slot.name}</label>
                      <div className="flex gap-1">
                        {slot.tags.map(t => (
                          <Badge key={t} className="text-[9px] py-0 px-1 bg-indigo-50 text-indigo-400 border-none">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="relative group/select">
                      <select 
                        value={currentDishId}
                        onChange={(e) => handleDishChange(meal.id, idx, e.target.value)}
                        className={`
                          w-full pl-10 pr-4 py-3 rounded-2xl border appearance-none transition-all
                          font-bold text-sm outline-none focus:ring-4 focus:ring-orange-500/10
                          ${currentDishId ? 'border-orange-200 text-slate-800 bg-white' : 'border-slate-200 text-slate-400 italic bg-slate-50'}
                        `}
                      >
                        <option value="">-- 未选择 --</option>
                        {options.map(dish => (
                          <option key={dish.id} value={dish.id}>
                            {dish.isRecommended ? '✨ ' : ''}{dish.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-orange-500 transition-colors">
                        <Icon name="Utensils" size={16} />
                      </div>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                        <Icon name="ChevronDown" size={16} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ColorCard>
        ))}
      </div>

      <div className="flex gap-3 pt-6 border-t border-slate-100">
         <Button variant="secondary" onClick={onClose} className="flex-1">取消</Button>
         <Button variant="ghost" className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => handleSave('draft')}>
           <Icon name="Save" size={16} className="mr-2" />
           暂存草稿
         </Button>
         <Button className="flex-1 shadow-orange-100" onClick={() => handleSave('published')}>
           <Icon name="Send" size={16} className="mr-2" />
           直接发布
         </Button>
      </div>
    </div>
  );
};
