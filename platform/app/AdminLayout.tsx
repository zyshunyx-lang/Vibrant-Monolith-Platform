
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Icon, IconName } from '../ui/basic/Icon';
import { AllModules } from '../../modules/index';
import { useTranslation } from '../core/i18n';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    { name: t('admin.menu.overview'), path: '/admin', icon: 'LayoutDashboard' as IconName },
    { name: t('admin.menu.users'), path: '/admin/users', icon: 'Users' as IconName },
    { name: '功能开关', path: '/admin/system/modules', icon: 'ToggleRight' as IconName },
    { name: t('admin.menu.logs'), path: '/admin/logs', icon: 'ScrollText' as IconName },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-50">
           <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-110">
                <Icon name="Settings" size={18} />
              </div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase">{t('admin.title')}</h1>
            </Link>
        </div>

        <nav className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
          <section>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">{t('admin.group.core')}</h4>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all
                    ${location.pathname === item.path 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
                  `}
                >
                  <Icon name={item.icon} size={18} />
                  {item.name}
                </Link>
              ))}
            </div>
          </section>

          {AllModules.length > 0 && (
            <section>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">{t('admin.group.business')}</h4>
              <div className="space-y-1">
                {AllModules.filter(m => m.id !== 'system').map((module: any) => {
                  const adminRoute = module.adminRoute || `/admin/modules/${module.id}`;
                  const isActive = adminRoute && location.pathname.startsWith(adminRoute);
                  
                  return (
                    <Link
                      key={module.id}
                      to={adminRoute}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                         isActive
                         ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                         : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Icon name={module.icon || 'Box'} size={18} />
                      {t(`module.${module.id}.name`)}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all text-sm"
          >
            <Icon name="ArrowLeft" size={16} />
            {t('admin.exit')}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
