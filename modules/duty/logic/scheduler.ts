
import { User } from '../../../platform/core/types';
import { DutyModuleSchema, Schedule, RuleType } from '../types';

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

export const generateMonthlySchedule = (
  year: number,
  month: number,
  users: User[],
  dutyData: DutyModuleSchema
): Schedule[] => {
  const { rosterConfigs, categories, rules, calendarOverrides, slotConfigs } = dutyData;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const schedules: Schedule[] = [];

  // 1. Prepare candidate pools for each category
  // Tracks how many times each user has worked this month to ensure fairness
  const userStats: Record<string, { count: number; lastDate: number }> = {};
  users.forEach(u => {
    userStats[u.id] = { count: 0, lastDate: -100 }; // Initialize with "long ago"
  });

  // 2. Iterate through each day
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().split('T')[0];
    const todayType = getDateType(date, calendarOverrides);
    
    const dailySlots: { slotId: number; userId: string }[] = [];
    const usedToday = new Set<string>();

    // 3. For each configured slot
    slotConfigs.sort((a, b) => a.id - b.id).forEach(slot => {
      // Find eligible candidates for this slot on this specific day
      const candidates = users.filter(user => {
        const config = rosterConfigs[user.id];
        if (!config || config.isExempt || !user.isActive || usedToday.has(user.id)) return false;
        
        // Check if user belongs to one of the allowed categories for this slot
        if (!slot.allowedCategoryIds.includes(config.categoryId)) return false;

        // Check if category has a rule that matches today's type
        const categoryRules = rules.find(r => r.categoryId === config.categoryId);
        if (!categoryRules) return false;

        return categoryRules.ruleTypes.includes('ordinary') || categoryRules.ruleTypes.includes(todayType);
      });

      if (candidates.length > 0) {
        // Fairness sorting: Prioritize those with fewest shifts and longest rest
        candidates.sort((a, b) => {
          const statsA = userStats[a.id];
          const statsB = userStats[b.id];
          if (statsA.count !== statsB.count) return statsA.count - statsB.count;
          return statsA.lastDate - statsB.lastDate;
        });

        const selected = candidates[0];
        dailySlots.push({ slotId: slot.id, userId: selected.id });
        usedToday.add(selected.id);
        
        // Update stats
        userStats[selected.id].count++;
        userStats[selected.id].lastDate = d;
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

  return schedules;
};
