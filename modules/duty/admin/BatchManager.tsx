
import React, { useState } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Grid } from '../../../platform/ui/layout/Grid';
import { Badge } from '../../../platform/ui/basic/Badge';
import { generateMonthlySchedule } from '../logic/scheduler';
import { DutyModuleSchema, Schedule } from '../types';

export const BatchManager: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [previewData, setPreviewData] = useState<Schedule[]>([]);

  const dutyData: DutyModuleSchema = db.modules.duty || { rosterConfigs: {}, schedules: [] };

  const handleGenerate = () => {
    const newSchedules = generateMonthlySchedule(
      selectedYear,
      selectedMonth,
      db.sys_config.users,
      dutyData.rosterConfigs
    );
    setPreviewData(newSchedules);
  };

  const handlePublish = () => {
    if (previewData.length === 0) return;

    const publishedSchedules = previewData.map(s => ({ ...s, status: 'published' as const }));
    
    // Remove existing schedules for this month to avoid duplicates
    const filteredSchedules = dutyData.schedules.filter(s => {
      const d = new Date(s.date);
      return !(d.getFullYear() === selectedYear && d.getMonth() === selectedMonth);
    });

    const finalSchedules = [...filteredSchedules, ...publishedSchedules];

    // Create Notification
    const newNotification = {
      id: Date.now().toString(),
      targetUserId: 'all', // logic to broadcast
      type: 'success' as const,
      content: `The duty schedule for ${selectedYear}-${selectedMonth + 1} has been published!`,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const newDb = {
      ...db,
      notifications: [...db.notifications, newNotification],
      modules: {
        ...db.modules,
        duty: { ...dutyData, schedules: finalSchedules }
      }
    };

    saveDb(newDb);
    setDb(newDb);
    setPreviewData([]);
    alert('Schedule published successfully!');
  };

  const getUserName = (id: string) => db.sys_config.users.find(u => u.id === id)?.realName || 'Unknown';

  return (
    <div className="space-y-8">
      <ColorCard title="Schedule Engine" variant="white">
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">Target Month</label>
            <div className="flex gap-2">
              <select 
                value={selectedMonth}
                onChange={e => setSelectedMonth(parseInt(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
              <input 
                type="number" 
                value={selectedYear}
                onChange={e => setSelectedYear(parseInt(e.target.value))}
                className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-center"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleGenerate} variant="secondary">
              <Icon name="Cpu" size={18} className="mr-2" />
              Auto Generate
            </Button>
            {previewData.length > 0 && (
              <Button onClick={handlePublish}>
                <Icon name="Send" size={18} className="mr-2" />
                Publish Schedule
              </Button>
            )}
          </div>
        </div>
      </ColorCard>

      {previewData.length > 0 && (
        <ColorCard title="Draft Preview" variant="blue" className="animate-in slide-in-from-top-4 duration-300">
          <Grid cols={3}>
            {previewData.map(s => (
              <div key={s.id} className="p-4 bg-white rounded-2xl border border-blue-100 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-400">{s.date}</span>
                  <Badge variant="warning">DRAFT</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-blue-500 uppercase">Leader</p>
                    <p className="font-bold text-slate-700">{getUserName(s.leaderId)}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase">Member</p>
                    <p className="font-bold text-slate-700">{getUserName(s.memberId)}</p>
                  </div>
                </div>
              </div>
            ))}
          </Grid>
        </ColorCard>
      )}
    </div>
  );
};
