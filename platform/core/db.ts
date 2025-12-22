
import { DBContent, User } from './types';

const DB_KEY = 'MODULAR_MONOLITH_DB';

const today = new Date().toISOString().split('T')[0];

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
    departments: ['管理部', '技术部', '财务部', '人事部'],
    broadcasts: [
      { 
        id: 'b1', 
        message: '系统将于本周五晚 23:00 进行例行维护，请提前保存工作。', 
        level: 'warning', 
        isActive: true, 
        createdAt: '2023-12-01' 
      }
    ]
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
        },
        {
          id: 'room_2',
          name: '洽谈室 A',
          capacity: 6,
          location: '办公楼 2F-205',
          facilities: ['Whiteboard', 'Coffee'],
          status: 'active',
          needApproval: false,
          imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=400'
        },
        {
          id: 'room_3',
          name: '多功能培训教室',
          capacity: 50,
          location: '实验楼 1F-101',
          facilities: ['Projector', 'AudioSystem', 'Mic'],
          status: 'active',
          needApproval: true,
          imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400'
        }
      ],
      bookings: [
        {
          id: 'book_1',
          roomId: 'room_1',
          userId: '1',
          subject: '年度战略规划会议',
          date: today,
          startTime: '09:00',
          endTime: '11:30',
          status: 'confirmed',
          createdAt: new Date().toISOString()
        }
      ],
      externalMeetings: []
    },
    // Fix: Added meetingNotice to INITIAL_DATA to support the new module
    meetingNotice: {
      notices: []
    }
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
    
    // Safety checks for existing modules...
    if (!parsed.modules.meeting) parsed.modules.meeting = { ...INITIAL_DATA.modules.meeting };
    parsed.modules.meeting.rooms = parsed.modules.meeting.rooms || [];
    parsed.modules.meeting.bookings = parsed.modules.meeting.bookings || [];
    parsed.modules.meeting.externalMeetings = parsed.modules.meeting.externalMeetings || [];

    // Fix: Added safety check for meetingNotice property and nested notices array to prevent runtime crashes on legacy databases.
    if (!parsed.modules.meetingNotice) parsed.modules.meetingNotice = { ...INITIAL_DATA.modules.meetingNotice };
    parsed.modules.meetingNotice.notices = parsed.modules.meetingNotice.notices || [];

    return parsed;
  } catch (e) {
    console.error("Database corruption detected.", e);
    return INITIAL_DATA;
  }
};

export const saveDb = (newDb: DBContent): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(newDb));
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem('APP_SESSION');
  if (session) return JSON.parse(session);
  const db = loadDb();
  return db.sys_config.users.find(u => u.username === 'admin') || null;
};
