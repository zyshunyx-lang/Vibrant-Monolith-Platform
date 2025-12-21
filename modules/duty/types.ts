
export type RuleType = 'ordinary' | 'holiday' | 'weekend' | 'workday';

export type RotationStrategy = 'unified_loop' | 'split_loop';

export interface DutyCategory {
  id: string;
  name: string;
  description: string;
}

export interface DutyRule {
  id: string;
  categoryId: string;
  ruleTypes: RuleType[]; 
  strategy: RotationStrategy;
}

export interface CalendarOverride {
  date: string; // YYYY-MM-DD
  type: 'holiday' | 'workday_override';
  name: string;
}

export interface SlotConfig {
  id: number;
  name: string;
  allowedCategoryIds: string[];
}

export interface DutyConfig {
  userId: string;
  categoryId: string;
  isExempt: boolean;
  sortOrder: number;
}

export interface Schedule {
  id: string;
  date: string;
  slots: {
    slotId: number;
    userId: string;
  }[];
  status: 'draft' | 'published';
}

// Key format: "categoryId_trackName" -> lastUserId
export type RotationState = Record<string, string>;

export interface DutyConfigProfile {
  id: string;
  name: string;
  categories: DutyCategory[];
  rules: DutyRule[];
  slotConfigs: SlotConfig[];
  rosterConfigs: Record<string, DutyConfig>;
}

export interface DutyModuleSchema {
  categories: DutyCategory[];
  rules: DutyRule[];
  calendarOverrides: CalendarOverride[];
  slotConfigs: SlotConfig[];
  rosterConfigs: Record<string, DutyConfig>;
  schedules: Schedule[];
  rotationState: RotationState;
  // Profile Management
  savedProfiles: DutyConfigProfile[];
  currentProfileName: string;
}
