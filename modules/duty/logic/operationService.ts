import { DBContent } from '../../../platform/core/types';
import { DutyModuleSchema, DutyChangeLog, ChangeType, Schedule } from '../types';

interface OperationParams {
  date: string;
  slotId: number;
  originalUserId: string;
  newUserId: string;
  reason: string;
  operatorId: string;
}

/**
 * Internal helper to update schedules and record logs
 */
const applyDutyChange = (
  db: DBContent,
  params: OperationParams,
  type: ChangeType
): DBContent => {
  const dutyData = db.modules.duty as DutyModuleSchema;
  const { date, slotId, originalUserId, newUserId, reason, operatorId } = params;

  // 1. Update the specific schedule slot
  const updatedSchedules = dutyData.schedules.map((s: Schedule) => {
    if (s.date !== date) return s;
    return {
      ...s,
      slots: s.slots.map(slot => 
        slot.slotId === slotId ? { ...slot, userId: newUserId } : slot
      )
    };
  });

  // 2. Create the change log
  const newLog: DutyChangeLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    date,
    slotId,
    type,
    originalUserId,
    newUserId,
    reason,
    operatorId,
    timestamp: new Date().toISOString()
  };

  // 3. Construct new DB state
  const newDb: DBContent = {
    ...db,
    modules: {
      ...db.modules,
      duty: {
        ...dutyData,
        schedules: updatedSchedules,
        changeLogs: [newLog, ...(dutyData.changeLogs || [])]
      }
    }
  };

  // Log to system as well for top-level auditing
  newDb.logs.push({
    id: `sys_log_${Date.now()}`,
    action: `DUTY_${type.toUpperCase()}`,
    userId: operatorId,
    details: `${originalUserId} replaced by ${newUserId} on ${date} (Slot ${slotId}). Reason: ${reason}`,
    timestamp: new Date().toISOString()
  });

  console.log(`[DutyService] ${type} executed. Notifying stakeholders...`, {
    recipients: [originalUserId, newUserId],
    date,
    reason
  });

  return newDb;
};

/**
 * Swaps two people on a specific shift
 */
export const executeSwap = (db: DBContent, params: OperationParams): DBContent => {
  return applyDutyChange(db, params, 'swap');
};

/**
 * Assigns a standby person to cover a shift
 */
export const executeStandby = (db: DBContent, params: OperationParams): DBContent => {
  return applyDutyChange(db, params, 'standby');
};