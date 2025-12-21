import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Icon } from '../ui/basic/Icon';
import { Badge } from '../ui/basic/Badge';
import { loadDb } from '../core/db';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const db = loadDb();
  
  // Safety check for user
  const user = db.sys_config.users?.[0] || {
    username: 'unknown',
    realName: 'Unknown User',
    role: 'user'
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: 'Home' as const },
    { name: 'Apps', path: '/apps', icon: 'LayoutGrid' as const },
    { name: 'Admin', path: '/admin', icon: 'ShieldCheck' as const },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
                <Icon name="Box" size={20} />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">PLATFORM<span className="text-indigo-600">OS</span></h1>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                    ${location.pathname === link.path 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}
                  `}
                >
                  <Icon name={link.icon} size={16} />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-slate-800">{user.realName}</span>
              <Badge variant="info" className="text-[10px] uppercase py-0 px-1.5">{user.role}</Badge>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-200 transition-all">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};
