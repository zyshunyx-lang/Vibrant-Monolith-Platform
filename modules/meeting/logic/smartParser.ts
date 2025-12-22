
import { ExternalMeeting } from '../types';

/**
 * Simulates AI info extraction using sophisticated regex patterns
 * tailored for Chinese administrative notifications.
 */
export const parseMeetingText = (text: string): Partial<ExternalMeeting> => {
  const result: Partial<ExternalMeeting> = {
    sourceText: text,
    status: 'pending'
  };

  // 1. Extract Title (Usually at the beginning or after "关于")
  const titleMatch = text.match(/(?:关于)?(.*?会议)(?:的通知)?/);
  if (titleMatch) result.title = titleMatch[1];

  // 2. Extract Date (Matches 2024-10-20, 2024年10月20日, etc.)
  const dateMatch = text.match(/(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)/);
  const timeMatch = text.match(/(\d{1,2}:\d{2})/);
  
  if (dateMatch) {
    let dateStr = dateMatch[1].replace(/[年月]/g, '-').replace('日', '');
    // Standardize to YYYY-MM-DD
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      const timeStr = timeMatch ? timeMatch[1] : '09:00';
      result.startDateTime = `${y}-${m}-${d} ${timeStr}`;
    }
  }

  // 3. Extract Location (Matches strings ending in 室, 楼, 厅, 中心)
  const locMatch = text.match(/地点[：: ]?([^，。\n]*?[室楼厅中心])/);
  if (locMatch) result.location = locMatch[1].trim();

  // 4. Extract Contact (Matches phone numbers or names after "联系")
  const phoneMatch = text.match(/(1[3-9]\d{9}|0\d{2,3}-\d{7,8})/);
  const contactMatch = text.match(/联系人[：: ]?([\u4e00-\u9fa5]{2,4})/);
  
  if (phoneMatch || contactMatch) {
    result.contactInfo = `${contactMatch ? contactMatch[1] : ''} ${phoneMatch ? phoneMatch[0] : ''}`.trim();
  }

  // 5. Extract Organizer (Matches after "由" or "召集人")
  const orgMatch = text.match(/(?:由|主办单位为|召集人[：: ])([\u4e00-\u9fa5]+)/);
  if (orgMatch) result.organizer = orgMatch[1];

  return result;
};
