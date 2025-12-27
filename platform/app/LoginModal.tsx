
import React, { useState } from 'react';
import { loadDb, saveDb } from '../core/db';
import { Button } from '../ui/basic/Button';
import { Input } from '../ui/form/Input';
import { Icon } from '../ui/basic/Icon';
import { Modal } from '../ui/layout/Modal';
import { useTranslation } from '../core/i18n';
import { User } from '../core/types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
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
            setError(t('user.inactive') || '账号已停用');
            setLoading(false);
            return;
          }
          localStorage.setItem('APP_SESSION', JSON.stringify(user));
          onLoginSuccess(user);
          onClose();
        } else {
          setError(t('login.error') || '用户名或密码错误');
        }
      } else {
        // Register Mode
        if (!form.username || !form.password || !form.realName) {
          setError('请填写必填项');
          setLoading(false);
          return;
        }

        const exists = db.sys_config.users.find(u => u.username === form.username);
        if (exists) {
          setError('用户名已存在');
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
        setSuccess(t('login.register_success') || '注册成功');
        setMode('login');
        setForm({ ...form, password: '' });
      }
      setLoading(false);
    }, 800);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={mode === 'login' ? '用户登录' : '新用户注册'}
      footer={null}
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-3 transform -rotate-3">
            <Icon name="Box" size={24} />
          </div>
          <p className="text-slate-500 text-center text-xs font-medium">
            {mode === 'login' ? '请登录以继续操作' : '创建一个新账号以开始使用'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <Input 
                label={t('user.realName') || '真实姓名'}
                value={form.realName}
                onChange={e => setForm({ ...form, realName: e.target.value })}
                placeholder="请输入您的姓名"
                required
              />
              <Input 
                label={t('user.phone') || '手机号码'}
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="138xxxxxxxx"
              />
            </>
          )}
          
          <Input 
            label={t('login.username') || '用户名'}
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            placeholder="admin"
            required
            autoFocus
          />
          <Input 
            label={t('login.password') || '密码'}
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
          />
          
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-xl flex items-center gap-2 animate-shake">
              <Icon name="AlertCircle" size={14} />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-xl flex items-center gap-2">
              <Icon name="CheckCircle" size={14} />
              {success}
            </div>
          )}

          <Button type="submit" className="w-full justify-center shadow-lg" size="md" isLoading={loading}>
            {mode === 'login' ? (t('login.button') || '登录') : (t('login.register_button') || '注册')}
          </Button>
        </form>

        <div className="text-center pt-2">
          <button 
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
            className="text-indigo-600 text-xs font-bold hover:underline"
          >
            {mode === 'login' ? '还没有账号？前往注册' : '已有账号？立即登录'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
