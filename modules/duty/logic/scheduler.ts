
import { User } from '../../../platform/core/types';
import { DutyConfig, Schedule } from '../types';

export const generateMonthlySchedule = (
  year: number,
  month: number, // 0-11
  users: User[],
  configs: Record<string, DutyConfig>
): Schedule[] => {
  // 1. Get eligible users
  const eligibleUsers = users
    .filter(u => u.isActive && !configs[u.id]?.isExempt)
    .sort((a, b) => (configs[a.id]?.sortOrder || 0) - (configs[b.id]?.sortOrder || 0));

  if (eligibleUsers.length < 2) return [];

  const schedules: Schedule[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let userIndex = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    // Skip weekends (0 is Sunday, 6 is Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const leader = eligibleUsers[userIndex % eligibleUsers.length];
    const member = eligibleUsers[(userIndex + 1) % eligibleUsers.length];

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    schedules.push({
      id: `${dateStr}-${Math.random().toString(36).substr(2, 9)}`,
      date: dateStr,
      leaderId: leader.id,
      memberId: member.id,
      status: 'draft'
    });

    userIndex += 2;
  }

  return schedules;
};
