
import React, { useState } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { MeetingModuleSchema, MeetingBooking } from '../types';

export const MeetingAuditPanel: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [filter, setFilter] = useState<'pending' | 'history'>('pending');

  const meetingData = db.modules.meeting as MeetingModuleSchema;
  const bookings = meetingData.bookings || [];
  const rooms = meetingData.rooms || [];
  const users = db.sys_config.users || [];

  const displayedBookings = bookings
    .filter(b => filter === 'pending' ? b.status === 'pending' : b.status !== 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAction = (id: string, status: 'confirmed' | 'rejected') => {
    let reason = '';
    if (status === 'rejected') {
      const input = prompt('请输入驳回理由：');
      if (input === null) return;
      reason = input || '管理员未通过审核';
    }

    const freshDb = loadDb();
    const currentMeeting = freshDb.modules.meeting as MeetingModuleSchema;
    
    currentMeeting.bookings = currentMeeting.bookings.map(b => 
      b.id === id ? { ...b, status, description: reason ? `[审核意见: ${reason}] ${b.description || ''}` : b.description } : b
    );

    saveDb(freshDb);
    setDb(freshDb);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200 shadow-inner">
        <button 
          onClick={() => setFilter('pending')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'pending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
        >
          待审核 ({bookings.filter(b => b.status === 'pending').length})
        </button>
        <button 
          onClick={() => setFilter('history')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
        >
          处理历史
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayedBookings.map(booking => {
          const room = rooms.find(r => r.id === booking.roomId);
          const user = users.find(u => u.id === booking.userId);
          
          return (
            <div key={booking.id} className="bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-all border-b-4 border-b-slate-200">
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="neutral" className="mb-2 bg-indigo-50 text-indigo-600 border-none font-black uppercase tracking-widest">
                      {room?.name || '未知会议室'}
                    </Badge>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{booking.subject}</h3>
                  </div>
                  <Badge variant={booking.status === 'confirmed' ? 'success' : booking.status === 'rejected' ? 'danger' : 'warning'}>
                    {booking.status === 'confirmed' ? '已通过' : booking.status === 'rejected' ? '已驳回' : '待处理'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-bold">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Icon name="User" size={16} className="text-slate-300" />
                    <span>{user?.realName || '未知用户'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Icon name="Calendar" size={16} className="text-slate-300" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Icon name="Clock" size={16} className="text-slate-300" />
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Icon name="MessageSquare" size={16} className="text-slate-300" />
                    <span className="truncate">{booking.description || '无备注'}</span>
                  </div>
                </div>
              </div>

              {booking.status === 'pending' && (
                <div className="flex md:flex-col gap-2 shrink-0 justify-end">
                  <Button variant="ghost" className="text-rose-500 hover:bg-rose-50" onClick={() => handleAction(booking.id, 'rejected')}>
                    <Icon name="X" size={16} className="mr-2" /> 驳回
                  </Button>
                  <Button onClick={() => handleAction(booking.id, 'confirmed')}>
                    <Icon name="Check" size={16} className="mr-2" /> 通过
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {displayedBookings.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100 italic text-slate-400">
             <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-10" />
             暂无相关的预定记录
          </div>
        )}
      </div>
    </div>
  );
};
