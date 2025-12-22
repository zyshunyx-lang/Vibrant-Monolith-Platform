
export type UrgencyLevel = 'normal' | 'urgent' | 'critical';
export type NoticeStatus = 'pending' | 'assigned' | 'archived';

export interface MeetingNotice {
  id: string;
  sourceFileUrl?: string; // Original document link
  
  // --- Extracted Data ---
  title: string;
  organizer: string;
  location: string;
  startTime: string; // YYYY-MM-DD HH:mm
  endTime?: string;
  contactPerson?: string;
  contactPhone?: string;
  contentSummary: string;
  
  // --- Dispatch Data ---
  urgency: UrgencyLevel;
  attendees: string[];    // Target personnel/depts
  driverNeeded: boolean;  // Vehicle request
  materialNeeded: string; // Special notes (e.g. "Bring official seal")
  
  status: NoticeStatus;
  createdAt: number;
}

export interface MeetingNoticeModuleSchema {
  notices: MeetingNotice[];
}
