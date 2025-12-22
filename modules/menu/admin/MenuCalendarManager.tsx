
import React, { useState } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { CalendarGrid } from '../../../platform/ui/complex/CalendarGrid';
import { BulkActionToolbar } from '../../../platform/ui/complex/BulkActionToolbar';
import { Modal } from '../../../platform/ui/layout/Modal';
import { DailyEditor } from './DailyEditor';
import { MenuModuleSchema, DailyMenu } from '../types';

export const MenuCalendarManager: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [viewDate, setViewDate] = useState(new Date());
  const [editingDateStr, setEditingDateStr] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  const menuData = db.modules.menu as MenuModuleSchema;
  const schedules = menuData.schedules || [];

  const handleUpdate = () => {
    setDb(loadDb());
    setEditingDateStr(null);
  };

  const toggleSelectDate = (dateStr: string) => {
    const next = new Set(selectedDates);
    if (next.has(dateStr)) next.delete(dateStr);
    else next.add(dateStr);
    setSelectedDates(next);
  };

  const handleBulkPublish = () => {
    const currentMonthPrefix = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;
    const freshDb = loadDb();
    const freshMenu = freshDb.modules.menu as MenuModuleSchema;
    
    const updatedSchedules = freshMenu.schedules.map(s => {
      const isSelectedOrInCurrentMonth = s.date.startsWith(currentMonthPrefix);
      if (isSelectedOrInCurrentMonth && s.status === 'draft') {
        return { ...s, status: 'published' as const, lastUpdated: new Date().toISOString() };
      }
      return s;
    });

    saveDb({ ...freshDb, modules: { ...freshDb.modules, menu: { ...freshMenu, schedules: updatedSchedules } } });
    setDb(loadDb());
    alert("本月所有草案已发布！");
  };

  const handleBulkClearDrafts = () => {
    if (!confirm('确定清空当前月的所有未发布草稿吗？')) return;
    const currentMonthPrefix = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;
    const freshDb = loadDb();
    const freshMenu = freshDb.modules.menu as MenuModuleSchema;
    
    const updatedSchedules = freshMenu.schedules.filter(s => 
      !(s.date.startsWith(currentMonthPrefix) && s.status === 'draft')
    );

    saveDb({ ...freshDb, modules: { ...freshDb.modules, menu: { ...freshMenu, schedules: updatedSchedules } } });
    setDb(loadDb());
  };

  const renderCell = (date: Date, dateStr: string) => {
    const dayPlan = schedules.find(s => s.date === dateStr);
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    
    return (
      <div 
        onClick={() => setEditingDateStr(dateStr)}
        className={`
          flex-1 mt-1 rounded-xl p-2 cursor-pointer transition-all border relative group
          ${dayPlan ? (dayPlan.status === 'published' ? 'bg-orange-50/30 border-orange-100' : 'bg-slate-50 border-dashed border-slate-200') : 'hover:bg-slate-50 border-transparent'}
        `}
      >
        {dayPlan ? (
          <div className="space-y-1">
             <div className="flex items-center justify-between mb-1">
               <Badge variant={dayPlan.status === 'published' ? 'success' : 'neutral'} className="text-[8px] px-1 py-0 font-black">
                 {dayPlan.status === 'published' ? '已发布' : '草稿'}
               </Badge>
               <span className="text-[8px] text-slate-300 font-bold">{new Date(dayPlan.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
             </div>
             
             {Object.entries(dayPlan.assignments).slice(0, 2).map(([mealId, dishIds]) => {
                const meal = menuData.currentConfig.meals.find(m => m.id === mealId);
                const firstDish = menuData.dishes.find(d => d.id === dishIds[0]);
                return (
                  <div key={mealId} className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase leading-none">{meal?.name}</span>
                    <span className="text-[10px] font-bold text-slate-700 truncate">{firstDish?.name || '---'}</span>
                  </div>
                );
             })}
             
             {Object.keys(dayPlan.assignments).length > 2 && (
               <div className="text-[8px] text-slate-400 italic">+{Object.keys(dayPlan.assignments).length - 2} more...</div>
             )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon name="PlusCircle" size={24} className="text-slate-200" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ColorCard title="月度排餐工作台" variant="white">
        <div className="space-y-6">
          <CalendarGrid 
            currentDate={viewDate}
            onMonthChange={setViewDate}
            renderCell={renderCell}
          />
        </div>
      </ColorCard>

      <BulkActionToolbar 
        selectedCount={1} // Static context for toolbar to stay visible if logic needs it, or use dynamic selection
        // Fix: Removed invalid 'selectedLabel' property
        onClear={() => {}} 
        actions={[
          { label: '发布本月草案', icon: 'Send', onClick: handleBulkPublish, variant: 'primary' },
          { label: '清空本月草稿', icon: 'Trash2', onClick: handleBulkClearDrafts, variant: 'ghost' },
        ]}
      />

      <Modal 
        isOpen={!!editingDateStr} 
        onClose={() => setEditingDateStr(null)} 
        title={`${editingDateStr} 排餐编辑`}
        footer={null}
      >
        {editingDateStr && (
          <DailyEditor 
            dateStr={editingDateStr} 
            onSave={handleUpdate} 
            onClose={() => setEditingDateStr(null)} 
          />
        )}
      </Modal>
    </div>
  );
};
