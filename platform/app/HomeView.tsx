
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loadDb, getCurrentUser } from '../core/db';
import { Grid } from '../ui/layout/Grid';
import { Icon, IconName } from '../ui/basic/Icon';
import { Badge } from '../ui/basic/Badge';
import { AllModules } from '../../modules/index';
import { DutyWidget } from '../../modules/duty/widgets/DutyWidget';
import { MenuWidget } from '../../modules/menu/widgets/MenuWidget';
import { HomeMeetingWidget } from '../../modules/meeting/widgets/HomeMeetingWidget';
import { ModuleId, User } from '../core/types';
import { useAuth } from '../core/AuthContext';

/**
 * 内部组件：ModuleCard
 * 实现了点击时的权限拦截逻辑与差异化视觉表现
 */
const ModuleCard: React.FC<{
  moduleId: ModuleId;
  name: string;
  icon: IconName;
  route: string;
  description: string;
  enabledModules: ModuleId[];
  user: User | null;
}> = ({ moduleId, name, icon, route, description, enabledModules, user }) => {
  const navigate = useNavigate();
  const { showLoginModal } = useAuth();
  
  // 权限状态计算
  const isGlobalEnabled = enabledModules.includes(moduleId);
  const isSuperAdmin = user?.role === 'super_admin';
  const hasUserPermission = isSuperAdmin || (user?.allowedModules || []).includes(moduleId);
  
  // 视觉状态
  const isLocked = user && !hasUserPermission; // 已登录但没权限
  const isMaintenance = !isGlobalEnabled;       // 全局已关闭

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Step 1: 未登录检查
    if (!user) {
      showLoginModal();
      return;
    }

    // Step 2: 全局开关检查
    if (isMaintenance) {
      alert(`【${name}】模块目前处于系统维护或已关闭状态，请稍后再试。`);
      return;
    }

    // Step 3: 个人权限检查
    if (!hasUserPermission) {
      alert(`抱歉，您的账号暂无【${name}】模块的访问权限。\n如需开通，请联系信息技术部或系统管理员。`);
      return;
    }

    // Step 4: 检查通过，跳转
    navigate(route);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`
        group relative overflow-hidden rounded-[32px] border p-6 transition-all duration-500 cursor-pointer
        ${isMaintenance 
          ? 'bg-slate-50 border-slate-200 grayscale opacity-60' 
          : isLocked 
            ? 'bg-white border-slate-100 opacity-50 shadow-inner' 
            : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1'}
      `}
    >
      {/* 状态徽章 */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
        {isMaintenance && (
          <Badge variant="neutral" className="bg-slate-200 text-slate-500 font-black border-none uppercase tracking-tighter">维护中</Badge>
        )}
        {isLocked && !isMaintenance && (
          <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <Icon name="Lock" size={12} />
          </div>
        )}
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className={`
          p-3.5 rounded-2xl transition-all duration-500
          ${isMaintenance 
            ? 'bg-slate-200 text-slate-400' 
            : 'bg-slate-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}
        `}>
          <Icon name={icon} size={24} />
        </div>
        {!isMaintenance && !isLocked && (
          <Icon name="ArrowUpRight" size={14} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
        )}
      </div>

      <h4 className={`text-lg font-black ${isMaintenance ? 'text-slate-400' : 'text-slate-800'}`}>{name}</h4>
      <p className={`text-xs font-medium mt-1 leading-relaxed ${isMaintenance ? 'text-slate-300' : 'text-slate-400'}`}>{description}</p>
      
      <div className="mt-6 flex items-center gap-2">
        {isMaintenance ? (
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-2 py-0.5 bg-slate-200 rounded-md">Service Off</span>
        ) : isLocked ? (
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded-md">No Access</span>
        ) : (
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-md">Ready</span>
        )}
      </div>
      
      {!isMaintenance && !isLocked && (
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-5 transition-all duration-700 blur-2xl" />
      )}
    </div>
  );
};

export const HomeView: React.FC = () => {
  const db = loadDb();
  const { user } = useAuth();
  const broadcasts = db.sys_config.broadcasts?.filter(b => b.isActive) || [];
  const enabledModules = db.sys_config.enabledModules || [];
  
  // 小组件展示逻辑：只有登录且有权且开启时才显示
  const isSuperAdmin = user?.role === 'super_admin';
  const userAllowedModules = user?.allowedModules || [];

  const canShowWidget = (mid: ModuleId) => {
    if (!user) return false;
    return (isSuperAdmin || userAllowedModules.includes(mid)) && enabledModules.includes(mid);
  };

  const showDutyWidget = canShowWidget('duty');
  const showMenuWidget = canShowWidget('menu');
  const showMeetingWidget = canShowWidget('meeting');

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
              {broadcasts.map((b) => (
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

      {/* 实时状态微组件区域 */}
      {user ? (
        (showDutyWidget || showMenuWidget || showMeetingWidget) ? (
          <Grid cols={3}>
            {showDutyWidget && <DutyWidget />}
            {showMenuWidget && <MenuWidget />}
            {showMeetingWidget && <HomeMeetingWidget />}
          </Grid>
        ) : (
          <div className="p-10 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 text-center">
             <Icon name="Layout" size={40} className="mx-auto text-slate-300 mb-3 opacity-20" />
             <h3 className="text-lg font-black text-slate-800">桌面概览受限</h3>
             <p className="text-xs text-slate-400 mt-1 font-medium">您当前的账号暂无拥有对应模块权限，或相关模块已禁用，因此无法显示快捷小组件。</p>
          </div>
        )
      ) : (
        <div className="p-10 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[40px] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-black text-indigo-900">开启您的数字办公之旅</h3>
              <p className="text-sm font-medium text-indigo-600/70">登录后即可查看您的值班安排、今日菜谱及会议预约详情。</p>
           </div>
           <Badge variant="info" className="px-6 py-2 rounded-full font-black animate-pulse">访客模式</Badge>
        </div>
      )}

      {/* 核心业务功能矩阵 - 始终全量渲染 */}
      <div className="space-y-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-2">业务功能矩阵 / Functional Matrix</h3>
        
        <Grid cols={4}>
          {AllModules.map(mod => (
            <ModuleCard 
              key={mod.id}
              moduleId={mod.id as ModuleId}
              name={mod.name}
              icon={mod.icon}
              route={mod.route}
              description={mod.description}
              enabledModules={enabledModules}
              user={user}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
};
