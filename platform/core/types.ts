
export type UserRole = 'super_admin' | 'duty_admin' | 'menu_admin' | 'user';

export interface User {
  id: string;
  username: string;
  realName: string;
  role: UserRole;
  department: string;
  phone: string;
  password?: string;
  isActive: boolean;
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
    // Fix: Added assets property to the modules interface to ensure type compatibility with INITIAL_DATA and Assets module components.
    assets: any;
    // Fix: Added meeting property to the modules interface to ensure type compatibility with INITIAL_DATA and Meeting module components.
    meeting: any;
    // Fix: Added meetingNotice property to the modules interface to resolve type errors in NoticeWorkbench, DailyBriefReport, and NoticeStats.
    meetingNotice: any;
  };
}
