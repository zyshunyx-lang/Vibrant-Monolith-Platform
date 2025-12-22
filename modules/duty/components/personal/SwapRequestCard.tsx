import React from 'react';
import { Icon } from '../../../../platform/ui/basic/Icon';
import { Button } from '../../../../platform/ui/basic/Button';
import { Badge } from '../../../../platform/ui/basic/Badge';

export const SwapRequestCard: React.FC = () => {
  // Mock data for UI skeleton
  const mockRequests = [
    { id: 1, date: '2023-12-25', status: 'pending', partner: '张伟' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
            <Icon name="Repeat" size={16} />
          </div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">我的换班申请</h4>
        </div>
        <Button size="sm" variant="ghost" className="!p-1 text-indigo-600" onClick={() => alert('换班申请功能正在对接后端逻辑...')}>
          <Icon name="PlusCircle" size={18} />
        </Button>
      </div>

      <div className="space-y-2">
        {mockRequests.map(req => (
          <div key={req.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-700">{req.date}</p>
              <p className="text-[10px] text-slate-400">搭档: {req.partner}</p>
            </div>
            <Badge variant="warning" className="text-[9px] scale-90 origin-right">审批中</Badge>
          </div>
        ))}
        {mockRequests.length === 0 && (
          <div className="py-6 text-center text-[10px] text-slate-300 italic">
            暂无申请记录
          </div>
        )}
      </div>

      <button 
        onClick={() => alert('启动换班申请向导...')}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-indigo-100 text-indigo-500 text-xs font-black uppercase hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
      >
        <Icon name="Send" size={14} />
        发起新申请
      </button>
    </div>
  );
};