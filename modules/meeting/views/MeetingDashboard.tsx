
import React, { useState, useEffect } from 'react';
import { loadDb } from '../../../platform/core/db';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { Button } from '../../../platform/ui/basic/Button';
import { TimelineGrid } from '../components/TimelineGrid';
import { BookingModal } from '../components/BookingModal';
import { MeetingModuleSchema, MeetingBooking } from '../types';

export const MeetingDashboard: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingInitData, setBookingInitData] = useState<{ roomId?: string, startHour?: number }>({});

  const meetingData = db.modules.meeting as MeetingModuleSchema;

  useEffect(() => {
    const handleFocus = () => setDb(loadDb());
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleRefresh = () => {
    setDb(loadDb());
  };

  const handleSlotClick = (roomId: string, startHour: number) => {
    setBookingInitData({ roomId, startHour });
    setIsBookingModalOpen(true);
  };

  const handleBookingClick = (booking: MeetingBooking) => {
    alert(`会议主题: ${booking.subject}\n预约人ID: ${booking.userId}\n状态: ${booking.status}\n备注: ${booking.description || '无'}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            会议预约看板
            <Icon name="Calendar" size={32} className="text-indigo-600" />
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            直观查看会议室占用情况，点击空白区域即可快速发起预定。
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
           <Button variant="ghost" size="sm" onClick={() => {
             const d = new Date(selectedDate);
             d.setDate(d.getDate() - 1);
             setSelectedDate(d.toISOString().split('T')[0]);
           }}>
             <Icon name="ChevronLeft" size={20} />
           </Button>
           
           <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none font-black text-slate-700 focus:ring-0 cursor-pointer"
           />

           <Button variant="ghost" size="sm" onClick={() => {
             const d = new Date(selectedDate);
             d.setDate(d.getDate() + 1);
             setSelectedDate(d.toISOString().split('T')[0]);
           }}>
             <Icon name="ChevronRight" size={20} />
           </Button>
        </div>
      </header>

      {/* Main Grid View */}
      <TimelineGrid 
        rooms={meetingData.rooms}
        bookings={meetingData.bookings}
        selectedDate={selectedDate}
        onSlotClick={handleSlotClick}
        onBookingClick={handleBookingClick}
      />

      {/* Footer / Legend */}
      <footer className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-emerald-500" />
               <span className="text-xs font-bold text-slate-500">已确认预定</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-amber-400" />
               <span className="text-xs font-bold text-slate-500">待审批预约</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-indigo-600" />
               <span className="text-xs font-bold text-slate-500">我的预定</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-slate-200" />
               <span className="text-xs font-bold text-slate-500">已结束</span>
            </div>
         </div>
         
         <Button onClick={() => { setBookingInitData({}); setIsBookingModalOpen(true); }}>
           <Icon name="Plus" size={18} className="mr-2" />
           手动发起预约
         </Button>
      </footer>

      {/* Booking Dialog */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedDate={selectedDate}
        initialRoomId={bookingInitData.roomId}
        initialStartHour={bookingInitData.startHour}
        onSuccess={handleRefresh}
      />
    </div>
  );
};
