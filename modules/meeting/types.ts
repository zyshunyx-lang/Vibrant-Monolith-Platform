
export type MeetingRoomStatus = 'active' | 'maintenance';
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  location: string;
  facilities: string[]; 
  status: MeetingRoomStatus;
  imageUrl?: string;
  needApproval: boolean;
}

export interface MeetingBooking {
  id: string;
  roomId: string;
  userId: string;
  subject: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: BookingStatus;
  description?: string;
  createdAt: string;
}

export interface ExternalMeeting {
  id: string;
  title: string;       // 会议名称
  organizer: string;   // 主办单位/召集人
  location: string;    // 会议地点
  startDateTime: string; // YYYY-MM-DD HH:mm
  endDateTime?: string;  // 结束时间 (可选)
  content: string;     // 会议事项/内容摘要
  contactInfo: string; // 联系人及电话
  attendees: string[]; // 参会人员/部门
  status: 'pending' | 'processing' | 'reported' | 'closed'; 
  sourceText?: string; // 原始通知文本
  createdAt: number;
}

export interface MeetingModuleSchema {
  rooms: MeetingRoom[];
  bookings: MeetingBooking[];
  externalMeetings: ExternalMeeting[];
}
