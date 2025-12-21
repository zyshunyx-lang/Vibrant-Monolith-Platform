
export interface DutyConfig {
  userId: string;
  isExempt: boolean;
  sortOrder: number;
}

export interface Schedule {
  id: string;
  date: string; // ISO format: YYYY-MM-DD
  leaderId: string;
  memberId: string;
  status: 'draft' | 'published';
}

export interface DutyModuleSchema {
  rosterConfigs: Record<string, DutyConfig>;
  schedules: Schedule[];
}
