
import React, { useState, useEffect } from 'react';
import { Modal } from '../../../platform/ui/layout/Modal';
import { Button } from '../../../platform/ui/basic/Button';
import { Input } from '../../../platform/ui/form/Input';
import { Select } from '../../../platform/ui/form/Select';
import { Icon } from '../../../platform/ui/basic/Icon';
import { loadDb, saveDb, getCurrentUser } from '../../../platform/core/db';
import { MeetingRoom, MeetingBooking, MeetingModuleSchema } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  initialRoomId?: string;
  initialStartHour?: number;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  initialRoomId = '', 
  initialStartHour = 9,
  onSuccess 
}) => {
  const db = loadDb();
  const currentUser = getCurrentUser();
  const meetingData = db.modules.meeting as MeetingModuleSchema;
  const rooms = meetingData.rooms.filter(r => r.status === 'active');

  const [form, setForm] = useState({
    roomId: initialRoomId,
    subject: '',
    date: selectedDate,
    startTime: `${String(Math.floor(initialStartHour)).padStart(2, '0')}:${initialStartHour % 1 === 0 ? '00' : '30'}`,
    endTime: `${String(Math.floor(initialStartHour + 1)).padStart(2, '0')}:${initialStartHour % 1 === 0 ? '00' : '30'}`,
    description: ''
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(prev => ({
        ...prev,
        roomId: initialRoomId || prev.roomId,
        date: selectedDate,
        startTime: `${String(Math.floor(initialStartHour)).padStart(2, '0')}:${initialStartHour % 1 === 0 ? '00' : '30'}`,
        endTime: `${String(Math.floor(initialStartHour + 1)).padStart(2, '0')}:${initialStartHour % 1 === 0 ? '00' : '30'}`
      }));
      setError(null);
    }
  }, [isOpen, initialRoomId, initialStartHour, selectedDate]);

  const checkConflict = () => {
    const start = form.startTime;
    const end = form.endTime;
    
    return meetingData.bookings.some(b => {
      if (b.roomId !== form.roomId || b.date !== form.date || b.status === 'rejected' || b.status === 'cancelled') return false;
      // Overlap logic: (StartA < EndB) && (EndA > StartB)
      return (form.startTime < b.endTime) && (form.endTime > b.startTime);
    });
  };

  const handleSave = () => {
    if (!form.subject || !form.roomId || !currentUser) {
      setError("请填写会议主题并选择会议室");
      return;
    }

    if (form.endTime <= form.startTime) {
      setError("结束时间必须晚于开始时间");
      return;
    }

    if (checkConflict()) {
      setError("所选时间段已被占用，请调整");
      return;
    }

    const selectedRoom = rooms.find(r => r.id === form.roomId);
    const newBooking: MeetingBooking = {
      id: `book_${Date.now()}`,
      roomId: form.roomId,
      userId: currentUser.id,
      subject: form.subject,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      description: form.description,
      status: selectedRoom?.needApproval ? 'pending' : 'confirmed',
      createdAt: new Date().toISOString()
    };

    const freshDb = loadDb();
    freshDb.modules.meeting.bookings.push(newBooking);
    saveDb(freshDb);
    
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="预约会议室" footer={null}>
      <div className="space-y-5 py-2">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2 animate-pulse">
            <Icon name="AlertCircle" size={16} />
            {error}
          </div>
        )}

        <Input 
          label="会议主题" 
          placeholder="请输入会议名称或事由" 
          value={form.subject} 
          onChange={e => setForm({...form, subject: e.target.value})} 
          autoFocus
        />

        <Select 
          label="会议地点" 
          options={[{label: '-- 请选择会议室 --', value: ''}, ...rooms.map(r => ({ label: `${r.name} (容纳 ${r.capacity} 人)`, value: r.id }))]} 
          value={form.roomId} 
          onChange={e => setForm({...form, roomId: e.target.value})} 
        />

        <div className="grid grid-cols-2 gap-4">
           <Input label="会议日期" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
           <div className="grid grid-cols-2 gap-2">
              <Input label="开始时间" type="time" step="1800" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
              <Input label="结束时间" type="time" step="1800" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
           </div>
        </div>

        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
           <div className="flex items-center gap-2 mb-2">
              <Icon name="Info" size={14} className="text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">预约政策</span>
           </div>
           <p className="text-xs text-indigo-800 font-medium leading-relaxed">
             {rooms.find(r => r.id === form.roomId)?.needApproval 
                ? "该会议室开启了【审批模式】，您的申请在管理员通过后生效。" 
                : "该会议室为【免审模式】，提交后将直接生效，请合理规划时间。"}
           </p>
        </div>

        <Input 
          label="备注说明 (选填)" 
          placeholder="如：需要调试音响设备..." 
          value={form.description} 
          onChange={e => setForm({...form, description: e.target.value})} 
        />

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" className="flex-1" onClick={onClose}>取消</Button>
          <Button className="flex-1 shadow-xl shadow-indigo-100" onClick={handleSave}>
            提交预约
          </Button>
        </div>
      </div>
    </Modal>
  );
};
