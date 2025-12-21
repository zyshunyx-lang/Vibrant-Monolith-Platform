
import React, { useState, useMemo } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Input } from '../../../platform/ui/form/Input';
import { Select } from '../../../platform/ui/form/Select';
import { Modal } from '../../../platform/ui/layout/Modal';
import { useTranslation } from '../../../platform/core/i18n';
import { CalendarOverride, DutyModuleSchema } from '../types';

export const CalendarManager: React.FC = () => {
  const { t } = useTranslation();
  const [db, setDb] = useState(loadDb());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [newOverride, setNewOverride] = useState<CalendarOverride>({
    date: new Date().toISOString().split('T')[0],
    type: 'holiday',
    name: ''
  });

  const dutyData: DutyModuleSchema = db.modules.duty || {};
  const overrides = dutyData.calendarOverrides || [];

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add(new Date().getFullYear().toString());
    overrides.forEach(o => years.add(o.date.split('-')[0]));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [overrides]);

  const filteredOverrides = useMemo(() => {
    return overrides
      .filter(o => o.date.startsWith(selectedYear))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [overrides, selectedYear]);

  const saveOverrides = (newOverrides: CalendarOverride[]) => {
    const freshDb = loadDb();
    const currentDuty = freshDb.modules.duty || {};
    const newDb = {
      ...freshDb,
      modules: {
        ...freshDb.modules,
        duty: { ...currentDuty, calendarOverrides: newOverrides }
      }
    };
    saveDb(newDb);
    setDb(newDb);
  };

  const handleAddOverride = () => {
    if (overrides.some(o => o.date === newOverride.date)) {
      alert("Override already exists for this date.");
      return;
    }
    saveOverrides([...overrides, newOverride]);
    setIsAddModalOpen(false);
  };

  const removeOverride = (date: string) => {
    saveOverrides(overrides.filter(o => o.date !== date));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ColorCard 
        title={t('duty.calendar.title')} 
        variant="white"
        headerAction={
          <div className="flex items-center gap-3">
             <div className="w-32">
               <Select 
                 options={availableYears.map(y => ({ label: `${y} Year`, value: y }))}
                 value={selectedYear}
                 onChange={(e) => setSelectedYear(e.target.value)}
                 className="!py-1.5 !text-xs"
               />
             </div>
             <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
               <Icon name="CalendarPlus" size={16} className="mr-2" />
               {t('duty.calendar.add')}
             </Button>
          </div>
        }
      >
        <p className="text-slate-500 text-sm mb-6 font-medium">{t('duty.calendar.desc')}</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('duty.calendar.date')}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('duty.calendar.name')}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('duty.calendar.type')}</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOverrides.map(o => (
                <tr key={o.date} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{o.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{o.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${o.type === 'holiday' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {t(`duty.calendar.${o.type}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-600" onClick={() => removeOverride(o.date)}>
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredOverrides.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-300 italic">No special dates for {selectedYear}.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ColorCard>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('duty.calendar.add')}>
        <div className="space-y-4 py-2">
          <Input 
            label={t('duty.calendar.date')} 
            type="date" 
            value={newOverride.date} 
            onChange={e => setNewOverride({...newOverride, date: e.target.value})}
          />
          <Input 
            label={t('duty.calendar.name')} 
            placeholder="e.g. Spring Festival" 
            value={newOverride.name} 
            onChange={e => setNewOverride({...newOverride, name: e.target.value})}
          />
          <Select 
            label={t('duty.calendar.type')}
            value={newOverride.type}
            onChange={e => setNewOverride({...newOverride, type: e.target.value as any})}
            options={[
              {label: t('duty.calendar.holiday'), value: 'holiday'},
              {label: t('duty.calendar.workday_override'), value: 'workday_override'}
            ]}
          />
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleAddOverride}>{t('common.save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
