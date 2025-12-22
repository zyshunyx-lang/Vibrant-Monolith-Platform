
import React, { useState, useEffect } from 'react';
import { loadDb, getCurrentUser } from '../../../platform/core/db';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Button } from '../../../platform/ui/basic/Button';
import { Input } from '../../../platform/ui/form/Input';
import { Badge } from '../../../platform/ui/basic/Badge';
import { AssetsModuleSchema, AuditTask, Asset, AuditResult } from '../types';
import { submitAuditRecord, getAuditProgress } from '../logic/auditService';

export const MobileAuditView: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [activeTask, setActiveTask] = useState<AuditTask | null>(null);
  const [step, setStep] = useState<'tasks' | 'scanner' | 'form'>('tasks');
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [scanInput, setScanInput] = useState('');
  
  const [form, setForm] = useState({
    result: 'normal' as AuditResult,
    remark: '',
    photoUrl: ''
  });

  const assetData = db.modules.assets as AssetsModuleSchema;
  const activeTasks = (assetData.auditTasks || []).filter(t => t.status === 'active');

  const handleScan = () => {
    const asset = assetData.assets.find(a => a.assetCode === scanInput);
    if (!asset) {
      alert('未找到该资产，请重新输入或核对编码');
      return;
    }
    setScannedAsset(asset);
    setStep('form');
  };

  const handleSubmit = () => {
    if (!activeTask || !scannedAsset) return;
    try {
      submitAuditRecord({
        taskId: activeTask.id,
        assetCode: scannedAsset.assetCode,
        ...form
      });
      alert('盘点提交成功');
      setDb(loadDb());
      setStep('scanner');
      setScannedAsset(null);
      setScanInput('');
      setForm({ result: 'normal', remark: '', photoUrl: '' });
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {/* Mobile Header */}
      <header className="bg-indigo-600 text-white p-4 flex items-center justify-between sticky top-0 z-20">
        {step !== 'tasks' ? (
          <button onClick={() => setStep(step === 'form' ? 'scanner' : 'tasks')} className="p-2 -ml-2">
            <Icon name="ChevronLeft" size={24} />
          </button>
        ) : (
          <div className="w-8" />
        )}
        <h1 className="text-lg font-black tracking-tight">
          {step === 'tasks' ? '盘点任务' : activeTask?.name}
        </h1>
        <button onClick={() => setDb(loadDb())} className="p-2 -mr-2">
          <Icon name="RefreshCw" size={20} />
        </button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {step === 'tasks' && (
          <div className="space-y-4">
            {activeTasks.map(task => {
              const progress = getAuditProgress(task.id);
              return (
                <div 
                  key={task.id} 
                  onClick={() => { setActiveTask(task); setStep('scanner'); }}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm active:scale-95 transition-transform cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-slate-800 text-lg">{task.name}</h3>
                    <Badge variant="success">进行中</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                      <span>盘点进度</span>
                      <span>{progress.audited} / {progress.total}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-500" 
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {activeTasks.length === 0 && (
              <div className="py-20 text-center text-slate-400">
                <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold">暂无进行中的盘点任务</p>
              </div>
            )}
          </div>
        )}

        {step === 'scanner' && (
          <div className="h-full flex flex-col items-center justify-center space-y-8 py-10">
            <div className="relative group">
               <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 group-active:opacity-40 transition-opacity" />
               <button 
                onClick={() => {
                  const code = prompt('模拟扫描二维码，请输入资产编码：', 'ZC-2023-001');
                  if (code) { setScanInput(code); }
                }}
                className="relative w-40 h-40 bg-white border-8 border-indigo-600 rounded-full flex flex-col items-center justify-center shadow-2xl active:scale-90 transition-transform"
               >
                 <Icon name="QrCode" size={48} className="text-indigo-600 mb-2" />
                 <span className="text-xs font-black text-indigo-600 uppercase">点击扫码</span>
               </button>
            </div>

            <div className="w-full space-y-4">
               <p className="text-center text-xs font-black text-slate-400 uppercase tracking-widest">或手动输入编码</p>
               <div className="flex gap-2">
                 <Input 
                   placeholder="输入资产编码..." 
                   value={scanInput} 
                   onChange={e => setScanInput(e.target.value)} 
                   className="flex-1"
                 />
                 <Button onClick={handleScan} className="shrink-0">
                    <Icon name="ArrowRight" size={20} />
                 </Button>
               </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
               <Icon name="Info" className="text-amber-500 shrink-0" size={18} />
               <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                 扫描资产上的二维码标签，确认设备状态并拍照。
                 确保资产存放在指定位置且外观无损。
               </p>
            </div>
          </div>
        )}

        {step === 'form' && scannedAsset && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{scannedAsset.assetCode}</p>
              <h3 className="text-xl font-black text-slate-800 mb-2">{scannedAsset.name}</h3>
              <div className="flex gap-2">
                <Badge variant="neutral">{scannedAsset.model}</Badge>
                <Badge variant="info">位置: {assetData.locations.find(l => l.id === scannedAsset.locationId)?.name}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">盘点结果</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: '正常', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', active: 'bg-emerald-600 text-white' },
                  { id: 'damaged', label: '损坏', color: 'bg-amber-50 text-amber-600 border-amber-100', active: 'bg-amber-600 text-white' },
                  { id: 'missing', label: '盘亏', color: 'bg-rose-50 text-rose-600 border-rose-100', active: 'bg-rose-600 text-white' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setForm({ ...form, result: opt.id as AuditResult })}
                    className={`
                      py-4 rounded-2xl border text-sm font-black transition-all
                      ${form.result === opt.id ? opt.active : opt.color}
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              
              <div className="space-y-3">
                <Input 
                  label="拍照留证 (图片URL)" 
                  placeholder="请输入图片链接..." 
                  value={form.photoUrl} 
                  onChange={e => setForm({ ...form, photoUrl: e.target.value })} 
                />
                <Input 
                  label="盘点备注" 
                  placeholder="输入异常说明..." 
                  value={form.remark} 
                  onChange={e => setForm({ ...form, remark: e.target.value })} 
                />
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full py-4 shadow-xl shadow-indigo-100" size="lg">
              提交盘点记录
            </Button>
          </div>
        )}
      </main>

      {/* Mobile Nav Simulation */}
      <footer className="bg-white border-t border-slate-200 p-2 flex justify-around items-center">
        <button className="flex flex-col items-center p-2 text-indigo-600">
          <Icon name="LayoutDashboard" size={20} />
          <span className="text-[10px] font-bold mt-1">盘点</span>
        </button>
        <button className="flex flex-col items-center p-2 text-slate-300">
          <Icon name="Search" size={20} />
          <span className="text-[10px] font-bold mt-1">查资产</span>
        </button>
        <button className="flex flex-col items-center p-2 text-slate-300">
          <Icon name="User" size={20} />
          <span className="text-[10px] font-bold mt-1">我的</span>
        </button>
      </footer>
    </div>
  );
};
