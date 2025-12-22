
import React, { useState, useEffect } from 'react';
import { loadDb, saveDb, getCurrentUser } from '../../../platform/core/db';
import { Modal } from '../../../platform/ui/layout/Modal';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Input } from '../../../platform/ui/form/Input';
import { Select } from '../../../platform/ui/form/Select';
import { Badge } from '../../../platform/ui/basic/Badge';
import { executeSwap, executeStandby } from '../logic/operationService';
import { getStandbyCandidates } from '../logic/standbyService';
import { DutyModuleSchema, Schedule, DutyChangeLog } from '../types';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  onUpdate: () => void;
  readOnly?: boolean;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  dateStr, 
  onUpdate,
  readOnly = false 
}) => {
  const [db, setDb] = useState(loadDb());
  const [activeAction, setActiveAction] = useState<'swap' | 'standby' | null>(null);
  const [targetSlot, setTargetSlot] = useState<{ id: number; userId: string } | null>(null);
  const [selectedNewUserId, setSelectedNewUserId] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDb(loadDb());
    }
  }, [isOpen]);

  const dutyData = db.modules.duty as DutyModuleSchema;
  const users = db.sys_config.users;
  const currentUser = getCurrentUser();
  const schedule = dutyData.schedules.find(s => s.date === dateStr);
  const dayLogs = (dutyData.changeLogs || []).filter(l => l.date === dateStr);

  const getUserName = (id: string) => users.find(u => u.id === id)?.realName || '未知人员';

  const handleAction = (type: 'swap' | 'standby', slotId: number, currentUserId: string) => {
    if (readOnly) return;
    setTargetSlot({ id: slotId, userId: currentUserId });
    setActiveAction(type);
    setSelectedNewUserId('');
    setReason('');
  };

  const executeOperation = () => {
    if (readOnly || !targetSlot || !selectedNewUserId || !reason || !currentUser) return;

    const params = {
      date: dateStr,
      slotId: targetSlot.id,
      originalUserId: targetSlot.userId,
      newUserId: selectedNewUserId,
      reason,
      operatorId: currentUser.id
    };

    const newDb = activeAction === 'swap' 
      ? executeSwap(db, params) 
      : executeStandby(db, params);

    saveDb(newDb);
    setDb(newDb);
    setActiveAction(null);
    setTargetSlot(null);
    onUpdate();
  };

  const getCandidates = () => {
    if (!targetSlot) return [];
    if (activeAction === 'standby') {
      const slotDef = dutyData.slotConfigs.find(s => s.id === targetSlot.id);
      const catId = slotDef?.allowedCategoryIds[0] || '';
      return getStandbyCandidates(dateStr, catId, dutyData, users).map(u => ({ label: `[系统推荐] ${u.realName}`, value: u.id }));
    }
    return users.filter(u => u.isActive && u.id !== targetSlot.userId).map(u => ({ label: u.realName, value: u.id }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${dateStr} 值班详情`} footer={<Button variant="secondary" onClick={onClose}>关闭</Button>}>
      <div className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">当前岗位安排 (Active Assignments)</h4>
          {schedule?.slots.map(slot => {
            const slotDef = dutyData.slotConfigs.find(s => s.id === slot.slotId);
            return (
              <div key={slot.slotId} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-indigo-500 uppercase">{slotDef?.name || '席位'}</div>
                  <div className="text-sm font-bold text-slate-800">{getUserName(slot.userId)}</div>
                </div>
                {!readOnly && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleAction('swap', slot.slotId, slot.userId)}>
                      <Icon name="RefreshCw" size={14} className="mr-1"/> 换班
                    </Button>
                    <Button size="sm" variant="secondary" className="!text-rose-600" onClick={() => handleAction('standby', slot.slotId, slot.userId)}>
                      <Icon name="UserCheck" size={14} className="mr-1"/> 替岗
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          {(!schedule || schedule.slots.length === 0) && (
            <div className="py-8 text-center text-slate-400 italic text-sm">当日暂无排班记录</div>
          )}
        </div>

        {dayLogs.length > 0 && (
          <div className="space-y-3">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">调整轨迹 (Audit Trail)</h4>
             <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
               {dayLogs.map(log => (
                 <div key={log.id} className="p-3 text-[11px] flex flex-col gap-1">
                   <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                       <Badge variant={log.type === 'swap' ? 'warning' : 'danger'}>{log.type === 'swap' ? '换班' : '备勤'}</Badge>
                       <span className="font-bold text-slate-700">{getUserName(log.originalUserId)} → {getUserName(log.newUserId)}</span>
                     </div>
                     <span className="text-slate-400 font-medium">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <div className="text-slate-500 italic">事由: {log.reason}</div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {!readOnly && (
          <Modal isOpen={activeAction !== null} onClose={() => setActiveAction(null)} title={activeAction === 'swap' ? '人员在线换班' : '指定备勤人员'}>
             <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <p className="text-xs font-medium text-indigo-800">正在为 <span className="font-bold">{getUserName(targetSlot?.userId || '')}</span> 寻找替代人选 ({dateStr})</p>
                </div>
                <Select 
                  label="选择目标人员" 
                  options={[{label: '-- 请选择接替人 --', value: ''}, ...getCandidates()]} 
                  value={selectedNewUserId} 
                  onChange={e => setSelectedNewUserId(e.target.value)}
                />
                <Input label="变更原因" placeholder="请输入事由（如：病假、公出、家事等）" value={reason} onChange={e => setReason(e.target.value)} />
                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="secondary" onClick={() => setActiveAction(null)}>取消</Button>
                  <Button onClick={executeOperation} disabled={!selectedNewUserId || !reason}>确认并执行变更</Button>
                </div>
             </div>
          </Modal>
        )}
      </div>
    </Modal>
  );
};
