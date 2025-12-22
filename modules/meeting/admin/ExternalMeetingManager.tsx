
import React, { useState, useMemo } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { Modal } from '../../../platform/ui/layout/Modal';
import { Input } from '../../../platform/ui/form/Input';
import { Select } from '../../../platform/ui/form/Select';
import { parseMeetingText } from '../logic/smartParser';
import { ExternalMeeting, MeetingModuleSchema } from '../types';
import { ExternalReportPanel } from './ExternalReportPanel';

type ViewMode = 'list' | 'report';

export const ExternalMeetingManager: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [view, setView] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Partial<ExternalMeeting> | null>(null);
  const [pasteText, setPasteText] = useState('');

  const meetingData = db.modules.meeting as MeetingModuleSchema;
  const meetings = meetingData.externalMeetings || [];
  const users = db.sys_config.users || [];

  const handleSmartParse = () => {
    if (!pasteText.trim()) return;
    const parsed = parseMeetingText(pasteText);
    setEditingMeeting({ ...editingMeeting, ...parsed });
  };

  const handleSave = () => {
    if (!editingMeeting?.title || !editingMeeting?.startDateTime) {
      alert('请填写会议名称和开始时间');
      return;
    }

    const freshDb = loadDb();
    const currentMeeting = freshDb.modules.meeting as MeetingModuleSchema;
    if (!currentMeeting.externalMeetings) currentMeeting.externalMeetings = [];

    if (editingMeeting.id) {
      currentMeeting.externalMeetings = currentMeeting.externalMeetings.map(m => 
        m.id === editingMeeting.id ? editingMeeting as ExternalMeeting : m
      );
    } else {
      currentMeeting.externalMeetings.push({
        ...editingMeeting,
        id: `ext_${Date.now()}`,
        status: editingMeeting.status || 'pending',
        attendees: editingMeeting.attendees || [],
        createdAt: Date.now()
      } as ExternalMeeting);
    }

    saveDb(freshDb);
    setDb(freshDb);
    setIsModalOpen(false);
    setEditingMeeting(null);
    setPasteText('');
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定删除此会议通知？')) return;
    const freshDb = loadDb();
    freshDb.modules.meeting.externalMeetings = freshDb.modules.meeting.externalMeetings.filter((m: any) => m.id !== id);
    saveDb(freshDb);
    setDb(freshDb);
  };

  const statusMap = {
    pending: { label: '待分派', variant: 'warning' as const },
    processing: { label: '落实中', variant: 'info' as const },
    reported: { label: '已报领导', variant: 'success' as const },
    closed: { label: '已归档', variant: 'neutral' as const },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
           <button onClick={() => setView('list')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>外来会议台账</button>
           <button onClick={() => setView('report')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'report' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>日报统计视图</button>
        </div>
        {view === 'list' && (
          <Button onClick={() => { setEditingMeeting({ status: 'pending' }); setIsModalOpen(true); }}>
            <Icon name="FilePlus" size={18} className="mr-2" /> 登记新通知
          </Button>
        )}
      </div>

      {view === 'list' ? (
        <ColorCard variant="white" className="!p-0 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">时间</th>
                <th className="px-6 py-4">会议名称</th>
                <th className="px-6 py-4">主办/召集人</th>
                <th className="px-6 py-4">参会人员</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm font-bold">
              {meetings.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-indigo-600">{m.startDateTime}</td>
                  <td className="px-6 py-4 text-slate-800">{m.title}</td>
                  <td className="px-6 py-4 text-slate-500">{m.organizer}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {m.attendees.map(a => <Badge key={a} variant="neutral" className="text-[10px]">{a}</Badge>)}
                      {m.attendees.length === 0 && <span className="text-slate-300 italic">未指定</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge variant={statusMap[m.status].variant}>{statusMap[m.status].label}</Badge></td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => { setEditingMeeting(m); setIsModalOpen(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"><Icon name="Edit" size={16}/></button>
                    <button onClick={() => handleDelete(m.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"><Icon name="Trash2" size={16}/></button>
                  </td>
                </tr>
              ))}
              {meetings.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-300 italic font-medium">暂无外来会议记录</td></tr>
              )}
            </tbody>
          </table>
        </ColorCard>
      ) : (
        <ExternalReportPanel meetings={meetings} />
      )}

      {/* Smart Entry Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="外来会议通知智能登记"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button onClick={handleSave}>确认并保存</Button>
          </div>
        }
      >
        <div className="grid grid-cols-5 gap-8 min-w-[900px] h-[500px]">
          {/* Left: Paste Area */}
          <div className="col-span-2 flex flex-col gap-4 border-r border-slate-100 pr-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">原文粘贴区</h4>
              <Button size="sm" variant="secondary" className="!py-1 h-8 !text-[10px]" onClick={handleSmartParse}>
                <Icon name="Zap" size={12} className="mr-1 text-amber-500" /> 智能识别
              </Button>
            </div>
            <textarea 
              className="flex-1 w-full p-4 rounded-3xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all outline-none text-sm font-medium resize-none leading-relaxed"
              placeholder="请粘贴内网通知、公文文本或微信消息原文..."
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
            />
          </div>

          {/* Right: Structured Form */}
          <div className="col-span-3 overflow-y-auto custom-scrollbar pr-2 space-y-4">
             <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">结构化信息</h4>
             <Input label="会议名称" value={editingMeeting?.title || ''} onChange={e => setEditingMeeting({...editingMeeting!, title: e.target.value})} />
             <div className="grid grid-cols-2 gap-4">
                <Input label="主办方/召集人" value={editingMeeting?.organizer || ''} onChange={e => setEditingMeeting({...editingMeeting!, organizer: e.target.value})} />
                <Input label="会议地点" value={editingMeeting?.location || ''} onChange={e => setEditingMeeting({...editingMeeting!, location: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <Input label="开始时间" type="datetime-local" value={editingMeeting?.startDateTime?.replace(' ', 'T') || ''} onChange={e => setEditingMeeting({...editingMeeting!, startDateTime: e.target.value.replace('T', ' ')})} />
                <Input label="联系人/电话" value={editingMeeting?.contactInfo || ''} onChange={e => setEditingMeeting({...editingMeeting!, contactInfo: e.target.value})} />
             </div>
             <div className="space-y-1.5">
               <label className="text-sm font-semibold text-slate-700 ml-1">参会人员 (回车添加)</label>
               <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 min-h-[46px]">
                  {editingMeeting?.attendees?.map(a => (
                    <Badge key={a} variant="info" className="gap-1 pr-1 font-black">
                      {a}
                      <button onClick={() => setEditingMeeting({...editingMeeting!, attendees: editingMeeting!.attendees!.filter(x => x !== a)})}>
                        <Icon name="X" size={10} />
                      </button>
                    </Badge>
                  ))}
                  <input 
                    className="bg-transparent border-none focus:ring-0 text-sm flex-1 min-w-[80px]"
                    placeholder="输入姓名..."
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          setEditingMeeting({...editingMeeting!, attendees: [...(editingMeeting!.attendees || []), val]});
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
               </div>
             </div>
             <Select 
              label="处理状态" 
              value={editingMeeting?.status || 'pending'} 
              onChange={e => setEditingMeeting({...editingMeeting!, status: e.target.value as any})}
              options={[
                { label: '待分派', value: 'pending' },
                { label: '落实中', value: 'processing' },
                { label: '已报领导', value: 'reported' },
                { label: '已归档', value: 'closed' }
              ]}
             />
             <Input label="备注/事项摘要" value={editingMeeting?.content || ''} onChange={e => setEditingMeeting({...editingMeeting!, content: e.target.value})} />
          </div>
        </div>
      </Modal>
    </div>
  );
};
