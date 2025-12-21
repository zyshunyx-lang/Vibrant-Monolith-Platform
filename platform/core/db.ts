
import { DBContent, User } from './types';

const DB_KEY = 'MODULAR_MONOLITH_DB';

export const INITIAL_DATA: DBContent = {
  sys_config: {
    users: [
      {
        id: '1',
        username: 'admin',
        realName: '超级管理员',
        role: 'super_admin',
        department: '管理部',
        phone: '13800000000',
        password: '123',
        isActive: true
      }
    ],
    departments: ['管理部', '技术部', '财务部', '人事部']
  },
  notifications: [],
  logs: [],
  modules: {
    duty: {
      categories: [],
      rules: [],
      calendarOverrides: [],
      slotConfigs: [],
      rosterConfigs: {},
      schedules: []
    },
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
    const parsed = JSON.parse(data);
    // Deep merge to ensure duty structure exists even if localStorage has old data
    if (!parsed.modules.duty || !parsed.modules.duty.categories) {
      parsed.modules.duty = INITIAL_DATA.modules.duty;
    }
    return parsed;
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
  if (session) return JSON.parse(session);
  
  // Developer Fallback: Automatically return admin user if no session (for debugging)
  const db = loadDb();
  return db.sys_config.users.find(u => u.username === 'admin') || null;
};
