import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadDb, saveDb } from '../core/db';
import { Button } from '../ui/basic/Button';
import { Input } from '../ui/form/Input';
import { Icon } from '../ui/basic/Icon';
import { useTranslation } from '../core/i18n';
import { User } from '../core/types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [form, setForm] = useState({
    username: '',
    password: '',
    realName: '',
    phone: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    setTimeout(() => {
      const db = loadDb();
      
      if (mode === 'login') {
        const user = db.sys_config.users.find(
          u => u.username === form.username && u.password === form.password
        );

        if (user) {
          if (!user.isActive) {
            setError(t('user.inactive'));
            setLoading(false);
            return;
          }
          localStorage.setItem('APP_SESSION', JSON.stringify(user));
          navigate('/', { replace: true });
        } else {
          setError(t('login.error'));
        }
      } else {
        // Register Mode
        if (!form.username || !form.password || !form.realName) {
          setError('Please fill required fields');
          setLoading(false);
          return;
        }

        const exists = db.sys_config.users.find(u => u.username === form.username);
        if (exists) {
          setError('Username already exists');
          setLoading(false);
          return;
        }

        const newUser: User = {
          id: Date.now().toString(),
          username: form.username,
          password: form.password,
          realName: form.realName,
          phone: form.phone,
          role: 'user',
          department: 'Guest',
          isActive: true
        };

        const newDb = {
          ...db,
          sys_config: {
            ...db.sys_config,
            users: [...db.sys_config.users, newUser]
          }
        };
        saveDb(newDb);
        setSuccess(t('login.register_success'));
        setMode('login');
        setForm({ ...form, password: '' });
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-4 transform -rotate-3 transition-transform hover:rotate-0">
            <Icon name="Box" size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight text-center">
            {t('app.title')}<span className="text-indigo-600">OS</span>
          </h1>
          <p className="text-slate-500 mt-2 text-center text-sm font-medium">
            {mode === 'login' ? t('login.subtitle') : t('login.register_subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <>
              <Input 
                label={t('user.realName')}
                value={form.realName}
                onChange={e => setForm({ ...form, realName: e.target.value })}
                placeholder="John Doe"
                required
              />
              <Input 
                label={t('user.phone')}
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="138xxxxxxx"
              />
            </>
          )}
          
          <Input 
            label={t('login.username')}
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            placeholder="admin"
            required
            autoFocus
          />
          <Input 
            label={t('login.password')}
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
          />
          
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2 animate-bounce">
              <Icon name="AlertCircle" size={14} />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-2">
              <Icon name="CheckCircle" size={14} />
              {success}
            </div>
          )}

          <Button type="submit" className="w-full justify-center shadow-lg" size="lg" isLoading={loading}>
            {mode === 'login' ? t('login.button') : t('login.register_button')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
            className="text-indigo-600 text-sm font-bold hover:underline"
          >
            {mode === 'login' ? t('login.switch_to_register') : t('login.switch_to_login')}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Modular Monolith Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
};