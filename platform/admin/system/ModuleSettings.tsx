
import React, { useState } from 'react';
import { loadDb, saveDb } from '../../core/db';
import { ModuleId } from '../../core/types';
import { AllModules } from '../../../modules/index';
import { ColorCard } from '../../ui/layout/ColorCard';
import { Icon } from '../../ui/basic/Icon';
import { Badge } from '../../ui/basic/Badge';

export const ModuleSettings: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const enabledModules = db.sys_config.enabledModules || [];

  const handleToggleModule = (moduleId: ModuleId) => {
    // 安全逻辑：系统模块不可禁用，防止管理员由于误操作导致系统锁死
    if (moduleId === 'system') {
      alert('系统设置模块（System Core）为运行必需组件，不可禁用。');
      return;
    }

    const isCurrentlyEnabled = enabledModules.includes(moduleId);
    let nextEnabled: ModuleId[];

    if (isCurrentlyEnabled) {
      nextEnabled = enabledModules.filter(id => id !== moduleId);
    } else {
      nextEnabled = [...enabledModules, moduleId];
    }

    const newDb = {
      ...db,
      sys_config: {
        ...db.sys_config,
        enabledModules: nextEnabled
      }
    };

    saveDb(newDb);
    setDb(newDb);
    
    // 记录系统审计日志
    const operator = JSON.parse(localStorage.getItem('APP_SESSION') || '{}');
    const logDb = loadDb();
    logDb.logs.push({
      id: `log_${Date.now()}`,
      action: 'MODULE_CONFIG',
      userId: operator.id || 'system',
      details: `${isCurrentlyEnabled ? '禁用' : '启用'}模块: ${moduleId}`,
      timestamp: new Date().toISOString()
    });
    saveDb(logDb);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">全局功能开关</h2>
        <p className="text-slate-500 font-medium mt-1">控制业务模块在全院范围内的可见性与可用性。禁用后，所有非管理员用户将无法访问对应功能。</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AllModules.map((module) => {
          const isEnabled = enabledModules.includes(module.id as ModuleId);
          const isSystem = module.id === 'system';

          return (
            <ColorCard 
              key={module.id} 
              variant="white" 
              className={`transition-all border-b-4 ${isEnabled ? 'border-b-indigo-500 shadow-lg' : 'border-b-slate-200 opacity-75'}`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl transition-colors ${isEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Icon name={module.icon} size={28} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleToggleModule(module.id as ModuleId)}
                    disabled={isSystem}
                    className={`
                      relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
                      ${isEnabled ? 'bg-indigo-600' : 'bg-slate-200'}
                      ${isSystem ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    aria-pressed={isEnabled}
                    role="switch"
                  >
                    <span
                      aria-hidden="true"
                      className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                  <Badge variant={isEnabled ? 'success' : 'neutral'}>
                    {isEnabled ? '运行中' : '已停用'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-800">{module.name}</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed min-h-[40px]">
                  {module.description}
                </p>
              </div>

              {isSystem && (
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Icon name="ShieldCheck" size={12} />
                  核心模块受保护
                </div>
              )}
            </ColorCard>
          );
        })}
      </div>

      <ColorCard variant="indigo" className="!p-8 overflow-hidden relative shadow-2xl shadow-indigo-100">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <h3 className="text-2xl font-black text-white">配置生效说明</h3>
          <p className="text-indigo-100 font-medium leading-relaxed">
            1. 此处的开关影响系统侧边栏及工作台功能矩阵的入口显示。<br/>
            2. 禁用模块不会清除该模块已产生的业务数据，仅作为访问控制开关。<br/>
            3. <b>超级管理员</b> 依然可以在管理后台访问已禁用的模块以进行数据维护。
          </p>
        </div>
        <Icon name="Zap" size={200} className="absolute -right-10 -bottom-10 text-white/10 rotate-12 pointer-events-none" />
      </ColorCard>
    </div>
  );
};
