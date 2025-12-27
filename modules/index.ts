
import { IconName } from '../platform/ui/basic/Icon';

export interface ModuleDefinition {
  id: string;
  name: string;
  icon: IconName;
  route: string;
  description: string;
  roles?: string[]; // 限制可见角色（废弃，建议未来改用 allowedModules）
}

export const AllModules: ModuleDefinition[] = [
  {
    id: 'duty',
    name: '值班管理',
    icon: 'CalendarClock',
    route: '/duty',
    description: '月度值班安排、在线换班与备勤登记。'
  },
  {
    id: 'menu',
    name: '智慧食堂',
    icon: 'Utensils',
    route: '/menu',
    description: '每日菜谱预览、评价反馈与周度排餐计划。'
  },
  {
    id: 'meeting',
    name: '会议预约',
    icon: 'CalendarDays',
    route: '/meeting',
    description: '在线预约会议室，查看实时占用情况。'
  },
  {
    id: 'meeting-notice',
    name: '会议通知',
    icon: 'Bell',
    route: '/meeting-notice',
    description: '外来通知智能识别、分派与保障任务跟踪。'
  },
  {
    id: 'assets',
    name: '资产台账',
    icon: 'Package',
    route: '/assets',
    description: '固定资产扫码盘点、全生命周期履历追踪。'
  },
  {
    id: 'tools',
    name: '常用工具箱',
    icon: 'Wrench',
    route: '/tools',
    description: 'PDF 处理、CAD 预览等日常办公辅助工具。'
  },
  {
    id: 'system',
    name: '系统设置',
    icon: 'Settings',
    route: '/system',
    description: '用户权限配置、部门管理与底层运行日志。',
    roles: ['super_admin']
  }
];
