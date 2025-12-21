
import React, { useState, useEffect } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { generateMonthlySchedule } from '../logic/scheduler';
import { CalendarGrid } from '../../../platform/ui/complex/CalendarGrid';
import { Modal } from '../../../platform/ui/layout/Modal';
import { Select } from '../../../platform/ui/form/Select';
import { useTranslation } from '../../../platform/core/i18n';
import { Schedule, DutyModuleSchema, RotationState } from '../types';

export const BatchManager: React.FC = () => {
  const { t } = useTranslation();
  const [db, setDb] = useState(loadDb());
  const [viewDate, setViewDate] = useState(new Date());
  const [previewSchedules, setPreviewSchedules] = useState<Schedule[]>([]);
  const [nextState, setNextState] = useState<RotationState | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  // Track specific pointers for this generation session
  const [localPointers, setLocalPointers] = useState<RotationState>({});

  const dutyData = db.modules.duty as DutyModuleSchema;
  const users = db.sys_config.users;

  useEffect(() => {
    // Sync local pointers with DB state whenever view changes or generation resets
    setLocalPointers(dutyData.rotationState || {});
  }, [dutyData.rotationState]);

  const handleGenerate = () => {
    if (dutyData.slotConfigs.length === 0) {
      alert(t('duty.engine.slot_missing_error'));
      return;
    }

    // Pass the modified local pointers into the generation logic
    const modifiedDutyData = { ...dutyData, rotationState: localPointers };
    const result = generateMonthlySchedule(viewDate.getFullYear(), viewDate.getMonth(), users, modifiedDutyData);
    
    setPreviewSchedules(result.schedules);
    setNextState(result.nextRotationState);
  };

  const executePublish = () => {
    const monthPrefix = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;
    const otherSchedules = dutyData.schedules.filter(s => !s.date.startsWith(monthPrefix));
    const published = previewSchedules.map(s => ({ ...s, status: 'published' as const }));
    
    const newDb = {
      ...db,
      modules: {
        ...db.modules,
        duty: { 
          ...dutyData, 
          schedules: [...otherSchedules, ...published],
          rotationState: nextState || dutyData.rotationState
        }
      }
    };

    saveDb(newDb);
    setDb(newDb);
    setPreviewSchedules([]);
    setNextState(null);
    setIsPublishModalOpen(false);
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.realName || 'Unknown';

  const updatePointer = (trackKey: string, userId: string) => {
    setLocalPointers(prev => ({ ...prev, [trackKey]: userId }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Configuration Panel */}
      <ColorCard title="1. Initial Rotation Setup" variant="white">
        <p className="text-slate-500 text-sm mb-6">Select the <b>last person who worked</b> before this month to define the starting point.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dutyData.categories.map(cat => {
            const rule = dutyData.rules.find(r => r.categoryId === cat.id);
            const isSplit = rule?.strategy === 'split_loop';
            const catUsers = users.filter(u => dutyData.rosterConfigs[u.id]?.categoryId === cat.id && !dutyData.rosterConfigs[u.id]?.isExempt);
            
            const userOptions = [
              { label: '-- Use Start of Loop --', value: '' },
              ...catUsers.map(u => ({ label: u.realName, value: u.id }))
            ];

            return (
              <div key={cat.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-500" />
                   <h4 className="text-xs font-black text-slate-700 uppercase">{cat.name}</h4>
                </div>

                {!isSplit ? (
                  <Select 
                    label="Unified Pointer"
                    options={userOptions}
                    value={localPointers[`${cat.id}_unified`] || ''}
                    onChange={(e) => updatePointer(`${cat.id}_unified`, e.target.value)}
                    className="!py-1.5 !text-xs"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Select 
                      label="Workday"
                      options={userOptions}
                      value={localPointers[`${cat.id}_workday`] || ''}
                      onChange={(e) => updatePointer(`${cat.id}_workday`, e.target.value)}
                      className="!py-1.5 !text-xs"
                    />
                    <Select 
                      label="Holiday/Wknd"
                      options={userOptions}
                      value={localPointers[`${cat.id}_holiday`] || ''}
                      onChange={(e) => updatePointer(`${cat.id}_holiday`, e.target.value)}
                      className="!py-1.5 !text-xs"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ColorCard>

      {/* Engine Control */}
      <ColorCard title="2. Generate & Review" variant="blue">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 bg-white/50 p-4 rounded-3xl border border-blue-100">
            <input 
              type="month" 
              className="bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
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
              <Icon name="Wand2" size={16} className="mr-2"/> Generate Draft
            </Button>
            {previewSchedules.length > 0 && (
              <Button onClick={() => setIsPublishModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-emerald-100">
                <Icon name="Send" size={16} className="mr-2"/> Publish Schedule
              </Button>
            )}
          </div>

          <CalendarGrid 
            currentDate={viewDate}
            onMonthChange={(d) => { setViewDate(d); setPreviewSchedules([]); }}
            renderCell={(date, dateStr) => {
              const schedule = previewSchedules.find(s => s.date === dateStr) || dutyData.schedules.find(s => s.date === dateStr);
              const isHoliday = dutyData.calendarOverrides?.find(o => o.date === dateStr && o.type === 'holiday');
              const isPreview = previewSchedules.some(s => s.date === dateStr);

              return (
                <div className="relative mt-1 flex flex-col gap-1 min-h-[40px]">
                  {isHoliday && (
                    <span className="absolute -top-6 left-0 text-[10px] font-black text-rose-500 bg-rose-50 px-1 rounded border border-rose-100 shadow-sm z-10">
                      假
                    </span>
                  )}
                  {schedule?.slots.map(slot => (
                    <div key={slot.slotId} className={`px-2 py-0.5 rounded text-[9px] font-black border truncate ${isPreview ? 'bg-orange-50 border-orange-200 text-orange-700 animate-pulse' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
                      {getUserName(slot.userId)}
                    </div>
                  ))}
                </div>
              );
            }}
          />
        </div>
      </ColorCard>

      <Modal isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)} title={t('duty.engine.confirm_title')}>
        <div className="text-center p-4">
          <p className="text-slate-600 font-medium mb-6">
            Publish roster for {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}?
            <br/><span className="text-xs text-slate-400 mt-2 block italic">This will update pointers to ensure smooth rotation for next month.</span>
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setIsPublishModalOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={executePublish}>{t('common.save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
