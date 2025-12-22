
import React, { useState, useMemo } from 'react';
import { loadDb } from '../../../platform/core/db';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { MeetingNoticeModuleSchema, MeetingNotice } from '../types';

export const DailyBriefReport: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const db = loadDb();
  const noticeData = (db.modules.meetingNotice || { notices: [] }) as MeetingNoticeModuleSchema;
  
  const dailyList = useMemo(() => {
    return noticeData.notices
      .filter(n => n.startTime?.startsWith(selectedDate) && n.status !== 'pending')
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [noticeData.notices, selectedDate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1000px] mx-auto pb-20">
      <header className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm no-print">
         <div className="flex items-center gap-4">
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">选择简报日期:</span>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            />
         </div>
         <Button variant="secondary" onClick={() => window.print()}>
            <Icon name="Printer" size={16} className="mr-2"/> 打印 / 导出 PDF
         </Button>
      </header>

      {/* Formal Government-style Document Preview */}
      <div className="bg-white rounded-sm shadow-2xl border border-slate-200 p-[25mm] print:shadow-none print:border-none print:m-0 print:p-[10mm] min-h-[297mm]">
         <div className="border-b-4 border-rose-600 pb-6 mb-12 text-center">
            <h1 className="text-[32pt] font-serif font-black text-rose-600 tracking-[0.3em] mb-2">会议日程安排表</h1>
            <p className="text-slate-400 font-sans font-bold uppercase tracking-[0.5em] text-[10pt]">Internal Administrative Briefing</p>
         </div>

         <div className="flex justify-between items-end mb-6 font-bold text-slate-900 border-b border-slate-900 pb-2">
            <span>机密·内部传阅</span>
            <span className="text-lg">{selectedDate.replace(/-/g, '年')}月</span>
         </div>

         <table className="w-full border-collapse border-2 border-slate-900 text-[10.5pt]">
            <thead>
               <tr className="bg-slate-50">
                  <th className="border-2 border-slate-900 px-4 py-4 w-24 text-center font-black">时间</th>
                  <th className="border-2 border-slate-900 px-4 py-4 font-black">会议内容 / 主办单位</th>
                  <th className="border-2 border-slate-900 px-4 py-4 w-40 text-center font-black">地点</th>
                  <th className="border-2 border-slate-900 px-4 py-4 w-48 text-center font-black">参会人员</th>
                  <th className="border-2 border-slate-900 px-4 py-4 w-32 text-center font-black">备注保障</th>
               </tr>
            </thead>
            <tbody className="leading-relaxed">
               {dailyList.map(n => (
                 <tr key={n.id} className={n.urgency === 'critical' ? 'bg-rose-50/20' : ''}>
                    <td className="border-2 border-slate-900 px-4 py-5 text-center font-bold">{(n.startTime || '').split(' ')[1] || '---'}</td>
                    <td className="border-2 border-slate-900 px-4 py-5">
                       <div className="font-black text-slate-900 mb-1">{n.title}</div>
                       <div className="text-[9pt] text-slate-500">召集：{n.organizer}</div>
                    </td>
                    <td className="border-2 border-slate-900 px-4 py-5 text-center">{n.location}</td>
                    <td className="border-2 border-slate-900 px-4 py-5 text-center font-bold">{n.attendees?.join('、') || '---'}</td>
                    <td className="border-2 border-slate-900 px-4 py-5 text-center text-[9pt]">
                       <div className="space-y-1">
                          {n.driverNeeded && <span className="inline-block px-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[8pt] mr-1">派车</span>}
                          {n.materialNeeded || '-'}
                       </div>
                    </td>
                 </tr>
               ))}
               {dailyList.length === 0 && (
                 <tr>
                    <td colSpan={5} className="border-2 border-slate-900 px-4 py-32 text-center text-slate-300 italic font-bold">本日暂无已安排会议行程</td>
                 </tr>
               )}
            </tbody>
         </table>

         <div className="mt-16 flex justify-between items-start font-bold">
            <div className="text-[10pt] text-slate-400">
               <p>生成系统：数字化协同平台 v3.0</p>
               <p>打印时间：{new Date().toLocaleString()}</p>
            </div>
            <div className="text-right">
               <p className="mb-4">审签人：________________</p>
               <p className="text-[10pt] text-slate-400">（签字后存档）</p>
            </div>
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; padding: 0 !important; }
          .no-print, nav, aside { display: none !important; }
          main { width: 100% !important; max-width: none !important; padding: 0 !important; }
          @page { size: A4; margin: 10mm; }
        }
      `}} />
    </div>
  );
};
