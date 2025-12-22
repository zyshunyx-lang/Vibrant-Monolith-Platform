
import React, { useState, useEffect } from 'react';
import { loadDb } from '../../../platform/core/db';
import { CalendarGrid } from '../../../platform/ui/complex/CalendarGrid';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Button } from '../../../platform/ui/basic/Button';
import { useTranslation } from '../../../platform/core/i18n';
import { DutyModuleSchema } from '../types';
import { DayDetailModal } from '../components/DayDetailModal';
import { PersonalDashboard } from '../components/PersonalDashboard';

export const DutyView: React.FC = () => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [db, setDb] = useState(loadDb());
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [showDashboard, setShowDashboard] = useState(true);

  useEffect(() => {
    const handleFocus = () => setDb(loadDb());
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
  const dutyData = db.modules.duty as DutyModuleSchema;

  const getUserName = (id: string) => db.sys_config?.users?.find(u => u.id === id)?.realName || '未知';

  const renderDutyCell = (date: Date, dateStr: string) => {
    const schedule = dutyData.schedules?.find(s => s.date === dateStr);
    const isHoliday = dutyData.calendarOverrides?.some(o => o.date === dateStr && o.type === 'holiday');

    return (
      <div className="relative mt-1 flex flex-col gap-1 min-h-[40px] cursor-pointer group" onClick={() => { setSelectedDateStr(dateStr); setIsDetailModalOpen(true); }}>
        {isHoliday && <span className="absolute -top-6 left-0 text-[10px] font-black text-rose-500 bg-rose-50 px-1 rounded border border-rose-100">假</span>}
        {schedule && schedule.status === 'published' && (
          <div className="flex flex-col gap-1">
            {schedule.slots.map((slot, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 p-1 rounded shadow-sm group-hover:bg-indigo-50 transition-all">
                <span className="text-[9px] font-black text-slate-800 truncate block">{getUserName(slot.userId)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">值班表</h2>
          <p className="text-slate-500 font-medium mt-1">查看月度值班安排、进行在线换班与备勤登记。</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setShowDashboard(!showDashboard)}>
          <Icon name="LayoutDashboard" size={16} className="mr-2" />
          {showDashboard ? '隐藏个人面板' : '打开个人面板'}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className={`${showDashboard ? 'lg:col-span-3' : 'lg:col-span-4'} bg-white rounded-3xl p-6 shadow-sm border border-slate-100`}>
          <CalendarGrid currentDate={currentDate} onMonthChange={setCurrentDate} renderCell={renderDutyCell} />
        </div>
        {showDashboard && <div className="lg:col-span-1 h-full"><PersonalDashboard /></div>}
      </div>
      <DayDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} dateStr={selectedDateStr} onUpdate={() => setDb(loadDb())} readOnly={true} />
    </div>
  );
};
