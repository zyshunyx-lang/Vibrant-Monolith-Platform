
import React, { useState } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { Modal } from '../../../platform/ui/layout/Modal';
import { Input } from '../../../platform/ui/form/Input';
import { MeetingRoom, MeetingModuleSchema } from '../types';

export const RoomManager: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<MeetingRoom> | null>(null);

  const meetingData = (db.modules.meeting || {}) as MeetingModuleSchema;
  const rooms = meetingData.rooms || [];

  const facilityList = [
    { id: 'Projector', label: '📽️ 投影仪', icon: 'Monitor' },
    { id: 'VideoConf', label: '🎥 视频会议', icon: 'Video' },
    { id: 'Whiteboard', label: '📝 白板', icon: 'Clipboard' },
    { id: 'AudioSystem', label: '🔊 音响系统', icon: 'Volume2' },
    { id: 'Coffee', label: '☕ 茶水服务', icon: 'Coffee' },
  ];

  const handleOpenModal = (room: MeetingRoom | null = null) => {
    setEditingRoom(room || {
      name: '',
      capacity: 10,
      location: '',
      facilities: [],
      status: 'active',
      needApproval: false
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingRoom?.name) return;

    const freshDb = loadDb();
    const currentMeeting = freshDb.modules.meeting as MeetingModuleSchema;
    let nextRooms = [...currentMeeting.rooms];

    if (editingRoom.id) {
      nextRooms = nextRooms.map(r => r.id === editingRoom.id ? editingRoom as MeetingRoom : r);
    } else {
      nextRooms.push({
        ...editingRoom as MeetingRoom,
        id: `room_${Date.now()}`
      });
    }

    const newDb = {
      ...freshDb,
      modules: { ...freshDb.modules, meeting: { ...currentMeeting, rooms: nextRooms } }
    };

    saveDb(newDb);
    setDb(newDb);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定删除该会议室吗？相关预定可能会受到影响。')) return;
    const freshDb = loadDb();
    const nextRooms = (freshDb.modules.meeting.rooms as MeetingRoom[]).filter(r => r.id !== id);
    const newDb = {
      ...freshDb,
      modules: { ...freshDb.modules, meeting: { ...freshDb.modules.meeting, rooms: nextRooms } }
    };
    saveDb(newDb);
    setDb(newDb);
  };

  const toggleFacility = (facilityId: string) => {
    const current = editingRoom?.facilities || [];
    const next = current.includes(facilityId) 
      ? current.filter(f => f !== facilityId) 
      : [...current, facilityId];
    setEditingRoom({ ...editingRoom, facilities: next });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">会议室资源管理</h2>
          <p className="text-slate-500 font-medium">配置并维护企业会议室设施，支持差异化审批流。</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Icon name="Plus" size={18} className="mr-2" />
          新增会议室
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="group relative bg-white rounded-[32px] border border-slate-100 p-2 flex gap-6 hover:shadow-xl transition-all border-b-4 border-b-slate-200 hover:border-b-indigo-500">
            <div className="w-40 h-40 rounded-[24px] overflow-hidden bg-slate-100 shrink-0 relative">
              {room.imageUrl ? (
                <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Icon name="Image" size={48} />
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge variant={room.status === 'active' ? 'success' : 'warning'}>
                  {room.status === 'active' ? '可用' : '维护中'}
                </Badge>
              </div>
            </div>

            <div className="flex-1 py-4 pr-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                   <h3 className="text-xl font-black text-slate-800">{room.name}</h3>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => handleOpenModal(room)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl">
                        <Icon name="Pencil" size={16} />
                     </button>
                     <button onClick={() => handleDelete(room.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl">
                        <Icon name="Trash2" size={16} />
                     </button>
                   </div>
                </div>
                <p className="text-sm font-bold text-slate-400 flex items-center gap-1 mt-1">
                  <Icon name="MapPin" size={14} /> {room.location}
                </p>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge variant="neutral" className="bg-indigo-50 text-indigo-700 border-none font-black">
                    容纳 {room.capacity} 人
                  </Badge>
                  {room.needApproval && (
                    <Badge variant="info" className="font-black">需审批</Badge>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                 {room.facilities.map(f => (
                   <span key={f} className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                     {facilityList.find(opt => opt.id === f)?.label.split(' ')[1]}
                   </span>
                 ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingRoom?.id ? '编辑会议室' : '新增会议室'}
      >
        <div className="space-y-5 py-2">
          <Input label="会议室名称" placeholder="如：1号大会议室" value={editingRoom?.name || ''} onChange={e => setEditingRoom({...editingRoom!, name: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="容纳人数" type="number" value={editingRoom?.capacity || 0} onChange={e => setEditingRoom({...editingRoom!, capacity: parseInt(e.target.value)})} />
            <Input label="物理位置" placeholder="如：行政楼 302" value={editingRoom?.location || ''} onChange={e => setEditingRoom({...editingRoom!, location: e.target.value})} />
          </div>

          <Input label="封面图片 URL" placeholder="https://..." value={editingRoom?.imageUrl || ''} onChange={e => setEditingRoom({...editingRoom!, imageUrl: e.target.value})} />

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">设施配置</label>
            <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               {facilityList.map(f => (
                 <label key={f.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={editingRoom?.facilities?.includes(f.id)} 
                      onChange={() => toggleFacility(f.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500" 
                    />
                    <span className="text-xs font-bold text-slate-600">{f.label}</span>
                 </label>
               ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
             <div>
               <p className="text-sm font-black text-amber-900 uppercase tracking-tighter">审批模式</p>
               <p className="text-[10px] text-amber-700 font-medium">开启后，普通用户的预定需管理员确认</p>
             </div>
             <input 
              type="checkbox" 
              checked={editingRoom?.needApproval} 
              onChange={e => setEditingRoom({...editingRoom!, needApproval: e.target.checked})}
              className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500" 
             />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!editingRoom?.name}>保存配置</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
