
import React, { useState, useEffect } from 'react';
import { loadDb } from '../../../platform/core/db';
import { CalendarGrid } from '../../../platform/ui/complex/CalendarGrid';
import { Icon } from '../../../platform/ui/basic/Icon';
import { useTranslation } from '../../../platform/core/i18n';
import { DutyModuleSchema } from '../types';

export const DutyView: React.FC = () => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [db, setDb] = useState(loadDb());
  
  useEffect(() => {
    setDb(loadDb());
    const handleFocus = () => setDb(loadDb());
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
  const dutyData: DutyModuleSchema = db.modules?.duty?.categories ? db.modules.duty : {
    categories: [],
    rules: [],
    calendarOverrides: [],
    slotConfigs: [],
    rosterConfigs: {},
    schedules: [],
    rotationState: {},
    savedProfiles: [],
    currentProfileName: '默认方案'
  };

  const getUserName = (id: string) => db.sys_config?.users?.find(u => u.id === id)?.realName || 'Unknown';

  const renderDutyCell = (date: Date, dateStr: string) => {
    const schedule = dutyData.schedules?.find(s => s.date === dateStr);
    const isHoliday = dutyData.calendarOverrides?.some(o => o.date === dateStr && o.type === 'holiday');

    return (
      <div className="relative mt-1 flex flex-col gap-1 min-h-[40px]">
        {/* Holiday Marker - Positioned consistently with Admin view to avoid date overlap */}
        {isHoliday && (
          <span className="absolute -top-6 left-0 text-[10px] font-black text-rose-500 bg-rose-50 px-1 rounded border border-rose-100 shadow-sm z-10">
            假
          </span>
        )}

        {schedule ? (
          schedule.status === 'draft' ? (
            <div className="flex flex-col items-center justify-center py-4 opacity-30">
              <Icon name="EyeOff" size={14} />
              <span className="text-[9px] font-black uppercase mt-1">{t('duty.view.draft')}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {schedule.slots.map((slot, idx) => {
                const slotDef = dutyData.slotConfigs.find(s => s.id === slot.slotId);
                return (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-1.5 rounded-lg shadow-sm flex items-center justify-between group hover:bg-indigo-50 hover:border-indigo-100 transition-all">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5 truncate group-hover:text-indigo-400">
                        {slotDef?.name || `Slot ${slot.slotId}`}
                      </span>
                      <span className="text-[10px] font-bold text-slate-800 truncate leading-none group-hover:text-indigo-900">
                        {getUserName(slot.userId)}
                      </span>
                    </div>
                    <div className="w-5 h-5 rounded-md bg-white border border-slate-100 flex items-center justify-center shrink-0">
                      <Icon name="User" size={10} className="text-slate-300 group-hover:text-indigo-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('duty.view.title')}</h2>
          <p className="text-slate-500 font-medium">{t('duty.view.subtitle')}</p>
        </div>
        <div className="hidden md:flex gap-4">
           {dutyData.categories.map(cat => (
             <div key={cat.id} className="flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.name}</span>
               <span className="text-sm font-black text-slate-700">
                 {t('duty.view.active_count', { count: Object.values(dutyData.rosterConfigs).filter(r => r.categoryId === cat.id && !r.isExempt).length.toString() })}
               </span>
             </div>
           ))}
        </div>
      </header>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <CalendarGrid 
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
          renderCell={renderDutyCell}
        />
      </div>
    </div>
  );
};
