
import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/basic/Icon';
import { Button } from '../ui/basic/Button';
import { useAuth } from '../core/AuthContext';
import { useTranslation } from '../core/i18n';
import { LoginModal } from './LoginModal';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const { user, logout, isLoginModalOpen, showLoginModal, closeLoginModal, login } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#fcfdff] flex flex-col">
      <nav className="bg-white/90 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all group-hover:rotate-12">
                <Icon name="Box" size={22} />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                VIBRANT<span className="text-indigo-600">OS</span>
              </h1>
            </Link>

            {/* 游客模式标识 */}
            {!user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Guest Mode</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors flex items-center justify-center relative group"
            >
              <Icon name="Globe" size={18} />
            </button>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`
                    flex items-center gap-3 p-1 pr-3 rounded-full transition-all border
                    ${isUserMenuOpen ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}
                  `}
                >
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 overflow-hidden ring-2 ring-white">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="user" />
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-none">
                    <span className="text-xs font-black text-slate-800">{user.realName}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{t(`role.${user.role}`)}</span>
                  </div>
                  <Icon name={isUserMenuOpen ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">@{user.username}</p>
                      </div>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center transition-colors group-hover:bg-rose-200">
                          <Icon name="LogOut" size={16} />
                        </div>
                        {t('auth.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button 
                onClick={showLoginModal}
                size="sm" 
                className="!rounded-full px-6 shadow-indigo-100"
              >
                <Icon name="LogIn" size={16} className="mr-2" />
                登录 / 注册
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8">
        <Outlet />
      </main>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal} 
        onLoginSuccess={(u) => {
          login(u);
        }} 
      />
    </div>
  );
};
