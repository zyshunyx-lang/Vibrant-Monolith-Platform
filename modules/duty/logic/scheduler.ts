
import { User } from '../../../platform/core/types';
import { DutyModuleSchema, Schedule, RuleType, RotationState, RotationStrategy, DutyRule } from '../types';

/**
 * 策略解析器：根据值班规则和当前日期类型，确定使用的轮询指针轨道 (Track Key)
 */
const getPointerTrack = (catId: string, strategy: RotationStrategy, todayType: RuleType, ruleTypes: RuleType[]): string => {
  if (strategy === 'split_loop') {
    // 逻辑保持一致：如果包含 'deholiday'，则周末也走平日线，仅法定节假日走节假线
    // 否则，周末和法定节假日统一走节假线
    const useHolidayTrack = ruleTypes.includes('deholiday')
      ? todayType === 'holiday'
      : (todayType === 'holiday' || todayType === 'weekend');
      
    return useHolidayTrack ? `${catId}_holiday` : `${catId}_workday`;
  }
  
  // 默认统一循环
  return `${catId}_unified`;
};

/**
 * 参与规则检查器：判断指定分组在当前日期类型下是否应当参与排班
 */
const shouldParticipate = (rule: DutyRule, todayType: RuleType): boolean => {
  const isDeholidayDay = todayType === 'workday' || todayType === 'weekend';
  
  return (
    rule.ruleTypes.includes('ordinary') || 
    rule.ruleTypes.includes(todayType) ||
    (rule.ruleTypes.includes('deholiday') && isDeholidayDay)
  );
};

/**
 * 获取日期类型（工作日、周末、节假日）
 */
const getDateType = (date: Date, overrides: DutyModuleSchema['calendarOverrides']): RuleType => {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const override = overrides.find(o => o.date === dateStr);
  
  if (override) {
    return override.type === 'holiday' ? 'holiday' : 'workday';
  }

  const day = date.getDay();
  if (day === 0 || day === 6) return 'weekend';
  return 'workday';
};

/**
 * 循环选人核心逻辑：从 pool 中找到上一次值班人员后的下一位可用人员
 */
const getNextUser = (
  pool: User[], 
  lastUserId: string | undefined,
  usedToday: Set<string>
): User | null => {
  if (pool.length === 0) return null;
  
  const lastIndex = pool.findIndex(u => u.id === lastUserId);
  
  for (let i = 1; i <= pool.length; i++) {
    const nextIdx = (lastIndex + i) % pool.length;
    const candidate = pool[nextIdx];
    if (!usedToday.has(candidate.id)) {
      return candidate;
    }
  }
  
  return null;
};

/**
 * 重构后的月度排餐引擎
 */
export const generateMonthlySchedule = (
  year: number,
  month: number,
  users: User[],
  dutyData: DutyModuleSchema
): { schedules: Schedule[], nextRotationState: RotationState } => {
  const { rosterConfigs, rules, calendarOverrides, slotConfigs, rotationState } = dutyData;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const schedules: Schedule[] = [];
  
  // 复制一份指针状态，用于生成过程中持续追踪
  const currentRotationState: RotationState = { ...rotationState };

  // 1. 预处理各分类的人员池，并按 sortOrder 排序
  const categoryPools: Record<string, User[]> = {};
  users.forEach(user => {
    const config = rosterConfigs[user.id];
    if (user.isActive && config && !config.isExempt && config.categoryId) {
      if (!categoryPools[config.categoryId]) categoryPools[config.categoryId] = [];
      categoryPools[config.categoryId].push(user);
    }
  });

  Object.keys(categoryPools).forEach(catId => {
    categoryPools[catId].sort((a, b) => (rosterConfigs[a.id]?.sortOrder || 0) - (rosterConfigs[b.id]?.sortOrder || 0));
  });

  // 2. 遍历本月每一天
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const todayType = getDateType(date, calendarOverrides);
    
    const dailySlots: { slotId: number; userId: string }[] = [];
    const usedToday = new Set<string>();

    // 3. 填充当天的每一个席位 (Slot)
    slotConfigs.sort((a, b) => a.id - b.id).forEach(slot => {
      let isSlotFilled = false;

      // 依次检查该席位允许的每一个分组
      for (const catId of slot.allowedCategoryIds) {
        if (isSlotFilled) break;

        const rule = rules.find(r => r.categoryId === catId);
        if (!rule) continue;

        // 策略判断 1: 该分组今天是否排班？
        if (!shouldParticipate(rule, todayType)) continue;

        // 策略判断 2: 获取当前策略下的指针轨道标识 (Unified/Workday/Holiday)
        const trackKey = getPointerTrack(catId, rule.strategy, todayType, rule.ruleTypes);

        // 策略判断 3: 选人并更新指针
        const pool = categoryPools[catId] || [];
        const lastUserId = currentRotationState[trackKey];
        const selected = getNextUser(pool, lastUserId, usedToday);

        if (selected) {
          dailySlots.push({ slotId: slot.id, userId: selected.id });
          usedToday.add(selected.id);
          currentRotationState[trackKey] = selected.id;
          isSlotFilled = true;
        }
      }
    });

    if (dailySlots.length > 0) {
      schedules.push({
        id: `${dateStr}-${Math.random().toString(36).substr(2, 5)}`,
        date: dateStr,
        slots: dailySlots,
        status: 'published' 
      });
    }
  }

  return { schedules, nextRotationState: currentRotationState };
};
