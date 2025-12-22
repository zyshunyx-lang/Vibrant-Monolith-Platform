
import { loadDb } from '../../../platform/core/db';
import { generateMonthlySchedule } from './scheduler';
import { DutyModuleSchema, RotationState } from '../types';

/**
 * Predicts the next few duty dates for a specific user by simulating future rotations.
 * This does not modify the database.
 */
export const predictNextDutyDates = (userId: string, count: number = 3): string[] => {
  const db = loadDb();
  const dutyData = db.modules.duty as DutyModuleSchema;
  const users = db.sys_config.users;
  
  if (!dutyData.slotConfigs || dutyData.slotConfigs.length === 0) return [];

  // 1. Determine the starting point (Year and Month)
  let startYear: number;
  let startMonth: number;
  let currentSimRotationState: RotationState = { ...(dutyData.rotationState || {}) };

  const publishedSchedules = (dutyData.schedules || [])
    .filter(s => s.status === 'published')
    .sort((a, b) => b.date.localeCompare(a.date));

  if (publishedSchedules.length > 0) {
    // Start from the month following the last published schedule
    const lastDate = new Date(publishedSchedules[0].date);
    startYear = lastDate.getFullYear();
    startMonth = lastDate.getMonth() + 1; // Month is 0-indexed, so +1 moves to next month
    if (startMonth > 11) {
      startMonth = 0;
      startYear += 1;
    }
    // We assume the dutyData.rotationState in DB is already updated to the end of the last published month
  } else {
    // Start from the current month if no schedules exist
    const now = new Date();
    startYear = now.getFullYear();
    startMonth = now.getMonth();
  }

  const predictedDates: string[] = [];
  let simYear = startYear;
  let simMonth = startMonth;
  
  // Safety break to prevent infinite loops (max 24 months simulation)
  let monthsSimulated = 0;

  while (predictedDates.length < count && monthsSimulated < 24) {
    const result = generateMonthlySchedule(simYear, simMonth, users, {
      ...dutyData,
      rotationState: currentSimRotationState
    });

    // Extract dates where the user appears
    result.schedules.forEach(sched => {
      if (predictedDates.length < count) {
        const isScheduled = sched.slots.some(slot => slot.userId === userId);
        if (isScheduled) {
          predictedDates.push(sched.date);
        }
      }
    });

    // Prepare for next month simulation
    currentSimRotationState = result.nextRotationState;
    simMonth++;
    if (simMonth > 11) {
      simMonth = 0;
      simYear++;
    }
    monthsSimulated++;
  }

  return predictedDates;
};
