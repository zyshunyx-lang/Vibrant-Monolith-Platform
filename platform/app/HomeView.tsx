
import React from 'react';
import { Link } from 'react-router-dom';
import { loadDb, getCurrentUser } from '../core/db';
import { Grid } from '../ui/layout/Grid';
import { Icon } from '../ui/basic/Icon';
import { AllModules } from '../../modules/index';
import { DutyWidget } from '../../modules/duty/widgets/DutyWidget';
import { MenuWidget } from '../../modules/menu/widgets/MenuWidget';
import { HomeMeetingWidget } from '../../modules/meeting/widgets/HomeMeetingWidget';

export const HomeView: React.FC = () => {
  const db = loadDb();
  const user = getCurrentUser();
  const broadcasts = db.sys_config.broadcasts?.filter(b => b.isActive) || [];

  // 角色权限过滤
  const visibleModules = AllModules.filter(m => {
    if (!m.roles) return true;
    return user && m.roles.includes(user.role);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 系统公告跑马灯 */}
      {broadcasts.length > 0 && (
        <div className="bg-slate-900 h-10 rounded-2xl overflow-hidden flex items-center shadow-lg border border-white/5 group">
          <div className="bg-indigo-600 h-full px-4 flex items-center z-10 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
             <Icon name="Megaphone" size={16} className="text-white animate-pulse" />
             <span className="ml-2 text-xs font-black text-white uppercase tracking-wider">系统公告</span>
          </div>
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <div className="whitespace-nowrap animate-marquee hover:pause flex items-center gap-12 text-sm font-medium text-slate-300">
              {broadcasts.map((b, i) => (
                <div key={b.id} className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${b.level === 'warning' ? 'bg-amber-500' : 'bg-blue-400'}`}></span>
                  {b.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 欢迎头部 */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            你好，{user?.realName || '朋友'}
            <span className="text-2xl animate-bounce">👋</span>
          </h2>
          <p className="text-slate-500 font-medium mt-1">这是您的全扁平数字化工作台，所有功能触手可及。</p>
        </div>
      </header>

      {/* 实时状态微组件 (非全量功能入口，仅关键摘要) */}
      <Grid cols={3}>
        <DutyWidget />
        <MenuWidget />
        <HomeMeetingWidget />
      </Grid>

      {/* 核心业务功能矩阵 */}
      <div className="space-y-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-2">业务功能矩阵 / Functional Matrix</h3>
        <Grid cols={4}>
          {visibleModules.map(mod => (
            <Link 
              key={mod.id} 
              to={mod.route}
              className="group relative overflow-hidden rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  <Icon name={mod.icon} size={24} />
                </div>
                <Icon name="ArrowUpRight" size={14} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h4 className="text-lg font-black text-slate-800">{mod.name}</h4>
              <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">{mod.description}</p>
              
              <div className="mt-6 flex items-center gap-2">
                 <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-md">Ready</span>
              </div>
              
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-5 transition-all duration-700 blur-2xl" />
            </Link>
          ))}
        </Grid>
      </div>
    </div>
  );
};
