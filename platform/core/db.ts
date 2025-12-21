
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
      schedules: [],
      rotationState: {},
      savedProfiles: [],
      currentProfileName: '默认方案'
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
    // Deep consistency check for duty module
    if (!parsed.modules.duty) {
      parsed.modules.duty = INITIAL_DATA.modules.duty;
    } else {
      // Ensure all arrays and objects exist to prevent runtime crashes
      const d = parsed.modules.duty;
      d.categories = d.categories || [];
      d.rules = d.rules || [];
      d.calendarOverrides = d.calendarOverrides || [];
      d.slotConfigs = d.slotConfigs || [];
      d.rosterConfigs = d.rosterConfigs || {};
      d.schedules = d.schedules || [];
      d.rotationState = d.rotationState || {};
      d.savedProfiles = d.savedProfiles || [];
      d.currentProfileName = d.currentProfileName || '默认方案';
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
