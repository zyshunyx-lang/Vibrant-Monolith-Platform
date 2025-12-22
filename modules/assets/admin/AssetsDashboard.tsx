
import React, { useState } from 'react';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Button } from '../../../platform/ui/basic/Button';
import { AssetLedger } from './AssetLedger';
import { AuditManager } from './AuditManager';
import { CodeRuleSettings } from './CodeRuleSettings';
import { AssetImportWizard } from './AssetImportWizard';
import { BasicSettings } from './BasicSettings';
import { MobileAuditView } from '../mobile/MobileAuditView';
import { Modal } from '../../../platform/ui/layout/Modal';

type TabType = 'ledger' | 'audit' | 'settings' | 'rule';

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

          <div className="flex bg-slate-100 p-1.5 rounded-[24px] shadow-inner self-start flex-wrap gap-1 border border-slate-200/50">
            <button 
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'ledger' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon name="BookOpen" size={16} />
              资产台账
            </button>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'audit' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon name="ClipboardCheck" size={16} />
              盘点任务
            </button>
            <button 
              onClick={() => setActiveTab('rule')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'rule' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon name="Fingerprint" size={16} />
              编码规则
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon name="Settings" size={16} />
              基础配置
            </button>
          </div>
        </div>
      </header>

      <div className="transition-all duration-300">
        {activeTab === 'ledger' && <AssetLedger />}
        {activeTab === 'audit' && <AuditManager />}
        {activeTab === 'rule' && <CodeRuleSettings />}
        {activeTab === 'settings' && <BasicSettings />}
      </div>

      {/* Import Wizard Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="资产数据智能导入向导">
         <AssetImportWizard onSuccess={() => { setIsImportModalOpen(false); window.location.reload(); }} />
      </Modal>

      {/* Mobile Preview Simulation Modal */}
      <Modal 
        isOpen={isMobilePreviewOpen} 
        onClose={() => setIsMobilePreviewOpen(false)} 
        title="手机端盘点预览"
      >
        <div className="flex justify-center bg-slate-900 -m-6 p-10 h-[800px]">
           <div className="w-[375px] h-[667px] bg-white rounded-[3rem] border-[10px] border-black overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-30" />
              <div className="h-full overflow-hidden">
                <MobileAuditView />
              </div>
           </div>
        </div>
      </Modal>
    </div>
  );
};
