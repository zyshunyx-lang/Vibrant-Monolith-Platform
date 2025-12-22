
import React from 'react';
import { Link } from 'react-router-dom';
import { loadDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Icon } from '../../../platform/ui/basic/Icon';
import { useTranslation } from '../../../platform/core/i18n';
import { DutyModuleSchema } from '../types';

export const DutyWidget: React.FC = () => {
  const { t } = useTranslation();
  const db = loadDb();
  const dutyData = (db.modules.duty || {}) as DutyModuleSchema;
  
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const todaySchedule = dutyData.schedules?.find(s => s.date === dateStr && s.status === 'published');
  const users = db.sys_config.users;

  return (
    <Link to="/duty" className="block group h-full">
      <ColorCard 
        variant="blue" 
        title={
          <div className="flex items-center gap-2">
            <Icon name="CalendarClock" size={20} />
            <span>今日值班</span>
          </div>
        }
        className="h-full hover:shadow-lg transition-shadow border-blue-200"
      >
        <div className="space-y-4">
          {todaySchedule ? (
            <div className="grid grid-cols-1 gap-3">
              {todaySchedule.slots.map((slot, idx) => {
                const user = users.find(u => u.id === slot.userId);
                const slotDef = dutyData.slotConfigs?.find(s => s.id === slot.slotId);
                return (
                  <div key={idx} className="bg-white/50 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between border border-blue-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">{slotDef?.name || '岗位'}</span>
                      <span className="text-sm font-bold text-slate-800">{user?.realName || '未知'}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                      {user?.realName?.charAt(0) || '?'}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-blue-400">
              <Icon name="CalendarX2" size={32} className="mb-2 opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest">今日暂无排班</p>
            </div>
          )}
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              查看完整排班 <Icon name="ArrowRight" size={10} />
            </span>
          </div>
        </div>
      </ColorCard>
    </Link>
  );
};