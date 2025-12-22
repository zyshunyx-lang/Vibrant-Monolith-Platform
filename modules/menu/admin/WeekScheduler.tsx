
import React, { useState, useMemo } from 'react';
import { loadDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Modal } from '../../../platform/ui/layout/Modal';
import { DailyEditor } from './DailyEditor';
import { MenuModuleSchema } from '../types';

export const WeekScheduler: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [baseDate, setBaseDate] = useState(new Date());
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const menuData = db.modules.menu as MenuModuleSchema;
  
  // Get all days of the current selected week
  const weekDays = useMemo(() => {
    const day = baseDate.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const startOfWeek = new Date(baseDate.setDate(diff));
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return {
        dateStr: d.toISOString().split('T')[0],
        dateObj: d,
        label: d.toLocaleDateString('zh-CN', { weekday: 'short', month: 'short', day: 'numeric' })
      };
    });
  }, [baseDate]);

  const weekId = useMemo(() => {
    const d = new Date(weekDays[0].dateObj);
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
  }, [weekDays]);

  const changeWeek = (direction: number) => {
    const next = new Date(baseDate);
    next.setDate(baseDate.getDate() + direction * 7);
    setBaseDate(next);
  };

  const reloadData = () => {
    setDb(loadDb());
    setEditingDate(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Icon name="CalendarDays" size={24} className="text-orange-500" />
            周排餐视图 (Week {weekId})
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Select a day to edit planning</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
           <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 hover:text-orange-600">
             <Icon name="ChevronLeft" size={20} />
           </button>
           <button onClick={() => setBaseDate(new Date())} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800">
             Today
           </button>
           <button onClick={() => changeWeek(1)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 hover:text-orange-600">
             <Icon name="ChevronRight" size={20} />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {weekDays.map(day => {
          // Fix: Look for the DailyMenu for this specific date string
          const dayPlan = menuData.schedules.find(s => s.date === day.dateStr);
          const isToday = day.dateStr === new Date().toISOString().split('T')[0];
          
          return (
            <div 
              key={day.dateStr}
              onClick={() => setEditingDate(day.dateStr)}
              className={`
                group relative bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col min-h-[220px] 
                hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1
                ${isToday ? 'ring-2 ring-orange-500 ring-offset-2' : ''}
              `}
            >
              <div className="mb-4">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isToday ? 'text-orange-500' : 'text-slate-400'}`}>
                   {day.label.split(' ')[0]}
                </p>
                <h4 className="text-lg font-black text-slate-800">{day.label.split(' ')[1]}</h4>
              </div>

              <div className="flex-1 space-y-3">
                {dayPlan ? (
                  // Fix: Iterate over the assignments map of the DailyMenu
                  Object.entries(dayPlan.assignments).map(([mealId, dishIds]) => {
                    const meal = menuData.currentConfig.meals.find(m => m.id === mealId);
                    const mainDishId = dishIds[0];
                    const dish = menuData.dishes.find(d => d.id === mainDishId);
                    
                    return (
                      <div key={mealId} className="space-y-1">
                        <div className="flex items-center gap-1">
                           <Icon name={meal?.name.includes('午') ? 'Sun' : 'Moon'} size={10} className="text-orange-300" />
                           <span className="text-[10px] font-bold text-slate-400">{meal?.name}:</span>
                        </div>
                        <p className="text-xs font-black text-slate-700 truncate pl-4">
                          {dish?.name || <span className="text-slate-300 font-medium">未设置</span>}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-4">
                    <Icon name="PlusCircle" size={32} className="mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">未排餐</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-black text-orange-600 uppercase flex items-center gap-1">
                  编辑排餐 <Icon name="ArrowRight" size={10} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Modal 
        isOpen={!!editingDate} 
        onClose={() => setEditingDate(null)} 
        title="编辑单日菜单"
        footer={null}
      >
        {editingDate && (
          <DailyEditor 
            dateStr={editingDate} 
            onSave={reloadData} 
            onClose={() => setEditingDate(null)} 
          />
        )}
      </Modal>
    </div>
  );
};
