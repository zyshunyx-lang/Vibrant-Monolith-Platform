
import React, { useState } from 'react';
import { loadDb, getCurrentUser } from '../../../platform/core/db';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { AuditTask, AssetsModuleSchema, AuditRecord } from '../types';
import { rejectAudit, approveAudit } from '../logic/auditService';

interface Props {
  task: AuditTask;
  onUpdate: () => void;
  onClose: () => void;
}

export const AuditReviewWorkbench: React.FC<Props> = ({ task, onUpdate, onClose }) => {
  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  const records = (assetData.auditRecords || []).filter(r => r.taskId === task.id);
  const users = db.sys_config.users;
  
  const anomalies = records.filter(r => r.result !== 'normal');

  const handleApprove = () => {
    if (!confirm('确认通过审核并正式归档？操作后不可撤销。')) return;
    approveAudit(task.id);
    onUpdate();
  };

  const handleReject = () => {
    const reason = prompt('请输入驳回意见：');
    if (reason === null) return;
    rejectAudit(task.id, reason);
    onUpdate();
  };

  const renderReport = () => {
    const data = task.reportData;
    if (!data) return null;

    return (
      <div className="bg-white shadow-2xl mx-auto max-w-[800px] border border-slate-200 p-16 flex flex-col gap-10 font-serif text-slate-900 print:shadow-none print:border-none animate-in fade-in zoom-in duration-500">
        <header className="text-center space-y-2 border-b-2 border-slate-900 pb-8">
           <h1 className="text-3xl font-black tracking-tighter uppercase">固定资产盘点结单报告</h1>
           <p className="text-slate-500 font-sans font-bold tracking-widest text-sm uppercase">Fixed Asset Audit & Reconciliation Report</p>
        </header>

        <section className="grid grid-cols-2 gap-x-12 gap-y-4 font-sans text-sm border-b border-slate-100 pb-8">
           <div className="flex justify-between border-b border-slate-50 py-1">
             <span className="font-bold text-slate-400">任务编号</span>
             <span className="font-black">{task.id}</span>
           </div>
           <div className="flex justify-between border-b border-slate-50 py-1">
             <span className="font-bold text-slate-400">盘点名称</span>
             <span className="font-black">{task.name}</span>
           </div>
           <div className="flex justify-between border-b border-slate-50 py-1">
             <span className="font-bold text-slate-400">盘点范围</span>
             <span className="font-black">{task.scopeType === 'all' ? '全院资产' : '局部盘点'}</span>
           </div>
           <div className="flex justify-between border-b border-slate-50 py-1">
             <span className="font-bold text-slate-400">完成日期</span>
             <span className="font-black">{new Date(task.endDate || '').toLocaleDateString()}</span>
           </div>
        </section>

        <section className="space-y-6">
           <h3 className="font-sans font-black text-xs uppercase tracking-widest text-indigo-600">盘点结果摘要 / Summary</h3>
           <div className="grid grid-cols-4 gap-4 font-sans">
              <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-1">应盘总数</p>
                 <p className="text-3xl font-black">{data.total}</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-3xl text-center border border-emerald-100">
                 <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">实盘正常</p>
                 <p className="text-3xl font-black text-emerald-600">{data.normal}</p>
              </div>
              <div className="bg-rose-50 p-6 rounded-3xl text-center border border-rose-100">
                 <p className="text-[10px] font-black text-rose-600 uppercase mb-1">资产盘亏</p>
                 <p className="text-3xl font-black text-rose-600">{data.missing}</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-3xl text-center border border-amber-100">
                 <p className="text-[10px] font-black text-amber-600 uppercase mb-1">损坏待修</p>
                 <p className="text-3xl font-black text-amber-600">{data.damaged}</p>
              </div>
           </div>
           
           <div className="space-y-3 font-sans pt-4">
              <div className="flex justify-between text-xs font-black uppercase">
                 <span>资产完好率 (Integrity Rate)</span>
                 <span>{data.integrityRate}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${data.integrityRate}%` }} />
              </div>
           </div>
        </section>

        <section className="space-y-4">
           <h3 className="font-sans font-black text-xs uppercase tracking-widest text-indigo-600">异常明细说明 / Anomalies</h3>
           <div className="border border-slate-100 rounded-3xl overflow-hidden">
              <table className="w-full text-left font-sans text-xs">
                 <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="font-black text-slate-400 uppercase">
                       <th className="px-6 py-4">资产编码</th>
                       <th className="px-6 py-4">异常类型</th>
                       <th className="px-6 py-4">备注描述</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {anomalies.slice(0, 10).map(r => (
                      <tr key={r.id}>
                         <td className="px-6 py-4 font-bold">{r.assetCode}</td>
                         <td className="px-6 py-4">
                            <Badge variant={r.result === 'missing' ? 'danger' : 'warning'}>{r.result === 'missing' ? '盘亏' : '损坏'}</Badge>
                         </td>
                         <td className="px-6 py-4 text-slate-500 italic">{r.remark || '无备注'}</td>
                      </tr>
                    ))}
                    {anomalies.length === 0 && (
                      <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-300 italic">本次盘点未发现异常资产</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </section>

        <footer className="mt-10 grid grid-cols-2 gap-20 font-sans border-t border-slate-100 pt-10">
           <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">盘点人签字</p>
              <div className="h-12 border-b border-slate-200 flex items-end pb-1 font-bold italic">
                 {users.find(u => u.id === task.auditorIds[0])?.realName || '线上确认'}
              </div>
           </div>
           <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">审核人签字 (复核)</p>
              <div className="h-12 border-b border-slate-200 flex items-end pb-1 font-bold italic">
                 {users.find(u => u.id === task.reviewerId)?.realName}
              </div>
           </div>
        </footer>
        
        <div className="text-center font-sans text-[10px] text-slate-300 uppercase tracking-[0.2em] pt-4">
           Digital Signature Secured by Modular Monolith Platform
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose} className="!pl-0">
          <Icon name="ArrowLeft" size={18} className="mr-2" />
          返回盘点列表
        </Button>
        <div className="flex gap-3 no-print">
           {task.status === 'reviewing' && (
             <>
               <Button variant="danger" onClick={handleReject}>驳回重盘</Button>
               <Button onClick={handleApprove}>审核通过并结单</Button>
             </>
           )}
           {task.status === 'closed' && (
             <Button variant="secondary" onClick={() => window.print()}>
               <Icon name="Printer" size={16} className="mr-2" />
               打印报告
             </Button>
           )}
        </div>
      </div>

      {task.status === 'closed' ? renderReport() : (
        <ColorCard title="盘点审核工作台" variant="white">
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-6">
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase mb-2">整体完成进度</h4>
                  <p className="text-4xl font-black text-slate-800">{Math.round((records.length / task.totalCount) * 100)}%</p>
               </div>
               <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                  <h4 className="text-xs font-black text-rose-400 uppercase mb-2">待核实异常项</h4>
                  <p className="text-4xl font-black text-rose-600">{anomalies.length}</p>
               </div>
               <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <h4 className="text-xs font-black text-indigo-400 uppercase mb-2">实收有效记录</h4>
                  <p className="text-4xl font-black text-indigo-600">{records.length}</p>
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest px-1">提交清单明细</h4>
               <div className="border border-slate-100 rounded-[32px] overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="text-[10px] font-black text-slate-400 uppercase">
                           <th className="px-6 py-4">资产标识</th>
                           <th className="px-6 py-4">结果状态</th>
                           <th className="px-6 py-4">盘点人</th>
                           <th className="px-6 py-4">现场照片</th>
                           <th className="px-6 py-4">详细备注</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {records.map(r => (
                          <tr key={r.id}>
                             <td className="px-6 py-4 font-bold">{r.assetCode}</td>
                             <td className="px-6 py-4">
                                <Badge variant={r.result === 'normal' ? 'success' : 'danger'}>
                                  {r.result === 'normal' ? '正常' : r.result === 'missing' ? '盘亏' : '损坏'}
                                </Badge>
                             </td>
                             <td className="px-6 py-4 text-sm text-slate-600">{users.find(u => u.id === r.operatorId)?.realName}</td>
                             <td className="px-6 py-4 text-center">
                                {r.photoUrl ? <Icon name="Image" size={16} className="text-indigo-500 mx-auto" /> : '---'}
                             </td>
                             <td className="px-6 py-4 text-xs text-slate-500 italic">{r.remark || '无'}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        </ColorCard>
      )}
    </div>
  );
};
