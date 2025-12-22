import React, { useMemo } from 'react';
import { Icon } from '../../../../platform/ui/basic/Icon';
import { getUserDutyStats } from '../../logic/statsService';

interface StatsCardProps {
  userId: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ userId }) => {
  const stats = useMemo(() => getUserDutyStats(userId), [userId]);

  const metricItems = [
    { label: '累计值班', value: stats.total, icon: 'Award', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: '周末贡献', value: stats.weekend, icon: 'CalendarDays', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: '节假先锋', value: stats.holiday, icon: 'Tent', color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
          <Icon name="BarChart3" size={16} />
        </div>
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">值班统计看板</h4>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {metricItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center`}>
                <Icon name={item.icon as any} size={20} />
              </div>
              <span className="text-xs font-bold text-slate-500">{item.label}</span>
            </div>
            <span className="text-xl font-black text-slate-900">{item.value}<small className="text-[10px] ml-1 opacity-40">次</small></span>
          </div>
        ))}
      </div>
      
      {stats.history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">最近值班轨迹</h5>
           <div className="flex flex-wrap gap-1.5">
             {stats.history.map(h => (
               <span key={h} className="px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-md border border-slate-200">
                 {h.split('-').slice(1).join('/')}
               </span>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};