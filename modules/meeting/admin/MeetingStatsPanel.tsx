
import React, { useMemo } from 'react';
import { loadDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Grid } from '../../../platform/ui/layout/Grid';
import { Icon } from '../../../platform/ui/basic/Icon';
import { MeetingModuleSchema, MeetingBooking } from '../types';

export const MeetingStatsPanel: React.FC = () => {
  const db = loadDb();
  const meetingData = db.modules.meeting as MeetingModuleSchema;
  const bookings = meetingData.bookings || [];
  const rooms = meetingData.rooms || [];

  const stats = useMemo(() => {
    // Basic calculation logic for the current week
    const now = new Date();
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    
    let totalMinutes = 0;
    const roomUtilization: Record<string, number> = {};

    confirmedBookings.forEach(b => {
      const [h1, m1] = b.startTime.split(':').map(Number);
      const [h2, m2] = b.endTime.split(':').map(Number);
      const duration = (h2 * 60 + m2) - (h1 * 60 + m1);
      
      totalMinutes += duration;
      roomUtilization[b.roomId] = (roomUtilization[b.roomId] || 0) + duration;
    });

    const avgDuration = confirmedBookings.length > 0 ? Math.round(totalMinutes / confirmedBookings.length) : 0;
    
    // Calculate busier room
    let busiestRoomId = '';
    let maxTime = 0;
    Object.entries(roomUtilization).forEach(([id, time]) => {
      if (time > maxTime) {
        maxTime = time;
        busiestRoomId = id;
      }
    });

    return {
      totalCount: confirmedBookings.length,
      avgDuration,
      busiestRoom: rooms.find(r => r.id === busiestRoomId)?.name || '暂无数据',
      utilizationData: rooms.map(r => {
        const usedMinutes = roomUtilization[r.id] || 0;
        // Assume 12 hours per day * 7 days = 5040 minutes weekly capacity
        const rate = Math.min(100, Math.round((usedMinutes / 5040) * 100));
        return { name: r.name, rate };
      }).sort((a, b) => b.rate - a.rate)
    };
  }, [bookings, rooms]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Grid cols={3}>
        <ColorCard variant="white" className="!p-0 overflow-hidden shadow-sm">
           <div className="p-6 flex items-center gap-6">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                 <Icon name="CalendarCheck" size={28} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">本周预定总数</p>
                 <p className="text-3xl font-black text-slate-800">{stats.totalCount} <small className="text-xs font-bold text-slate-300">场</small></p>
              </div>
           </div>
        </ColorCard>
        
        <ColorCard variant="white" className="!p-0 overflow-hidden shadow-sm">
           <div className="p-6 flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                 <Icon name="Timer" size={28} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">平均会议时长</p>
                 <p className="text-3xl font-black text-slate-800">{stats.avgDuration} <small className="text-xs font-bold text-slate-300">分钟</small></p>
              </div>
           </div>
        </ColorCard>

        <ColorCard variant="white" className="!p-0 overflow-hidden shadow-sm">
           <div className="p-6 flex items-center gap-6">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                 <Icon name="Zap" size={28} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">最忙碌会议室</p>
                 <p className="text-xl font-black text-slate-800 truncate">{stats.busiestRoom}</p>
              </div>
           </div>
        </ColorCard>
      </Grid>

      <ColorCard title="空间利用率排行 (Weekly Occupancy)" variant="white">
        <div className="space-y-8 py-4">
           {stats.utilizationData.map(item => (
             <div key={item.name} className="space-y-3">
                <div className="flex items-center justify-between text-sm font-bold">
                   <span className="text-slate-700">{item.name}</span>
                   <span className={item.rate > 80 ? 'text-rose-500' : item.rate < 30 ? 'text-emerald-500' : 'text-slate-400'}>
                     {item.rate}% 利用率
                   </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                    className={`h-full transition-all duration-1000 ${
                      item.rate > 80 ? 'bg-rose-500' : item.rate > 50 ? 'bg-indigo-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${item.rate}%` }} 
                   />
                </div>
             </div>
           ))}
           {stats.utilizationData.length === 0 && (
             <div className="text-center py-10 text-slate-300 italic text-sm">暂无空间使用数据</div>
           )}
        </div>
      </ColorCard>
    </div>
  );
};
