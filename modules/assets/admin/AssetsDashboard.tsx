
import React, { useState, Suspense, lazy } from 'react';
import { Icon, IconName } from '../../../platform/ui/basic/Icon';
import { Button } from '../../../platform/ui/basic/Button';
import { AssetLedger } from './AssetLedger';
import { AuditManager } from './AuditManager';
import { CodeRuleSettings } from './CodeRuleSettings';
import { BasicSettings } from './BasicSettings';
import { Modal } from '../../../platform/ui/layout/Modal';

// 懒加载 Modal 内部的大型或非即时渲染组件，优化包体积和首屏性能
const AssetImportWizard = lazy(() => import('./AssetImportWizard').then(m => ({ default: m.AssetImportWizard })));
const MobileAuditView = lazy(() => import('../mobile/MobileAuditView').then(m => ({ default: m.MobileAuditView })));

type TabType = 'ledger' | 'audit' | 'settings' | 'rule';

interface TabItem {
  id: TabType;
  label: string;
  icon: IconName;
}

const TABS: TabItem[] = [
  { id: 'ledger', label: '资产台账', icon: 'BookOpen' },
  { id: 'audit', label: '盘点任务', icon: 'ClipboardCheck' },
  { id: 'rule', label: '编码规则', icon: 'Fingerprint' },
  { id: 'settings', label: '基础配置', icon: 'Settings' },
];

// 提取 Tab 导航组件，保持主组件整洁
const DashboardTabs: React.FC<{ activeTab: TabType; onChange: (tab: TabType) => void }> = ({ activeTab, onChange }) => (
  <div className="flex bg-slate-100 p-1.5 rounded-[24px] shadow-inner self-start flex-wrap gap-1 border border-slate-200/50">
    {TABS.map((tab) => (
      <button 
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`
          flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all 
          ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}
        `}
      >
        <Icon name={tab.icon} size={16} />
        {tab.label}
      </button>
    ))}
  </div>
);

// 统一样式的加载占位组件
const LoadingFallback = () => (
  <div className="py-20 flex flex-col items-center justify-center space-y-4">
    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">加载中...</p>
  </div>
);

export const AssetsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ledger');
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            固定资产管理
            <div className="px-3 py-1 bg-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl border border-indigo-200">
               Assets v1.6
            </div>
          </h2>
          <p className="text-slate-500 font-medium mt-1">企业全生命周期资产管理：支持旧编码继承、流水号自动校准。</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="!rounded-2xl" onClick={() => setIsImportModalOpen(true)}>
             <Icon name="Import" size={16} className="mr-2" />
             批量导入
          </Button>
          <Button variant="secondary" className="!rounded-2xl" onClick={() => setIsMobilePreviewOpen(true)}>
             <Icon name="Smartphone" size={16} className="mr-2" />
             手机端模拟
          </Button>

          <DashboardTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </header>

      <div className="transition-all duration-300">
        {activeTab === 'ledger' && <AssetLedger />}
        {activeTab === 'audit' && <AuditManager />}
        {activeTab === 'rule' && <CodeRuleSettings />}
        {activeTab === 'settings' && <BasicSettings />}
      </div>

      {/* 资产导入 Modal - 仅在打开时加载向导组件 */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="资产数据智能导入向导">
         <Suspense fallback={<LoadingFallback />}>
           {isImportModalOpen && (
             <AssetImportWizard onSuccess={() => { setIsImportModalOpen(false); window.location.reload(); }} />
           )}
         </Suspense>
      </Modal>

      {/* 手机端盘点模拟 Modal */}
      <Modal 
        isOpen={isMobilePreviewOpen} 
        onClose={() => setIsMobilePreviewOpen(false)} 
        title="手机端盘点预览"
      >
        <div className="flex justify-center bg-slate-900 -m-6 p-10 h-[800px]">
           <div className="w-[375px] h-[667px] bg-white rounded-[3rem] border-[10px] border-black overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-30" />
              <div className="h-full overflow-hidden">
                <Suspense fallback={<LoadingFallback />}>
                  {isMobilePreviewOpen && <MobileAuditView />}
                </Suspense>
              </div>
           </div>
        </div>
      </Modal>
    </div>
  );
};
