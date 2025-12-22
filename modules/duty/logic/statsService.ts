
import { loadDb } from '../../../platform/core/db';
import { DutyModuleSchema, Schedule } from '../types';

export interface UserDutyStats {
  total: number;
  weekend: number;
  holiday: number;
  workday: number;
  history: string[]; // Last 5 dates
}

/**
 * Helper to check date type for statistical categorization
 */
const getDateCategory = (dateStr: string, overrides: DutyModuleSchema['calendarOverrides']): 'workday' | 'weekend' | 'holiday' => {
  const date = new Date(dateStr);
  const override = overrides?.find(o => o.date === dateStr);
  
  if (override) {
    return override.type === 'holiday' ? 'holiday' : 'workday';
  }

  const day = date.getDay();
  if (day === 0 || day === 6) return 'weekend';
  return 'workday';
};

/**
 * Calculates historical duty statistics for a specific user.
 */
export const getUserDutyStats = (userId: string): UserDutyStats => {
  const db = loadDb();
  const dutyData = db.modules.duty as DutyModuleSchema;
  const publishedSchedules = (dutyData.schedules || [])
    .filter(s => s.status === 'published')
    .sort((a, b) => b.date.localeCompare(a.date));

  const stats: UserDutyStats = {
    total: 0,
    weekend: 0,
    holiday: 0,
    workday: 0,
    history: []
  };

  publishedSchedules.forEach(schedule => {
    const userSlot = schedule.slots.find(slot => slot.userId === userId);
    
    if (userSlot) {
      stats.total++;
      
      const category = getDateCategory(schedule.date, dutyData.calendarOverrides);
      if (category === 'holiday') stats.holiday++;
      else if (category === 'weekend') stats.weekend++;
      else stats.workday++;

      if (stats.history.length < 5) {
        stats.history.push(schedule.date);
      }
    }
  });

  return stats;
};
