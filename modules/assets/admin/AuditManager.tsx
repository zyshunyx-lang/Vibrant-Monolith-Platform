
import React, { useState, useMemo } from 'react';
import { loadDb, getCurrentUser } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { Grid } from '../../../platform/ui/layout/Grid';
import { Modal } from '../../../platform/ui/layout/Modal';
import { Input } from '../../../platform/ui/form/Input';
import { Select } from '../../../platform/ui/form/Select';
import { AssetsModuleSchema, AuditTask } from '../types';
import { createAuditTask, getAuditProgress, submitForReview } from '../logic/auditService';
import { AuditReviewWorkbench } from './AuditReviewWorkbench';

export const AuditManager: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<AuditTask | null>(null);

  const [form, setForm] = useState({
    name: '',
    categoryIds: [] as string[],
    locationIds: [] as string[],
    departmentIds: [] as string[],
    auditorIds: [] as string[],
    reviewerId: ''
  });

  const currentUser = getCurrentUser();
  const assetData = (db.modules.assets || {}) as AssetsModuleSchema;
  const { 
    auditTasks: tasks = [], 
    categories = [], 
    locations = [], 
    assets = [], 
    departments = [] 
  } = assetData;
  const users = db.sys_config.users || [];

  const scopeAssetCount = useMemo(() => {
    return assets.filter(a => {
      const catMatch = form.categoryIds.length === 0 || form.categoryIds.includes(a.categoryId);
      const locMatch = form.locationIds.length === 0 || form.locationIds.includes(a.locationId);
      const deptMatch = form.departmentIds.length === 0 || (a.departmentId && form.departmentIds.includes(a.departmentId));
      return catMatch && locMatch && deptMatch;
    }).length;
  }, [assets, form.categoryIds, form.locationIds, form.departmentIds]);

  const handleCreate = () => {
    if (!form.name.trim() || !form.reviewerId) return;
    createAuditTask({
      ...form,
      name: form.name.trim()
    });
    setDb(loadDb());
    setIsCreateModalOpen(false);
    setForm({ name: '', categoryIds: [], locationIds: [], departmentIds: [], auditorIds: [], reviewerId: '' });
  };

  const handleSubmitReview = (id: string) => {
    if (!confirm('确认完成所有盘点并提交给审核人？')) return;
    submitForReview(id);
    setDb(loadDb());
  };

  const toggleItem = (list: string[], item: string) => 
    list.includes(item) ? list.filter(i => i !== item) : [...list, item];

  if (selectedTaskForReview) {
    return (
      <AuditReviewWorkbench 
        task={selectedTaskForReview} 
        onUpdate={() => { setDb(loadDb()); setSelectedTaskForReview(null); }} 
        onClose={() => setSelectedTaskForReview(null)} 
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">资产盘点与合规审核</h3>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Integrated Audit Control & Compliance</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Icon name="Plus" size={18} className="mr-2" />
          创建管控盘点
        </Button>
      </header>

      <Grid cols={3}>
        {tasks.map(task => {
          const progress = getAuditProgress(task.id);
          const canReview = task.reviewerId === currentUser?.id || currentUser?.role === 'super_admin';
          
          return (
            <ColorCard 
              key={task.id} 
              variant="white"
              title={task.name}
              headerAction={
                <Badge variant={task.status === 'active' ? 'info' : task.status === 'reviewing' ? 'warning' : task.status === 'closed' ? 'success' : 'danger'}>
                  {task.status.toUpperCase()}
                </Badge>
              }
            >
              <div className="space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">完成率</p>
                    <p className="text-3xl font-black text-slate-800">{progress.percentage}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-500">{progress.audited} / {progress.total}</p>
                    <p className="text-[10px] text-slate-300 font-bold uppercase">Assets Audited</p>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress.percentage}%` }} />
                </div>

                <div className="flex gap-2">
                  {(task.status === 'active' || task.status === 'rejected') && (
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleSubmitReview(task.id)}>提交审核</Button>
                  )}
                  {task.status === 'reviewing' && canReview && (
                    <Button variant="primary" size="sm" className="flex-1 shadow-indigo-100" onClick={() => setSelectedTaskForReview(task)}>去审核</Button>
                  )}
                  {task.status === 'closed' && (
                    <Button variant="ghost" size="sm" className="flex-1 text-emerald-600 border border-emerald-100 hover:bg-emerald-50" onClick={() => setSelectedTaskForReview(task)}>查看报告</Button>
                  )}
                </div>
              </div>
            </ColorCard>
          );
        })}
        {tasks.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-slate-100">
             <Icon name="Inbox" size={48} className="mx-auto text-slate-200 mb-2" />
             <p className="text-slate-400 font-bold">暂无盘点任务</p>
          </div>
        )}
      </Grid>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="创建盘点任务" footer={
        <div className="flex items-center justify-between w-full">
           <div className="text-xs font-bold text-slate-500">
             涉及资产: <span className="text-indigo-600 font-black text-lg ml-1">{scopeAssetCount}</span>
           </div>
           <div className="flex gap-3">
             <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>取消</Button>
             <Button onClick={handleCreate} disabled={scopeAssetCount === 0 || !form.name.trim() || !form.reviewerId}>确认发起任务</Button>
           </div>
        </div>
      }>
        <div className="space-y-6 py-2">
          <Input label="任务名称" placeholder="2024 年度固定资产大盘点" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[11px] font-bold text-slate-700 uppercase">限制部门</label>
               <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 max-h-32 overflow-y-auto custom-scrollbar">
                  {departments.map(d => (
                    <label key={d.id} className="flex items-center gap-2 text-xs py-1 cursor-pointer">
                      <input type="checkbox" checked={form.departmentIds.includes(d.id)} onChange={() => setForm({...form, departmentIds: toggleItem(form.departmentIds, d.id)})} className="rounded text-indigo-600" />
                      {d.name}
                    </label>
                  ))}
                  {departments.length === 0 && <p className="text-xs text-slate-400 italic py-2">尚未配置部门</p>}
               </div>
             </div>
             <div className="space-y-2">
               <label className="text-[11px] font-bold text-slate-700 uppercase">限制地点</label>
               <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 max-h-32 overflow-y-auto custom-scrollbar">
                  {locations.map(l => (
                    <label key={l.id} className="flex items-center gap-2 text-xs py-1 cursor-pointer">
                      <input type="checkbox" checked={form.locationIds.includes(l.id)} onChange={() => setForm({...form, locationIds: toggleItem(form.locationIds, l.id)})} className="rounded text-indigo-600" />
                      {l.name}
                    </label>
                  ))}
                  {locations.length === 0 && <p className="text-xs text-slate-400 italic py-2">尚未配置地点</p>}
               </div>
             </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
             <Select label="指派审核人 (Reviewer)" options={[{label: '-- 请选择 --', value: ''}, ...users.map(u => ({ label: u.realName, value: u.id }))]} value={form.reviewerId} onChange={e => setForm({...form, reviewerId: e.target.value})} />
             <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <p className="text-[10px] text-indigo-800 font-bold uppercase leading-relaxed italic">注：审核人负责最终盘点结果的复核与结单归档，拥有驳回权。</p>
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
