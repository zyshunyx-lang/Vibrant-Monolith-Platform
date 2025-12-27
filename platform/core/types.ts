
export type UserRole = 'super_admin' | 'duty_admin' | 'menu_admin' | 'user';

// 定义系统中所有可用的模块 ID
export type ModuleId = 'duty' | 'menu' | 'meeting' | 'assets' | 'system' | 'tools' | 'meeting-notice';

export interface User {
  id: string;
  username: string;
  realName: string;
  role: UserRole;
  department: string;
  phone: string;
  password?: string;
  isActive: boolean;
  /** 用户有权访问的模块列表 */
  allowedModules?: ModuleId[];
}

export interface Broadcast {
  id: string;
  message: string;
  level: 'info' | 'warning' | 'emergency';
  isActive: boolean;
  createdAt: string;
}

export interface SystemConfig {
  users: User[];
  departments: string[];
  broadcasts: Broadcast[];
  /** 系统全局开启的模块白名单 */
  enabledModules: ModuleId[];
}

export interface Notification {
  id: string;
  targetUserId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  content: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface Log {
  id: string;
  action: string;
  userId: string;
  details: string;
  timestamp: string;
}

export interface DBContent {
  sys_config: SystemConfig;
  notifications: Notification[];
  logs: Log[];
  modules: {
    duty: any;
    menu: any;
    assets: any;
    meeting: any;
    // 为了保持一致性，将 meetingNotice 统一为 meeting-notice 风格（或者保留 interface 兼容）
    meetingNotice: any; 
  };
}
