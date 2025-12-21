import React, { useState } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { generateMonthlySchedule } from '../logic/scheduler';
import { CalendarGrid } from '../../../platform/ui/complex/CalendarGrid';
import { Modal } from '../../../platform/ui/layout/Modal';
import { useTranslation } from '../../../platform/core/i18n';
import { Schedule, DutyModuleSchema } from '../types';

export const BatchManager: React.FC = () => {
  const { t } = useTranslation();
  const [db, setDb] = useState(loadDb());
  const [viewDate, setViewDate] = useState(new Date());
  const [previewSchedules, setPreviewSchedules] = useState<Schedule[]>([]);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const dutyData: DutyModuleSchema = (db.modules.duty && db.modules.duty.categories) 
    ? db.modules.duty 
    : {
        categories: [],
        rules: [],
        calendarOverrides: [],
        slotConfigs: [],
        rosterConfigs: {},
        schedules: []
      };

  const handleGenerate = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const users = db.sys_config?.users || [];

    if (dutyData.slotConfigs.length === 0) {
      alert(t('duty.engine.slot_missing_error'));
      return;
    }

    const newSchedules = generateMonthlySchedule(year, month, users, dutyData);
    setPreviewSchedules(newSchedules);
  };

  const executePublish = () => {
    const year = viewDate.getFullYear();
    const monthStr = String(viewDate.getMonth() + 1).padStart(2, '0');
    const monthPrefix = `${year}-${monthStr}`;

    const currentSchedules = dutyData.schedules || [];
    const otherSchedules = currentSchedules.filter(s => !s.date.startsWith(monthPrefix));
    
    const published = previewSchedules.map(s => ({ ...s, status: 'published' as const }));
    const finalSchedules = [...otherSchedules, ...published];

    const newDb = {
      ...db,
      modules: {
        ...db.modules,
        duty: { ...dutyData, schedules: finalSchedules }
      }
    };

    saveDb(newDb);
    setDb(newDb);
    setPreviewSchedules([]);
    setIsPublishModalOpen(false);
  };

  const getUserName = (id: string) => db.sys_config?.users?.find(u => u.id === id)?.realName || 'Unknown';

  const renderCell = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const inPreview = previewSchedules?.find(s => s.date === dateStr);
    const inDb = dutyData.schedules?.find(s => s.date === dateStr);
    const schedule = inPreview || inDb;

    if (!schedule) return null;

    const isPreview = !!inPreview;

    return (
      <div className={`mt-1 flex flex-col gap-1 ${isPreview ? 'animate-pulse' : ''}`}>
        {schedule.slots.map(slot => (
          <div 
            key={slot.slotId} 
            className={`px-2 py-0.5 rounded text-[9px] font-black border truncate
              ${isPreview ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}
            `}
          >
            {getUserName(slot.userId)}
          </div>
        ))}
      </div>
    );
  };

  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <ColorCard title={t('duty.engine.title')} variant="blue">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 bg-white/50 p-4 rounded-3xl border border-blue-100">
          <input 
            type="month" 
            className="bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700"
            value={`${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`}
            onChange={(e) => {
              const val = e.target.value;
              if(val) {
                const [y, m] = val.split('-');
                setViewDate(new Date(parseInt(y), parseInt(m) - 1, 1));
                setPreviewSchedules([]);
              }
            }}
          />
          <Button onClick={handleGenerate} variant="primary">
            <Icon name="Wand2" size={16} className="mr-2"/> {t('duty.engine.generate')}
          </Button>
          {previewSchedules.length > 0 && (
            <Button onClick={() => setIsPublishModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-emerald-100">
              <Icon name="Send" size={16} className="mr-2"/> {t('duty.engine.publish')}
            </Button>
          )}
        </div>

        <CalendarGrid 
          currentDate={viewDate}
          onMonthChange={(d) => { setViewDate(d); setPreviewSchedules([]); }}
          renderCell={renderCell}
        />
      </div>

      <Modal isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)} title={t('duty.engine.confirm_title')} footer={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setIsPublishModalOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={executePublish}>{t('common.save')}</Button>
        </div>
      }>
        <div className="text-center p-4">
          <p className="text-slate-600 font-medium mb-6">
            {t('duty.engine.confirm_msg', { month: monthName })}
          </p>
        </div>
      </Modal>
    </ColorCard>
  );
};