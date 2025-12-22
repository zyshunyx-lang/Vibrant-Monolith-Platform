
import React, { useState } from 'react';
import { Modal } from '../../../platform/ui/layout/Modal';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { Input } from '../../../platform/ui/form/Input';
import { Select } from '../../../platform/ui/form/Select';
import { loadDb } from '../../../platform/core/db';
import { Asset, AssetsModuleSchema, AssetStatus, AssetOperationType } from '../types';
import { assignAsset, returnAsset, reportRepair, scrapAsset } from '../logic/assetService';

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string | null;
  onUpdate: () => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ isOpen, onClose, assetId, onUpdate }) => {
  const [activeAction, setActiveAction] = useState<AssetOperationType | null>(null);
  const [form, setForm] = useState({ targetUserId: '', locationId: '', remark: '', photoUrl: '' });

  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  const asset = assetData.assets.find(a => a.id === assetId);
  const logs = (assetData.logs || []).filter(l => l.assetId === assetId);
  const users = db.sys_config.users;
  const locations = assetData.locations;

  if (!asset) return null;

  const handleAction = () => {
    const params = { assetId: asset.id, ...form };
    if (activeAction === 'assign') assignAsset(params);
    if (activeAction === 'return') returnAsset(params);
    if (activeAction === 'repair') reportRepair(params);
    if (activeAction === 'scrap') scrapAsset(params);

    setActiveAction(null);
    setForm({ targetUserId: '', locationId: '', remark: '', photoUrl: '' });
    onUpdate();
  };

  const getStatusBadge = (status: AssetStatus) => {
    const config: Record<AssetStatus, { label: string; variant: any }> = {
      idle: { label: '闲置', variant: 'neutral' },
      in_use: { label: '在用', variant: 'success' },
      maintenance: { label: '维修', variant: 'warning' },
      scrapped: { label: '报废', variant: 'danger' }
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const getUserName = (id?: string) => users.find(u => u.id === id)?.realName || '---';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="资产详情档案" footer={<Button variant="secondary" onClick={onClose}>关闭</Button>}>
      <div className="space-y-8">
        {/* Header Summary */}
        <div className="flex items-start justify-between bg-slate-50 p-6 rounded-[32px] border border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl font-black text-slate-900">{asset.assetCode}</span>
              {getStatusBadge(asset.status)}
            </div>
            <h4 className="text-lg font-bold text-slate-600">{asset.name}</h4>
            <p className="text-sm text-slate-400">{asset.model}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">当前位置</p>
            <p className="text-sm font-bold text-slate-700">{locations.find(l => l.id === asset.locationId)?.name || '未知'}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">领用人</p>
            <p className="text-sm font-bold text-slate-700">{getUserName(asset.currentUserId)}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest">流通管理</h5>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={asset.status === 'in_use'} onClick={() => { setActiveAction('assign'); setForm({...form, locationId: asset.locationId}) }}>
                <Icon name="UserPlus" size={14} className="mr-2" /> 领用
              </Button>
              <Button size="sm" variant="secondary" disabled={asset.status !== 'in_use'} onClick={() => { setActiveAction('return'); setForm({...form, locationId: asset.locationId}) }}>
                <Icon name="RotateCcw" size={14} className="mr-2" /> 归还
              </Button>
              <Button size="sm" variant="secondary" className="text-amber-600" onClick={() => setActiveAction('repair')}>
                <Icon name="Wrench" size={14} className="mr-2" /> 报修
              </Button>
            </div>
          </div>

          {activeAction && (
            <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 animate-in slide-in-from-top-4 duration-300 space-y-4">
              <h6 className="text-xs font-black text-indigo-600 uppercase">
                {activeAction === 'assign' ? '资产领用登记' : activeAction === 'return' ? '资产归还登记' : '报修申请'}
              </h6>
              
              <div className="grid grid-cols-2 gap-4">
                {activeAction === 'assign' && (
                  <Select 
                    label="领用人" 
                    options={users.map(u => ({ label: u.realName, value: u.id }))} 
                    value={form.targetUserId} 
                    onChange={e => setForm({...form, targetUserId: e.target.value})} 
                  />
                )}
                {(activeAction === 'assign' || activeAction === 'return') && (
                  <Select 
                    label="存放地点" 
                    options={locations.map(l => ({ label: l.name, value: l.id }))} 
                    value={form.locationId} 
                    onChange={e => setForm({...form, locationId: e.target.value})} 
                  />
                )}
                <Input label="备注说明" placeholder="输入相关说明..." value={form.remark} onChange={e => setForm({...form, remark: e.target.value})} />
                <Input label="拍照留证 (图片URL)" placeholder="http://..." value={form.photoUrl} onChange={e => setForm({...form, photoUrl: e.target.value})} />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveAction(null)}>取消</Button>
                <Button size="sm" onClick={handleAction}>确认提交</Button>
              </div>
            </div>
          )}
        </div>

        {/* Lifecycle Timeline */}
        <div className="space-y-4">
          <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest px-2">全生命周期履历</h5>
          <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
            {logs.map(log => (
              <div key={log.id} className="relative group">
                <div className={`absolute -left-[23px] top-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-sm
                  ${log.type === 'assign' ? 'bg-indigo-500' : log.type === 'return' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                
                <div className="bg-white p-4 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-black text-slate-900 mr-2">
                        {users.find(u => u.id === log.operatorId)?.realName} 执行了 {
                          log.type === 'assign' ? '【领用】' : 
                          log.type === 'return' ? '【归还】' : 
                          log.type === 'repair' ? '【报修】' : '【变动】'
                        }
                      </span>
                      {log.targetUserId && (
                        <span className="text-xs text-slate-500">对象: {getUserName(log.targetUserId)}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-300 font-bold">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  
                  {log.remark && <p className="text-xs text-slate-500 italic mb-2">备注: {log.remark}</p>}
                  
                  {log.photoUrl && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-100 mt-2">
                      <img src={log.photoUrl} alt="log" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="py-8 text-center text-slate-300 italic text-sm">暂无变动记录</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
