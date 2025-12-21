import React, { useState } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { generateMonthlySchedule } from '../logic/scheduler';
import { CalendarGrid } from '../../../platform/ui/complex/CalendarGrid';
import { Schedule } from '../types';

export const BatchManager: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [viewDate, setViewDate] = useState(new Date());
  
  // Local state for draft/preview before persistence
  const [previewSchedules, setPreviewSchedules] = useState<Schedule[]>([]);

  // Generate draft based on roster rules
  const handleGenerate = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const newSchedules = generateMonthlySchedule(
      year, 
      month, 
      db.sys_config?.users || [], 
      db.modules?.duty?.rosterConfigs || {}
    );

    setPreviewSchedules(newSchedules);
  };

  // Persist draft to database and notify system
  const handlePublish = () => {
    if (previewSchedules.length === 0) return;

    if (!window.confirm(`Confirm to publish ${previewSchedules.length} shifts? This will notify all users.`)) return;

    const published = previewSchedules.map(s => ({ ...s, status: 'published' } as Schedule));

    const currentSchedules = db.modules?.duty?.schedules || [];
    const monthPrefix = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;
    const otherSchedules = currentSchedules.filter(s => !s.date.startsWith(monthPrefix));
    
    const finalSchedules = [...otherSchedules, ...published];

    const newNotif = {
      id: Date.now().toString(),
      targetUserId: 'ALL',
      type: 'info' as const,
      content: `📅 ${viewDate.getMonth() + 1}月排班表已公示，请及时查看。`,
      isRead: false,
      createdAt: new Date().toISOString(),
      linkUrl: '/duty'
    };

    const newDb = {
      ...db,
      notifications: [newNotif, ...db.notifications],
      modules: {
        ...db.modules,
        duty: {
          ...db.modules?.duty,
          schedules: finalSchedules
        }
      }
    };

    saveDb(newDb);
    setDb(newDb);
    setPreviewSchedules([]);
    alert('Schedule published successfully!');
  };

  const getUserName = (id: string) => db.sys_config?.users?.find(u => u.id === id)?.realName || 'Unknown';

  const toLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const renderCell = (date: Date) => {
    const dateStr = toLocalDateString(date);
    
    const inPreview = previewSchedules?.find(s => s.date === dateStr);
    const inDb = db.modules?.duty?.schedules?.find(s => s.date === dateStr);
    
    const schedule = inPreview || inDb;

    if (!schedule) return null;

    const isPreviewItem = !!inPreview;

    return (
      <div className={`mt-1 p-1 rounded border text-[10px] font-bold flex flex-col gap-1
        ${isPreviewItem 
          ? 'bg-orange-50 border-orange-200 text-orange-800'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
        <div className="flex justify-between items-center">
           <span className="truncate">{getUserName(schedule.leaderId)}</span>
           {isPreviewItem && <Icon name="Zap" size={8} />}
        </div>
        <div className="opacity-70 truncate">{getUserName(schedule.memberId)}</div>
      </div>
    );
  };

  return (
    <ColorCard title="Batch Scheduler" variant="blue">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end bg-white/50 p-4 rounded-xl border border-blue-100">
           <div>
              <p className="text-sm text-blue-800 font-bold mb-2">Operation Mode</p>
              <div className="flex gap-2">
                <Button onClick={handleGenerate} variant="primary">
                  <Icon name="Wand2" size={16} className="mr-2"/> 
                  Auto-Generate Draft
                </Button>
                {previewSchedules.length > 0 && (
                  <Button onClick={handlePublish} variant="secondary" className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">
                    <Icon name="Send" size={16} className="mr-2"/> 
                    Publish ({previewSchedules.length})
                  </Button>
                )}
              </div>
           </div>
           <div className="text-right">
             <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Status</div>
             {previewSchedules.length > 0 
               ? <span className="text-orange-600 font-black animate-pulse">PREVIEW MODE</span>
               : <span className="text-slate-400 font-bold">VIEWING DATABASE</span>
             }
           </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <CalendarGrid 
            currentDate={viewDate}
            onMonthChange={(d) => {
              setViewDate(d);
              setPreviewSchedules([]);
            }}
            renderCell={renderCell}
          />
        </div>
      </div>
    </ColorCard>
  );
};