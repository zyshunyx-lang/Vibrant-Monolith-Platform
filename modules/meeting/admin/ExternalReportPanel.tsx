
import React, { useState, useMemo } from 'react';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { ExternalMeeting } from '../types';

interface Props {
  meetings: ExternalMeeting[];
}

export const ExternalReportPanel: React.FC<Props> = ({ meetings }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'stats'>('report');
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const dailyMeetings = useMemo(() => {
    return meetings
      .filter(m => m.startDateTime?.startsWith(selectedDate))
      .sort((a, b) => (a.startDateTime || '').localeCompare(b.startDateTime || ''));
  }, [meetings, selectedDate]);

  const stats = useMemo(() => {
    const attendeeMap: Record<string, number> = {};
    meetings.forEach(m => {
      m.attendees?.forEach(a => {
        attendeeMap[a] = (attendeeMap[a] || 0) + 1;
      });
    });

    const topAttendees = Object.entries(attendeeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      topAttendees,
      totalCount: meetings.length,
      thisMonth: meetings.filter(m => m.startDateTime?.startsWith(new Date().toISOString().slice(0, 7))).length
    };
  }, [meetings]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex gap-4">
        <button onClick={() => setActiveTab('report')} className={`flex items-center gap-2 px-6 py-2 rounded-2xl text-sm font-black transition-all ${activeTab === 'report' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border border-slate-100'}`}>
          <Icon name="FileText" size={16}/> 每日日程报表
        </button>
        <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 px-6 py-2 rounded-2xl text-sm font-black transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border border-slate-100'}`}>
          <Icon name="BarChart3" size={16}/> 参会数据统计
        </button>
      </div>

      {activeTab === 'report' ? (
        <div className="space-y-8">
          <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
             <span className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">选择日期:</span>
             <input 
              type="date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
             />
             <Button variant="secondary" className="ml-auto" onClick={() => window.print()}>
               <Icon name="Printer" size={16} className="mr-2"/> 打印 / 导出 PDF
             </Button>
          </div>

          <div className="bg-white rounded-sm shadow-2xl border border-slate-200 mx-auto max-w-[800px] p-[20mm] print:shadow-none print:border-none print:m-0 print:p-0 min-h-[297mm]">
             <div className="border-b-4 border-rose-600 pb-4 mb-10 text-center space-y-2">
                <h1 className="text-4xl font-serif font-black text-rose-600 tracking-[0.2em]">会议安排日程表</h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Administrative Meeting Schedule</p>
                <p className="text-lg font-black text-slate-900 pt-4">日期：{selectedDate.replace(/-/g, '年')}月</p>
             </div>

             <table className="w-full border-collapse border-2 border-slate-900 text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border-2 border-slate-900 px-4 py-3 font-black text-center w-20">时间</th>
                    <th className="border-2 border-slate-900 px-4 py-3 font-black">会议名称/事项</th>
                    <th className="border-2 border-slate-900 px-4 py-3 font-black w-32">地点</th>
                    <th className="border-2 border-slate-900 px-4 py-3 font-black w-32">参会人员</th>
                    <th className="border-2 border-slate-900 px-4 py-3 font-black w-24">备注</th>
                  </tr>
                </thead>
                <tbody className="font-medium">
                  {dailyMeetings.map(m => (
                    <tr key={m.id}>
                      <td className="border-2 border-slate-900 px-4 py-3 text-center font-bold">{(m.startDateTime || '').split(' ')[1] || '---'}</td>
                      <td className="border-2 border-slate-900 px-4 py-3">
                        <div className="font-black text-slate-900">{m.title}</div>
                        <div className="text-[10px] text-slate-400 mt-1">召集方: {m.organizer}</div>
                      </td>
                      <td className="border-2 border-slate-900 px-4 py-3 text-center">{m.location}</td>
                      <td className="border-2 border-slate-900 px-4 py-3 text-center">{m.attendees?.join('、') || '---'}</td>
                      <td className="border-2 border-slate-900 px-4 py-3 text-slate-400 italic">{m.content || '-'}</td>
                    </tr>
                  ))}
                  {dailyMeetings.length === 0 && (
                    <tr><td colSpan={5} className="border-2 border-slate-900 px-4 py-20 text-center text-slate-300 italic">本日暂无外来会议日程</td></tr>
                  )}
                </tbody>
             </table>

             <div className="mt-12 text-right space-y-1 pr-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generated by Office Admin System</p>
                <p className="text-sm font-bold text-slate-900">打印日期：{new Date().toLocaleString()}</p>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-1 space-y-6">
              <ColorCard variant="white" className="shadow-sm">
                 <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center">
                     <Icon name="Calendar" size={32} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">本月外部会议</p>
                     <p className="text-4xl font-black text-slate-800">{stats.thisMonth} <small className="text-xs font-bold text-slate-300">场</small></p>
                   </div>
                 </div>
              </ColorCard>
              <ColorCard variant="white" className="shadow-sm">
                 <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[24px] flex items-center justify-center">
                     <Icon name="Database" size={32} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">历史累计通知</p>
                     <p className="text-4xl font-black text-slate-800">{stats.totalCount} <small className="text-xs font-bold text-slate-300">份</small></p>
                   </div>
                 </div>
              </ColorCard>
           </div>

           <div className="lg:col-span-2">
              <ColorCard title="参会劳模排行榜 (Top Attendees)" variant="white" className="shadow-sm h-full">
                 <div className="space-y-6">
                    {stats.topAttendees.map(([name, count], idx) => (
                      <div key={name} className="flex items-center gap-4 group">
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                           {idx + 1}
                         </div>
                         <div className="flex-1">
                           <div className="flex justify-between items-end mb-2">
                             <span className="font-black text-slate-800">{name}</span>
                             <span className="text-xs font-bold text-indigo-600">{count} 次参会</span>
                           </div>
                           <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 group-hover:bg-indigo-400 transition-all duration-500" 
                                style={{ width: `${(count / stats.totalCount) * 100}%` }}
                              />
                           </div>
                         </div>
                      </div>
                    ))}
                    {stats.topAttendees.length === 0 && (
                      <div className="py-20 text-center text-slate-300 italic">暂无统计数据</div>
                    )}
                 </div>
              </ColorCard>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print, nav, aside, header, .bg-slate-50 { display: none !important; }
          body { background: white !important; }
          .print-area { display: block !important; position: absolute; left: 0; top: 0; }
        }
      `}} />
    </div>
  );
};
