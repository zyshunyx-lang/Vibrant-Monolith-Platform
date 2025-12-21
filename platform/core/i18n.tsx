
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'zh';

const translations = {
  en: {
    'app.title': 'PLATFORM',
    'nav.home': 'Dashboard',
    'nav.apps': 'Apps',
    'nav.admin': 'Admin',
    'user.unknown': 'Unknown User',
    'user.realName': 'Real Name',
    'user.username': 'Username',
    'user.phone': 'Phone Number',
    'user.role': 'Role',
    'user.dept': 'Department',
    'user.status': 'Status',
    'user.active': 'Active',
    'user.inactive': 'Inactive',
    'user.password': 'Password',
    'role.super_admin': 'Super Admin',
    'role.duty_admin': 'Duty Admin',
    'role.menu_admin': 'Menu Admin',
    'role.user': 'User',
    'apps.title': 'Apps Center',
    'apps.subtitle': 'Access your business tools.',
    'admin.title': 'Admin Console',
    'admin.exit': 'Exit Admin',
    'admin.group.core': 'Core System',
    'admin.group.business': 'Business Modules',
    'admin.menu.overview': 'System Overview',
    'admin.menu.users': 'User Management',
    'admin.menu.logs': 'System Logs',
    'admin.no_permission': 'Access Denied: Admin roles only.',
    'module.duty.name': 'Duty Roster',
    'module.duty.desc': 'View monthly schedules, check shifts, and manage team availability.',
    'module.menu.name': 'Cafeteria Menu',
    'module.menu.desc': 'View weekly meal plans and daily specials.',
    // Duty View
    'duty.view.title': 'Duty Roster',
    'duty.view.subtitle': 'Monthly operational schedule with multi-role assignment.',
    'duty.view.active_count': '{count} active',
    'duty.view.draft': 'Draft',
    // Duty Admin specific
    'duty.admin.title': 'Duty Administration',
    'duty.admin.subtitle': 'Configure advanced roster rules and manage automated multi-slot scheduling.',
    'duty.tab.personnel': 'Personnel',
    'duty.tab.params': 'Parameters',
    'duty.tab.calendar': 'Calendar',
    'duty.tab.engine': 'Engine',
    'duty.params.categories.title': 'Personnel Categories & Rules',
    'duty.params.categories.add': 'Add Category',
    'duty.params.categories.empty': 'No categories defined.',
    'duty.params.slots.title': 'Daily Seat Configuration',
    'duty.params.slots.add': 'Add Seat',
    'duty.params.slots.empty': 'Define seats for daily duty.',
    'duty.params.slots.allowed': 'Allowed Categories:',
    'duty.params.prompt.category_name': 'Enter Category Name:',
    'duty.rules.ordinary': 'Ordinary',
    'duty.rules.workday': 'Workday',
    'duty.rules.weekend': 'Weekend',
    'duty.rules.holiday': 'Holiday',
    'duty.calendar.title': 'Calendar Overrides',
    'duty.calendar.desc': 'Mark specific dates as holidays or workday overrides for rotation logic.',
    'duty.calendar.add': 'Mark Special Date',
    'duty.calendar.date': 'Date',
    'duty.calendar.type': 'Type',
    'duty.calendar.name': 'Label',
    'duty.roster.title': 'Personnel Assignment',
    'duty.roster.user': 'User',
    'duty.roster.category': 'Category',
    'duty.roster.exempt': 'Exempt',
    'duty.roster.unassigned': 'Unassigned',
    'duty.engine.title': 'Generation Engine',
    'duty.engine.generate': 'Generate Draft',
    'duty.engine.publish': 'Publish Roster',
    'duty.engine.confirm_title': 'Confirm Schedule Publish',
    'duty.engine.confirm_msg': 'Are you sure you want to publish the roster for {month}?',
    'duty.engine.slot_missing_error': "Please configure 'Duty Slots' first.",
    'login.title': 'Welcome Back',
    'login.register_title': 'Create Account',
    'login.subtitle': 'Sign in to access your workspace',
    'login.register_subtitle': 'Join our modular ecosystem',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.button': 'Sign In',
    'login.register_button': 'Sign Up',
    'login.switch_to_register': "Don't have an account? Register",
    'login.switch_to_login': 'Already have an account? Sign In',
    'login.error': 'Invalid username or password',
    'login.register_success': 'Registration successful! Please login.',
    'auth.logout': 'Sign Out',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.actions': 'Actions'
  },
  zh: {
    'app.title': '平台',
    'nav.home': '工作台',
    'nav.apps': '应用中心',
    'nav.admin': '管理后台',
    'user.unknown': '未知用户',
    'user.realName': '真实姓名',
    'user.username': '用户名',
    'user.phone': '手机号',
    'user.role': '角色',
    'user.dept': '部门',
    'user.status': '状态',
    'user.active': '启用',
    'user.inactive': '禁用',
    'user.password': '密码',
    'role.super_admin': '超级管理员',
    'role.duty_admin': '值班管理员',
    'role.menu_admin': '食堂管理员',
    'role.user': '普通用户',
    'apps.title': '应用中心',
    'apps.subtitle': '访问您的业务工具',
    'admin.title': '管理控制台',
    'admin.exit': '退出管理',
    'admin.group.core': '核心系统',
    'admin.group.business': '业务模块',
    'admin.menu.overview': '系统概览',
    'admin.menu.users': '用户管理',
    'admin.menu.logs': '系统日志',
    'admin.no_permission': '拒绝访问：仅限管理人员。',
    'module.duty.name': '值班管理',
    'module.duty.desc': '查看月度排班表、检查班次及管理团队可用性。',
    'module.menu.name': '食堂菜单',
    'module.menu.desc': '查看每周供餐计划及每日特色菜品。',
    // Duty View
    'duty.view.title': '值班排班表',
    'duty.view.subtitle': '月度值班运行计划，支持多角色席位分配。',
    'duty.view.active_count': '{count} 人在位',
    'duty.view.draft': '草稿',
    // Duty Admin specific
    'duty.admin.title': '值班后台管理',
    'duty.admin.subtitle': '配置高级排班规则，管理自动化多席位排班引擎。',
    'duty.tab.personnel': '人员归类',
    'duty.tab.params': '规则参数',
    'duty.tab.calendar': '日期调整',
    'duty.tab.engine': '排班引擎',
    'duty.params.categories.title': '人员类别与规则',
    'duty.params.categories.add': '添加类别',
    'duty.params.categories.empty': '尚未定义任何类别。',
    'duty.params.slots.title': '每日席位配置',
    'duty.params.slots.add': '添加席位',
    'duty.params.slots.empty': '请先定义每日值班席位。',
    'duty.params.slots.allowed': '允许的类别：',
    'duty.params.prompt.category_name': '请输入类别名称：',
    'duty.rules.ordinary': '普通规则',
    'duty.rules.workday': '工作日',
    'duty.rules.weekend': '周末',
    'duty.rules.holiday': '节假日',
    'duty.calendar.title': '特殊日期管理',
    'duty.calendar.desc': '在此标记法定节假日或补班日期，将直接影响自动排班的轮询指针。',
    'duty.calendar.add': '添加特殊日期',
    'duty.calendar.date': '日期',
    'duty.calendar.type': '类型',
    'duty.calendar.name': '名称',
    'duty.calendar.holiday': '法定节假日',
    'duty.calendar.workday_override': '加班/补班 (按工作日算)',
    'duty.roster.title': '人员类别分配',
    'duty.roster.user': '姓名',
    'duty.roster.category': '所属类别',
    'duty.roster.exempt': '免除值班',
    'duty.roster.unassigned': '未分配',
    'duty.engine.title': '排班生成引擎',
    'duty.engine.generate': '生成预览草案',
    'duty.engine.publish': '正式发布排班',
    'duty.engine.confirm_title': '确认发布排班',
    'duty.engine.confirm_msg': '确定要发布 {month} 的排班表吗？',
    'duty.engine.slot_missing_error': "请先在“规则参数”中配置“值班席位”。",
    // Login & Register
    'login.title': '欢迎回来',
    'login.register_title': '创建账号',
    'login.subtitle': '登录以访问您的工作空间',
    'login.register_subtitle': '加入我们的模块化生态系统',
    'login.username': '用户名',
    'login.password': '密码',
    'login.button': '登录',
    'login.register_button': '注册',
    'login.switch_to_register': '还没有账号？立即注册',
    'login.switch_to_login': '已有账号？返回登录',
    'login.error': '用户名或密码错误',
    'login.register_success': '注册成功！请登录。',
    'auth.logout': '退出登录',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.actions': '操作'
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

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
