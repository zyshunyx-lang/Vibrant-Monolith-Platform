
import React, { useState } from 'react';
import { loadDb } from '../../core/db';
import { ColorCard } from '../../ui/layout/ColorCard';
import { Badge } from '../../ui/basic/Badge';
import { Icon } from '../../ui/basic/Icon';
import { Button } from '../../ui/basic/Button';

export const LogViewer: React.FC = () => {
  const db = loadDb();
  const [logs] = useState(db.logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">系统审计日志</h2>
          <p className="text-slate-500 font-medium mt-1">记录系统内的所有关键操作、权限变更及安全审计轨迹。</p>
        </div>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          <Icon name="RefreshCcw" size={16} className="mr-2" />
          刷新列表
        </Button>
      </header>

      <ColorCard className="!p-0 overflow-hidden border-slate-200">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">操作时间</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">动作类型</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">操作人 ID</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">详情描述</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info" className="uppercase">{log.action}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                      {log.userId}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">
                    <div className="flex flex-col items-center">
                      <Icon name="Inbox" size={32} className="mb-2 opacity-20" />
                      当前尚无任何审计记录。
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ColorCard>
    </div>
  );
};
