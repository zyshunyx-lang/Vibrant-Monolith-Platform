
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadDb, getCurrentUser } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Icon } from '../../../platform/ui/basic/Icon';
import { MeetingModuleSchema, MeetingBooking } from '../types';

export const HomeMeetingWidget: React.FC = () => {
  const db = loadDb();
  const user = getCurrentUser();
  const meetingData = db.modules.meeting as MeetingModuleSchema;
  
  const today = new Date().toISOString().split('T')[0];
  const nowStr = new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' });

  const myStats = useMemo(() => {
    if (!user || !meetingData.bookings) return { total: 0, next: null };

    const myTodayBookings = meetingData.bookings
      .filter(b => b.userId === user.id && b.date === today && b.status === 'confirmed')
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const nextMeeting = myTodayBookings.find(b => b.startTime > nowStr) || null;

    return {
      total: myTodayBookings.length,
      next: nextMeeting
    };
  }, [meetingData, user, today, nowStr]);

  const roomName = useMemo(() => {
    if (!myStats.next) return '';
    return meetingData.rooms.find(r => r.id === myStats.next?.roomId)?.name || '未知会议室';
  }, [myStats.next, meetingData.rooms]);

  return (
    <Link to="/meeting" className="block group h-full">
      <ColorCard 
        variant="white" 
        className="h-full hover:shadow-xl transition-all border-emerald-100 hover:border-emerald-200 overflow-hidden relative"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
            <Icon name="Users" size={24} />
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">今日会议</span>
             <span className="text-xl font-black text-emerald-600">{myStats.total} <small className="text-xs">场</small></span>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          {myStats.next ? (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-2">
              <div className="flex items-center gap-2">
                 <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-lg">即将开始</span>
                 <span className="text-xs font-black text-slate-700">{myStats.next.startTime}</span>
              </div>
              <h4 className="font-black text-slate-800 truncate">{myStats.next.subject}</h4>
              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Icon name="MapPin" size={12} /> {roomName}
              </p>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-xs font-bold text-slate-400 italic">
                {myStats.total > 0 ? '今日后续暂无会议' : '今日空闲，点击预约空间'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
             <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
               进入预定看板 <Icon name="ArrowRight" size={10} />
             </span>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
      </ColorCard>
    </Link>
  );
};
