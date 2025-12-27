
import React, { useState } from 'react';
import { Icon } from '../../platform/ui/basic/Icon';
import { UserManager } from '../../platform/admin/user/UserManager';
import { LogViewer } from '../../platform/admin/system/LogViewer';
import { ModuleSettings } from '../../platform/admin/system/ModuleSettings';

type SystemTab = 'users' | 'modules' | 'logs';

export const SystemModuleEntry: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SystemTab>('users');

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            系统底层设置
            <div className="px-3 py-1 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl">
               Platform Core
            </div>
          </h2>
          <p className="text-slate-500 font-medium mt-1">管理全院用户权限、配置各业务模块启用状态并监控系统安全性日志。</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-[24px] shadow-inner self-start border border-slate-200/50">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'users' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="Users" size={16} />
            用户权限
          </button>
          <button 
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'modules' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="ToggleRight" size={16} />
            功能开关
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === 'logs' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="ScrollText" size={16} />
            安全审计
          </button>
        </div>
      </header>

      <div className="transition-all duration-300">
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'modules' && <ModuleSettings />}
        {activeTab === 'logs' && <LogViewer />}
      </div>
    </div>
  );
};
