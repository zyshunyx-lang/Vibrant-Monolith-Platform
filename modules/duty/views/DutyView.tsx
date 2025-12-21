import React, { useState } from 'react';
import { loadDb } from '../../../platform/core/db';
import { CalendarGrid } from '../../../platform/ui/complex/CalendarGrid';
import { Icon } from '../../../platform/ui/basic/Icon';
import { DutyModuleSchema } from '../types';

export const DutyView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const db = loadDb();
  
  // Ensure we have a valid structure even if the module is uninitialized or partially initialized
  const dutyData: DutyModuleSchema = {
    rosterConfigs: db.modules?.duty?.rosterConfigs || {},
    schedules: db.modules?.duty?.schedules || []
  };

  const getUserName = (id: string) => {
    const user = db.sys_config?.users?.find(u => u.id === id);
    return user ? user.realName : 'Unknown';
  };

  // Helper function to get local date string YYYY-MM-DD
  const toLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const renderDutyCell = (date: Date) => {
    const dateStr = toLocalDateString(date);
    
    // Safety check on schedules array
    const schedule = dutyData.schedules?.find(s => s.date === dateStr);

    if (!schedule) return null;

    // Display "Draft" status if not published
    if (schedule.status === 'draft') {
      return (
        <div className="flex flex-col items-center justify-center h-full opacity-40">
          <Icon name="EyeOff" size={14} className="text-slate-400" />
          <span className="text-[10px] font-bold uppercase mt-1 text-slate-400">Draft</span>
        </div>
      );
    }

    // Display published roster entries
    return (
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 shadow-sm">
          <Icon name="Crown" size={12} className="text-indigo-600 shrink-0" />
          <span className="text-[11px] font-black text-indigo-900 truncate">
            {getUserName(schedule.leaderId)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
          <Icon name="User" size={12} className="text-slate-400 shrink-0" />
          <span className="text-[11px] font-bold text-slate-700 truncate">
            {getUserName(schedule.memberId)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Duty Roster</h2>
        <p className="text-slate-500 font-medium">Monthly operational schedule.</p>
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