
export type RuleType = 'ordinary' | 'holiday' | 'weekend' | 'workday';

export interface DutyCategory {
  id: string;
  name: string;
  description: string;
}

export interface DutyRule {
  id: string;
  categoryId: string;
  ruleTypes: RuleType[]; // A category can have multiple rules (e.g., both weekend and holiday)
}

export interface CalendarOverride {
  date: string; // YYYY-MM-DD
  type: 'holiday' | 'workday_override';
  name: string;
}

export interface SlotConfig {
  id: number; // Slot index: 1, 2, 3...
  name: string; // e.g., "Leader on Duty", "Staff 1"
  allowedCategoryIds: string[]; // Which categories can fill this slot
}

export interface DutyConfig {
  userId: string;
  categoryId: string; // Users are now assigned to a category
  isExempt: boolean;
  sortOrder: number;
}

export interface Schedule {
  id: string;
  date: string; // ISO format: YYYY-MM-DD
  slots: {
    slotId: number;
    userId: string;
  }[];
  status: 'draft' | 'published';
}

export interface DutyModuleSchema {
  categories: DutyCategory[];
  rules: DutyRule[];
  calendarOverrides: CalendarOverride[];
  slotConfigs: SlotConfig[];
  rosterConfigs: Record<string, DutyConfig>;
  schedules: Schedule[];
}
