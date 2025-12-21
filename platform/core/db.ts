
import { DBContent, User } from './types';

const DB_KEY = 'MODULAR_MONOLITH_DB';

export const INITIAL_DATA: DBContent = {
  sys_config: {
    users: [
      {
        id: '1',
        username: 'admin',
        realName: 'Super Admin',
        role: 'super_admin',
        department: 'Platform',
        phone: '13800000000',
        password: '123',
        isActive: true
      }
    ],
    departments: ['Platform', 'Operations', 'Finance', 'HR']
  },
  notifications: [],
  logs: [],
  modules: {
    duty: {},
    menu: {}
  }
};

export const loadDb = (): DBContent => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    saveDb(INITIAL_DATA);
    return INITIAL_DATA;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Database corruption detected. Reverting to initial data.", e);
    return INITIAL_DATA;
  }
};

export const saveDb = (newDb: DBContent): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(newDb));
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem('APP_SESSION');
  return session ? JSON.parse(session) : null;
};
