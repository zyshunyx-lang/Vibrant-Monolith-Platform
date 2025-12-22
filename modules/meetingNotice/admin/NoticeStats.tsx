
import React, { useMemo } from 'react';
import { loadDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Grid } from '../../../platform/ui/layout/Grid';
import { Icon } from '../../../platform/ui/basic/Icon';
import { MeetingNoticeModuleSchema } from '../types';

export const NoticeStats: React.FC = () => {
  const db = loadDb();
  const noticeData = (db.modules.meetingNotice || { notices: [] }) as MeetingNoticeModuleSchema;
  const notices = noticeData.notices;

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthPrefix = now.toISOString().slice(0, 7);
    
    const attendeeCount: Record<string, number> = {};
    const organizerCount: Record<string, number> = {};
    
    notices.forEach(n => {
      n.attendees.forEach(a => { attendeeCount[a] = (attendeeCount[a] || 0) + 1; });
      organizerCount[n.organizer] = (organizerCount[n.organizer] || 0) + 1;
    });

    const topAttendees = Object.entries(attendeeCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const topOrganizers = Object.entries(organizerCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

    return {
      total: notices.length,
      thisMonth: notices.filter(n => n.startTime.startsWith(thisMonthPrefix)).length,
      criticalCount: notices.filter(n => n.urgency === 'critical').length,
      topAttendees,
      topOrganizers
    };
  }, [notices]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Grid cols={3}>
         <ColorCard variant="blue" className="!p-0 border-none shadow-blue-100">
            <div className="p-6 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">年度会议总数</p>
                  <h4 className="text-4xl font-black text-white">{stats.total}</h4>
               </div>
               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                  <Icon name="Calendar" size={32} />
               </div>
            </div>
         </ColorCard>
         <ColorCard variant="white" className="shadow-sm">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Icon name="TrendingUp" size={32} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">本月新增通知</p>
                  <h4 className="text-3xl font-black text-slate-800">{stats.thisMonth}</h4>
               </div>
            </div>
         </ColorCard>
         <ColorCard variant="white" className="shadow-sm">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                  <Icon name="ShieldAlert" size={32} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">特急件处理</p>
                  <h4 className="text-3xl font-black text-slate-800">{stats.criticalCount}</h4>
               </div>
            </div>
         </ColorCard>
      </Grid>

      <Grid cols={2}>
         <ColorCard title="参会人员负荷排榜" variant="white" className="shadow-sm">
            <div className="space-y-6 py-2">
               {stats.topAttendees.map(([name, count], idx) => (
                 <div key={name} className="flex items-center gap-4">
                    <span className="w-6 text-xs font-black text-slate-300">{idx + 1}</span>
                    <span className="w-20 text-sm font-bold text-slate-700">{name}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / stats.total) * 100}%` }} />
                    </div>
                    <span className="text-xs font-black text-slate-400">{count} 次</span>
                 </div>
               ))}
               {stats.topAttendees.length === 0 && <div className="py-20 text-center text-slate-300 italic">暂无数据</div>}
            </div>
         </ColorCard>

         <ColorCard title="主要召集单位分布" variant="white" className="shadow-sm">
            <div className="space-y-6 py-2">
               {stats.topOrganizers.map(([name, count], idx) => (
                 <div key={name} className="flex items-center gap-4">
                    <span className="w-6 text-xs font-black text-slate-300">{idx + 1}</span>
                    <span className="w-32 text-sm font-bold text-slate-700 truncate">{name}</span>
                    <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(count / stats.total) * 100}%` }} />
                    </div>
                    <span className="text-xs font-black text-slate-400">{count} 次</span>
                 </div>
               ))}
               {stats.topOrganizers.length === 0 && <div className="py-20 text-center text-slate-300 italic">暂无数据</div>}
            </div>
         </ColorCard>
      </Grid>
    </div>
  );
};
