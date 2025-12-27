
import { DBContent, User, ModuleId } from './types';

const DB_KEY = 'MODULAR_MONOLITH_DB';

// 系统目前定义的所有模块 ID
const ALL_MODULE_IDS: ModuleId[] = ['duty', 'menu', 'meeting', 'assets', 'system', 'tools', 'meeting-notice'];

/**
 * 初始数据库结构
 * 当用户首次访问或数据库损坏时作为 fallback
 */
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
        isActive: true,
        allowedModules: [...ALL_MODULE_IDS] // 初始管理员拥有全权限
      }
    ],
    departments: ['管理部', '技术部', '财务部', '人事部'],
    broadcasts: [
      { 
        id: 'b1', 
        message: '系统权限架构已升级，支持模块级权限管控。', 
        level: 'info', 
        isActive: true, 
        createdAt: new Date().toISOString().split('T')[0]
      }
    ],
    enabledModules: [...ALL_MODULE_IDS] // 初始全局开启所有模块
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
      changeLogs: [],
      savedProfiles: [],
      currentProfileName: '默认方案'
    },
    menu: {
      currentConfig: {
        enableImages: true,
        enableRating: true,
        ratingScope: 'month',
        meals: [
          {
            id: 'meal_lunch',
            name: '午餐',
            slots: [
              { id: 's1', name: '硬菜', tags: ['主荤'] },
              { id: 's2', name: '副荤', tags: ['肉菜'] },
              { id: 's3', name: '蔬菜', tags: ['蔬菜'] },
              { id: 's4', name: '主食', tags: ['米面'] },
            ]
          }
        ]
      },
      savedProfiles: [],
      currentProfileName: '标准午餐方案',
      dishes: [],
      schedules: [],
      dishStats: {}
    },
    assets: {
      categories: [
        { id: 'cat_pc', name: '笔记本电脑', code: 'PC' },
        { id: 'cat_mon', name: '显示器', code: 'MON' }
      ],
      locations: [
        { id: 'loc_wh', name: 'A栋-仓库', building: 'A栋', floor: '1' }
      ],
      providers: [],
      departments: [],
      assets: [],
      logs: [],
      auditTasks: [],
      auditRecords: [],
      codeRule: {
        prefix: 'ZC',
        includeDate: true,
        dateFormat: 'YYYY',
        seqDigits: 4,
        currentSeq: 0,
        separator: '-'
      }
    },
    meeting: {
      rooms: [
        {
          id: 'room_1',
          name: '1号大会议室',
          capacity: 30,
          location: '行政楼 3F-302',
          facilities: ['Projector', 'VideoConf', 'AudioSystem'],
          status: 'active',
          needApproval: true,
          imageUrl: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=400'
        }
      ],
      bookings: [],
      externalMeetings: []
    },
    meetingNotice: {
      notices: []
    }
  }
};

/**
 * 递归合并两个对象，用于数据 Schema 升级
 */
const deepMerge = (target: any, source: any): any => {
  if (target === undefined || target === null) return source;
  if (typeof target !== 'object' || typeof source !== 'object' || Array.isArray(target) || Array.isArray(source)) {
    return target;
  }

  const result = { ...target };
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (!(key in target)) {
        result[key] = source[key];
      } else if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key], source[key]);
      }
    }
  }
  return result;
};

/**
 * 运行时结构校验
 */
const validateDbStructure = (data: any): boolean => {
  return (
    data &&
    typeof data === 'object' &&
    data.sys_config &&
    data.modules &&
    Array.isArray(data.sys_config.users)
  );
};

export const loadDb = (): DBContent => {
  const rawData = localStorage.getItem(DB_KEY);
  
  if (!rawData) {
    saveDb(INITIAL_DATA);
    return INITIAL_DATA;
  }

  try {
    const parsed = JSON.parse(rawData);

    if (!validateDbStructure(parsed)) {
      throw new Error("Invalid structure: Critical keys missing.");
    }

    // --- 数据迁移/修复逻辑 (Migration logic for Permissions) ---
    
    // 1. 确保全局开启模块列表存在 (如果旧数据没有该字段，默认开启所有)
    if (parsed.sys_config && !parsed.sys_config.enabledModules) {
      parsed.sys_config.enabledModules = [...ALL_MODULE_IDS];
    }

    // 2. 确保所有存量用户都有权限字段 (存量用户默认获得全权限以平滑过渡)
    if (parsed.sys_config.users) {
      parsed.sys_config.users = parsed.sys_config.users.map((u: any) => ({
        ...u,
        allowedModules: u.allowedModules || [...ALL_MODULE_IDS]
      }));
    }

    // 3. 智能迁移与兼容层：深度合并以补齐新增加的模块字段
    const migratedData = deepMerge(parsed, INITIAL_DATA) as DBContent;
    
    return migratedData;
  } catch (e) {
    const timestamp = Date.now();
    const backupKey = `${DB_KEY}_BACKUP_${timestamp}`;
    console.error(`[DB Service] Corrupted. Backing up and resetting.`, e);
    
    localStorage.setItem(backupKey, rawData);
    saveDb(INITIAL_DATA);
    
    return INITIAL_DATA;
  }
};

export const saveDb = (newDb: DBContent): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(newDb));
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem('APP_SESSION');
  if (session) {
    try {
      const u = JSON.parse(session);
      // 这里的 session 数据也需要检查权限字段，防止登录后不刷新导致没权限
      if (!u.allowedModules) u.allowedModules = [...ALL_MODULE_IDS];
      return u;
    } catch {
      return null;
    }
  }
  return null;
};
