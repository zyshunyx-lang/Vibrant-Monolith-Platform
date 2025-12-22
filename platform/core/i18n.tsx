
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'zh';

const translations = {
  en: {
    'app.title': 'VIBRANT PLATFORM',
    'nav.home': 'Workplace',
    'nav.apps': 'Apps',
    'nav.admin': 'Admin Console',
    'user.role': 'Role',
    'role.super_admin': 'Super Admin',
    'role.duty_admin': 'Duty Admin',
    'role.menu_admin': 'Cafeteria Admin',
    'role.user': 'Employee',
    'apps.title': 'Application Center',
    'admin.menu.overview': 'System Overview',
    'admin.menu.users': 'User Management',
    'admin.menu.logs': 'Security Logs',
    'module.duty.name': 'Duty Roster',
    'module.menu.name': 'Smart Cafeteria',
    'module.meeting.name': 'Meeting Booking',
    'module.assets.name': 'Fixed Assets',
    'common.save': 'Save Changes',
    'common.cancel': 'Cancel',
    'auth.logout': 'Sign Out'
  },
  zh: {
    'app.title': '数字化办公平台',
    'nav.home': '工作台',
    'nav.apps': '应用中心',
    'nav.admin': '管理后台',
    'user.realName': '真实姓名',
    'user.username': '账号名',
    'user.role': '所属权限',
    'user.status': '账号状态',
    'user.active': '已启用',
    'user.inactive': '已停用',
    'role.super_admin': '超级管理员',
    'role.duty_admin': '值班管理员',
    'role.menu_admin': '食堂管理员',
    'role.user': '普通员工',
    'apps.title': '应用矩阵',
    'apps.subtitle': '点击进入对应业务模块进行操作',
    'admin.title': '系统管理中心',
    'admin.exit': '返回工作台',
    'admin.group.core': '基础架构',
    'admin.group.business': '业务模块',
    'admin.menu.overview': '系统概览',
    'admin.menu.users': '用户与权限',
    'admin.menu.logs': '操作审计日志',
    'module.duty.name': '值班排班',
    'module.duty.desc': '查看月度值班安排，支持在线换班与备勤申请。',
    'module.menu.name': '智慧食堂',
    'module.menu.desc': '每日菜谱预览，支持菜品点赞/反馈与周度排餐。',
    'module.meeting.name': '会议预约',
    'module.meeting.desc': '在线预约会议室，支持资源冲突检测与审批流。',
    'module.assets.name': '资产管理',
    'module.assets.desc': '固定资产全生命周期追踪，扫码入库与数字化盘点。',
    'auth.logout': '退出登录',
    'common.save': '保存配置',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.actions': '快捷操作'
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('APP_LANG') as Language) || 'zh';
  });

  useEffect(() => {
    localStorage.setItem('APP_LANG', language);
  }, [language]);

  const t = (key: string, variables?: Record<string, string>) => {
    const dict = translations[language];
    let text = (dict as any)[key] || key;
    if (variables) {
      Object.entries(variables).forEach(([vKey, vVal]) => {
        text = text.replace(`{${vKey}}`, vVal);
      });
    }
    return text;
  };

  return <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within a LanguageProvider');
  return context;
};
