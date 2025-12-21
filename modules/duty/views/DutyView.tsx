
import React, { useState } from 'react';
import { loadDb } from '../../../platform/core/db';
import { CalendarGrid } from '../../../platform/ui/complex/CalendarGrid';
import { Badge } from '../../../platform/ui/basic/Badge';
import { Icon } from '../../../platform/ui/basic/Icon';
import { DutyModuleSchema } from '../types';

export const DutyView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const db = loadDb();
  const dutyData: DutyModuleSchema = db.modules.duty || { rosterConfigs: {}, schedules: [] };

  const getUserName = (id: string) => db.sys_config.users.find(u => u.id === id)?.realName || 'Unknown';

  const renderDutyCell = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const schedule = dutyData.schedules.find(s => s.date === dateStr);

    if (!schedule) return null;

    if (schedule.status === 'draft') {
      return (
        <div className="flex flex-col items-center justify-center h-full opacity-30">
          <Icon name="EyeOff" size={16} />
          <span className="text-[10px] font-bold uppercase mt-1">Unpublished</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
          <Icon name="Crown" size={12} className="text-indigo-600" />
          <span className="text-xs font-black text-indigo-800 truncate">{getUserName(schedule.leaderId)}</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          <Icon name="User" size={12} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-600 truncate">{getUserName(schedule.memberId)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Duty Schedule</h2>
        <p className="text-slate-500 font-medium">Daily operational leads and support assignments.</p>
      </header>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <CalendarGrid 
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
          renderCell={renderDutyCell}
        />
      </div>
    </div>
  );
};
