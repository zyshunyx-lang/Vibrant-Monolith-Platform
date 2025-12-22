
import React from 'react';
import { MeetingRoom, MeetingBooking } from '../types';
import { Icon } from '../../../platform/ui/basic/Icon';
import { getCurrentUser } from '../../../platform/core/db';

interface TimelineGridProps {
  rooms: MeetingRoom[];
  bookings: MeetingBooking[];
  selectedDate: string;
  onSlotClick: (roomId: string, hour: number) => void;
  onBookingClick: (booking: MeetingBooking) => void;
}

const START_HOUR = 8;
const END_HOUR = 20;
const TOTAL_HOURS = END_HOUR - START_HOUR;

export const TimelineGrid: React.FC<TimelineGridProps> = ({ 
  rooms, 
  bookings, 
  selectedDate, 
  onSlotClick,
  onBookingClick 
}) => {
  const currentUser = getCurrentUser();
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  const timeToPercent = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = (h - START_HOUR) * 60 + m;
    const percent = (totalMinutes / (TOTAL_HOURS * 60)) * 100;
    return Math.max(0, Math.min(100, percent));
  };

  const statusMap: Record<string, string> = {
    pending: '待审批',
    confirmed: '已预约',
    rejected: '已驳回',
    cancelled: '已取消'
  };

  const getStatusStyles = (booking: MeetingBooking) => {
    const isPast = new Date(`${booking.date}T${booking.endTime}`) < new Date();
    const isMine = booking.userId === currentUser?.id;

    if (isPast) return 'bg-slate-200 text-slate-500 border-slate-300 opacity-60';
    if (booking.status === 'pending') return 'bg-amber-100 text-amber-700 border-amber-200 border-l-4 border-l-amber-500';
    if (isMine) return 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-200 z-10';
    return 'bg-emerald-500 text-white border-emerald-600';
  };

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="flex border-b border-slate-50">
        <div className="w-48 shrink-0 p-4 bg-slate-50/50 border-r border-slate-100 flex items-center justify-center">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">会议室 \ 时间轴轴线</span>
        </div>
        <div className="flex-1 grid grid-cols-12 relative h-12">
          {hours.map((h, i) => (
            <div key={h} className="relative flex justify-start pl-2 pt-4">
               <span className="text-[10px] font-black text-slate-400">{String(h).padStart(2, '0')}:00</span>
               {i < TOTAL_HOURS && <div className="absolute top-0 right-0 h-full w-px bg-slate-100" />}
            </div>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-50">
        {rooms.map(room => (
          <div key={room.id} className="flex group/row">
            <div className="w-48 shrink-0 p-4 bg-slate-50/30 border-r border-slate-100 group-hover/row:bg-slate-50 transition-colors">
              <h4 className="text-sm font-black text-slate-800 truncate">{room.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                <Icon name="Users" size={10} /> 容纳 {room.capacity} 人
              </p>
            </div>

            <div className="flex-1 relative h-20 bg-white group-hover/row:bg-slate-50/20 transition-colors overflow-hidden">
               <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                 {Array.from({ length: 12 }).map((_, i) => <div key={i} className="border-r border-slate-50 h-full" />)}
               </div>

               <div className="absolute inset-0 grid grid-cols-24">
                 {Array.from({ length: 24 }).map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => onSlotClick(room.id, START_HOUR + (i * 0.5))}
                      className="h-full hover:bg-indigo-50/40 transition-colors border-r border-slate-50/30"
                    />
                 ))}
               </div>

               {bookings
                .filter(b => b.roomId === room.id && b.date === selectedDate)
                .map(booking => {
                  const start = timeToPercent(booking.startTime);
                  const end = timeToPercent(booking.endTime);
                  const width = end - start;

                  return (
                    <div
                      key={booking.id}
                      onClick={() => onBookingClick(booking)}
                      className={`absolute top-2 bottom-2 rounded-xl border p-2 flex flex-col justify-center cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg overflow-hidden ${getStatusStyles(booking)}`}
                      style={{ left: `${start}%`, width: `${width}%` }}
                    >
                      <span className="text-[10px] font-black truncate leading-none mb-0.5">{booking.subject}</span>
                      <span className="text-[9px] font-bold opacity-80 truncate leading-none">{statusMap[booking.status] || booking.status}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
