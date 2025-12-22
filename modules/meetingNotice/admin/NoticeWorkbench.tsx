
import React, { useState, useMemo } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { Input } from '../../../platform/ui/form/Input';
import { Select } from '../../../platform/ui/form/Select';
import { MeetingNotice, MeetingNoticeModuleSchema, UrgencyLevel, NoticeStatus } from '../types';

export const NoticeWorkbench: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [editingNotice, setEditingNotice] = useState<Partial<MeetingNotice>>({});

  const noticeData = (db.modules.meetingNotice || { notices: [] }) as MeetingNoticeModuleSchema;
  const notices = noticeData.notices.sort((a, b) => b.createdAt - a.createdAt);
  const activeNotice = notices.find(n => n.id === selectedId);

  const handleSelect = (notice: MeetingNotice) => {
    setSelectedId(notice.id);
    setEditingNotice(notice);
  };

  const handleCreateNew = () => {
    setSelectedId(null);
    setEditingNotice({
      urgency: 'normal',
      status: 'pending',
      attendees: [],
      driverNeeded: false,
      materialNeeded: ''
    });
    setPasteText('');
  };

  const handleSmartParse = () => {
    if (!pasteText.trim()) return;
    // Regex Logic for Chinese Administrative Notices
    const titleMatch = pasteText.match(/(?:关于)?(.*?会议)(?:的通知)?/);
    const dateMatch = pasteText.match(/(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)/);
    const timeMatch = pasteText.match(/(\d{1,2}:\d{2})/);
    const locMatch = pasteText.match(/地点[：: ]?([^，。\n]*?[室楼厅中心])/);
    const phoneMatch = pasteText.match(/(1[3-9]\d{9}|0\d{2,3}-\d{7,8})/);

    setEditingNotice(prev => ({
      ...prev,
      title: titleMatch?.[1] || prev.title,
      startTime: dateMatch ? `${dateMatch[1].replace(/[年月]/g, '-').replace('日', '')} ${timeMatch?.[1] || '09:00'}` : prev.startTime,
      location: locMatch?.[1] || prev.location,
      contactPhone: phoneMatch?.[0] || prev.contactPhone,
      contentSummary: pasteText.slice(0, 100) + "..."
    }));
  };

  const handleSave = () => {
    const freshDb = loadDb();
    if (!freshDb.modules.meetingNotice) freshDb.modules.meetingNotice = { notices: [] };
    const currentNotices = freshDb.modules.meetingNotice.notices;

    const dataToSave = {
      ...editingNotice,
      id: editingNotice.id || `not_${Date.now()}`,
      createdAt: editingNotice.createdAt || Date.now(),
      status: editingNotice.attendees?.length ? 'assigned' : 'pending'
    } as MeetingNotice;

    const exists = currentNotices.findIndex(n => n.id === dataToSave.id);
    if (exists >= 0) currentNotices[exists] = dataToSave;
    else currentNotices.push(dataToSave);

    saveDb(freshDb);
    setDb(freshDb);
    setSelectedId(dataToSave.id);
    alert('保存并同步日程成功');
  };

  const urgencyConfig = {
    normal: { label: '平件', color: 'text-slate-400 bg-slate-50 border-slate-100' },
    urgent: { label: '急件', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    critical: { label: '特急', color: 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse' }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-180px)] animate-in fade-in duration-500">
      {/* Left: List Panel */}
      <aside className="w-80 flex flex-col gap-4">
        <Button className="w-full !rounded-2xl py-4 shadow-lg shadow-indigo-100" onClick={handleCreateNew}>
           <Icon name="PlusCircle" size={18} className="mr-2" /> 登记会议通知
        </Button>
        
        <ColorCard variant="white" className="flex-1 !p-0 overflow-hidden border-slate-100 shadow-sm">
           <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">通知列表</span>
              <Icon name="Filter" size={14} className="text-slate-300" />
           </div>
           <div className="overflow-y-auto h-full custom-scrollbar pb-10">
              {notices.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleSelect(n)}
                  className={`p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 group ${selectedId === n.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${urgencyConfig[n.urgency].color}`}>
                       {urgencyConfig[n.urgency].label}
                    </span>
                    <span className="text-[10px] text-slate-300 font-bold">{n.startTime?.split(' ')[0] || '---'}</span>
                  </div>
                  <h4 className={`text-sm font-bold group-hover:text-indigo-600 transition-colors ${selectedId === n.id ? 'text-indigo-700' : 'text-slate-700'}`}>{n.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">{n.organizer}</p>
                </div>
              ))}
              {notices.length === 0 && <div className="py-20 text-center text-slate-300 italic text-xs">暂无待办通知</div>}
           </div>
        </ColorCard>
      </aside>

      {/* Right: Detail & Assignment Panel */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pr-2">
         <ColorCard variant="white" className="min-h-full shadow-sm border-slate-100 relative">
            <div className="space-y-8 pb-20">
               {/* Header Section */}
               <section className="flex justify-between items-start border-b border-slate-50 pb-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingNotice.title || '新通知登记'}</h3>
                    <div className="flex items-center gap-3">
                       <Badge variant={editingNotice.status === 'assigned' ? 'success' : 'neutral'}>
                         {editingNotice.status === 'assigned' ? '已分派' : '待分派'}
                       </Badge>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Processing Terminal</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={editingNotice.urgency} 
                      onChange={e => setEditingNotice({...editingNotice, urgency: e.target.value as any})}
                      options={[{label:'平件', value:'normal'}, {label:'急件', value:'urgent'}, {label:'特急', value:'critical'}]}
                      className="!w-24 !py-1.5 !text-xs"
                    />
                    <Button onClick={handleSave} size="sm">
                       <Icon name="Save" size={16} className="mr-2"/> 保存并落实
                    </Button>
                  </div>
               </section>

               {/* Smart Entry / Source Section */}
               {!editingNotice.id && (
                 <section className="p-6 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                       <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <Icon name="Zap" size={14} className="text-amber-500" /> 文本智能填充 (Smart Capture)
                       </h5>
                       <Button size="sm" variant="ghost" onClick={handleSmartParse} disabled={!pasteText}>智能识别信息</Button>
                    </div>
                    <textarea 
                      className="w-full h-24 bg-white p-4 rounded-2xl border border-slate-100 text-sm focus:ring-4 focus:ring-indigo-100 transition-all outline-none resize-none leading-relaxed"
                      placeholder="请将会议通知全文（或截图OCR文本）粘贴于此..."
                      value={pasteText}
                      onChange={e => setPasteText(e.target.value)}
                    />
                 </section>
               )}

               {/* Structured Fields */}
               <section className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] px-1">会议基本面 / Core Info</h5>
                    <Input label="会议名称" value={editingNotice.title || ''} onChange={e => setEditingNotice({...editingNotice, title: e.target.value})} />
                    <Input label="主办单位" value={editingNotice.organizer || ''} onChange={e => setEditingNotice({...editingNotice, organizer: e.target.value})} />
                    <Input label="会议地点" value={editingNotice.location || ''} onChange={e => setEditingNotice({...editingNotice, location: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                       <Input label="开始时间" type="datetime-local" value={editingNotice.startTime?.replace(' ', 'T') || ''} onChange={e => setEditingNotice({...editingNotice, startTime: e.target.value.replace('T', ' ')})} />
                       <Input label="结束时间" type="datetime-local" value={editingNotice.endTime?.replace(' ', 'T') || ''} onChange={e => setEditingNotice({...editingNotice, endTime: e.target.value.replace('T', ' ')})} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] px-1">分派与保障 / Logistics</h5>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 ml-1 flex justify-between">
                         <span>参会人员/部门</span>
                         <span className="text-[10px] text-slate-400 font-normal">输入后按回车添加</span>
                      </label>
                      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 min-h-[46px]">
                         {editingNotice.attendees?.map(a => (
                           <Badge key={a} variant="info" className="gap-1 pr-1">
                             {a}
                             <button onClick={() => setEditingNotice({...editingNotice, attendees: editingNotice.attendees?.filter(x => x !== a)})}><Icon name="X" size={10} /></button>
                           </Badge>
                         ))}
                         <input 
                           className="bg-transparent border-none focus:ring-0 text-sm flex-1 min-w-[80px]"
                           onKeyDown={e => {
                             if (e.key === 'Enter') {
                               const val = (e.target as HTMLInputElement).value.trim();
                               if (val) setEditingNotice({...editingNotice, attendees: [...(editingNotice.attendees || []), val]});
                               (e.target as HTMLInputElement).value = '';
                             }
                           }}
                         />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                       <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                          <div>
                            <p className="text-sm font-black text-indigo-900 tracking-tight">公车调度保障</p>
                            <p className="text-[10px] text-indigo-700">勾选后将自动向车辆管理中心发起用车意向</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={editingNotice.driverNeeded} 
                            onChange={e => setEditingNotice({...editingNotice, driverNeeded: e.target.checked})}
                            className="w-5 h-5 rounded border-indigo-300 text-indigo-600" 
                          />
                       </div>
                       <Input label="办文/保障备注" placeholder="例如：需携带公章、准备发言稿..." value={editingNotice.materialNeeded || ''} onChange={e => setEditingNotice({...editingNotice, materialNeeded: e.target.value})} />
                    </div>

                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                       <div className="flex items-center gap-2 mb-1">
                          <Icon name="ShieldAlert" size={14} className="text-amber-600" />
                          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">冲突检查 (模拟)</span>
                       </div>
                       <p className="text-[10px] text-amber-800 font-medium">所选参会人员中，[张伟] 在 10-25 存在全天值班任务，请核实是否冲突。</p>
                    </div>
                  </div>
               </section>

               <section className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">事项摘要 / Summary</h5>
                  <textarea 
                    className="w-full h-32 p-4 rounded-3xl bg-slate-50 border border-slate-100 text-sm focus:bg-white transition-all outline-none"
                    value={editingNotice.contentSummary || ''}
                    onChange={e => setEditingNotice({...editingNotice, contentSummary: e.target.value})}
                  />
               </section>
            </div>
         </ColorCard>
      </main>
    </div>
  );
};
