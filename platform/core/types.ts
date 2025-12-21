
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
  sys_config: {
    users: User[];
    departments: string[];
  };
  notifications: Notification[];
  logs: Log[];
  modules: {
    duty: any;
    menu: any;
  };
}
