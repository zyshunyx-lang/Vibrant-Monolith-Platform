
import { User } from '../../../platform/core/types';
import { DutyModuleSchema, Schedule, RuleType, RotationState, RotationStrategy } from '../types';

/**
 * Helper to determine date type
 */
const getDateType = (date: Date, overrides: DutyModuleSchema['calendarOverrides']): RuleType => {
  const dateStr = date.toISOString().split('T')[0];
  const override = overrides.find(o => o.date === dateStr);
  
  if (override) {
    return override.type === 'holiday' ? 'holiday' : 'workday';
  }

  const day = date.getDay();
  if (day === 0 || day === 6) return 'weekend';
  return 'workday';
};

/**
 * Get the next user in a sorted loop
 */
const getNextUser = (
  pool: User[], 
  lastUserId: string | undefined,
  usedToday: Set<string>
): User | null => {
  if (pool.length === 0) return null;
  
  // Find index of last user in the FULL pool (to maintain loop integrity)
  const lastIndex = pool.findIndex(u => u.id === lastUserId);
  
  // Search for the next available user starting from lastIndex + 1
  for (let i = 1; i <= pool.length; i++) {
    const nextIdx = (lastIndex + i) % pool.length;
    const candidate = pool[nextIdx];
    
    // Check if this candidate is usable today
    if (!usedToday.has(candidate.id)) {
      return candidate;
    }
  }
  
  return null;
};

export const generateMonthlySchedule = (
  year: number,
  month: number,
  users: User[],
  dutyData: DutyModuleSchema
): { schedules: Schedule[], nextRotationState: RotationState } => {
  const { rosterConfigs, rules, calendarOverrides, slotConfigs, rotationState } = dutyData;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const schedules: Schedule[] = [];
  
  // Create a mutable copy of the rotation state to track pointers during generation
  const currentRotationState = { ...rotationState };

  // 1. Prepare candidate pools by Category, sorted by sortOrder
  const categoryPools: Record<string, User[]> = {};
  users.forEach(user => {
    const config = rosterConfigs[user.id];
    // Must be Active, Not Exempt, and have a Category
    if (user.isActive && config && !config.isExempt && config.categoryId) {
      if (!categoryPools[config.categoryId]) categoryPools[config.categoryId] = [];
      categoryPools[config.categoryId].push(user);
    }
  });

  // Sort each pool by defined sortOrder
  Object.keys(categoryPools).forEach(catId => {
    categoryPools[catId].sort((a, b) => {
      const orderA = rosterConfigs[a.id]?.sortOrder || 0;
      const orderB = rosterConfigs[b.id]?.sortOrder || 0;
      return orderA - orderB;
    });
  });

  // 2. Iterate through each day of the target month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().split('T')[0];
    const todayType = getDateType(date, calendarOverrides);
    const isHolidayOrWeekend = todayType === 'holiday' || todayType === 'weekend';
    
    const dailySlots: { slotId: number; userId: string }[] = [];
    const usedToday = new Set<string>();

    // 3. Process each Slot in order
    slotConfigs.sort((a, b) => a.id - b.id).forEach(slot => {
      let slotFilled = false;

      // Check each allowed category for this slot
      for (const catId of slot.allowedCategoryIds) {
        if (slotFilled) break;

        const rule = rules.find(r => r.categoryId === catId);
        if (!rule) continue;

        // Check if category participates on this type of day
        const participatesToday = rule.ruleTypes.includes('ordinary') || rule.ruleTypes.includes(todayType);
        if (!participatesToday) continue;

        // Determine Strategy and Pointer Track
        const strategy: RotationStrategy = rule.strategy || 'unified_loop';
        let trackKey = `${catId}_unified`;
        
        if (strategy === 'split_loop') {
          trackKey = isHolidayOrWeekend ? `${catId}_holiday` : `${catId}_workday`;
        }

        // Find candidate in pool
        const pool = categoryPools[catId] || [];
        const lastUserId = currentRotationState[trackKey];
        const selected = getNextUser(pool, lastUserId, usedToday);

        if (selected) {
          dailySlots.push({ slotId: slot.id, userId: selected.id });
          usedToday.add(selected.id);
          // Update pointer track
          currentRotationState[trackKey] = selected.id;
          slotFilled = true;
        }
      }
    });

    if (dailySlots.length > 0) {
      schedules.push({
        id: `${dateStr}-${Math.random().toString(36).substr(2, 5)}`,
        date: dateStr,
        slots: dailySlots,
        status: 'draft'
      });
    }
  }

  return { schedules, nextRotationState: currentRotationState };
};
