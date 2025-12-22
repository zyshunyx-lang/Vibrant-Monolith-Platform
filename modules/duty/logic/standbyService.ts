import { User } from '../../../platform/core/types';
import { DutyModuleSchema } from '../types';

/**
 * Recommends 4 candidates for standby based on the next people in the rotation sequence.
 * This helps administrators pick valid replacements without disrupting the fair loop.
 */
export const getStandbyCandidates = (
  targetDateStr: string,
  categoryId: string,
  dutyData: DutyModuleSchema,
  allUsers: User[]
): User[] => {
  const { rosterConfigs, schedules } = dutyData;
  
  // 1. Get and sort current pool for this category
  const pool = allUsers
    .filter(u => u.isActive && rosterConfigs[u.id]?.categoryId === categoryId && !rosterConfigs[u.id]?.isExempt)
    .sort((a, b) => (rosterConfigs[a.id]?.sortOrder || 0) - (rosterConfigs[b.id]?.sortOrder || 0));

  if (pool.length === 0) return [];

  // 2. Identify the reference point (Last person scheduled in the current month for this category)
  const [year, month] = targetDateStr.split('-').map(Number);
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  
  const monthSchedules = (schedules || [])
    .filter(s => s.date.startsWith(monthPrefix))
    .sort((a, b) => b.date.localeCompare(a.date)); // Newest first

  let lastScheduledUserId: string | null = null;

  for (const sched of monthSchedules) {
    for (const slot of sched.slots) {
      const isUserInCategory = rosterConfigs[slot.userId]?.categoryId === categoryId;
      if (isUserInCategory) {
        lastScheduledUserId = slot.userId;
        break;
      }
    }
    if (lastScheduledUserId) break;
  }

  // 3. Find index of reference user in sorted pool
  let startIndex = 0;
  if (lastScheduledUserId) {
    const idx = pool.findIndex(u => u.id === lastScheduledUserId);
    if (idx !== -1) {
      startIndex = (idx + 1) % pool.length;
    }
  }

  // 4. Pick 4 candidates following the loop
  const candidates: User[] = [];
  const limit = Math.min(4, pool.length);
  
  for (let i = 0; i < limit; i++) {
    const candidateIdx = (startIndex + i) % pool.length;
    candidates.push(pool[candidateIdx]);
  }

  return candidates;
};