
import React, { useMemo, memo } from 'react';
import { Button } from '../basic/Button';
import { Icon } from '../basic/Icon';

interface CalendarGridProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  renderCell: (date: Date, dateStr: string) => React.ReactNode;
}

/**
 * 提取单元格为独立 Memo 组件，防止父组件局部状态更新导致整个日历重绘
 */
const CalendarCell = memo(({ 
  date, 
  renderCell 
}: { 
  date: Date | null; 
  renderCell: (date: Date, dateStr: string) => React.ReactNode;
}) => {
  const isToday = useMemo(() => {
    if (!date) return false;
    const now = new Date();
    return date.getDate() === now.getDate() && 
           date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear();
  }, [date]);

  const dateStr = useMemo(() => {
    if (!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, [date]);

  return (
    <div className={`min-h-[140px] p-2 bg-white flex flex-col transition-colors hover:bg-slate-50/50 ${!date ? 'bg-slate-50/50' : ''}`}>
      {date && (
        <>
          <div className="text-right mb-1">
            <span className={`
              inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-black transition-all
              ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-300'}
            `}>
              {date.getDate()}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            {renderCell(date, dateStr)}
          </div>
        </>
      )}
    </div>
  );
});

CalendarCell.displayName = 'CalendarCell';

export const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate, onMonthChange, renderCell }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  /**
   * 性能优化：缓存月度日期分布计算
   */
  const days = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const result: (Date | null)[] = [];
    // 填充月初空白
    for (let i = 0; i < firstDayOfMonth; i++) {
      result.push(null);
    }
    // 填充日期对象
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(new Date(year, month, i));
    }
    return result;
  }, [year, month]);

  const prevMonth = () => onMonthChange(new Date(year, month - 1, 1));
  const nextMonth = () => onMonthChange(new Date(year, month + 1, 1));
  const goToday = () => onMonthChange(new Date());

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const monthYearDisplay = `${year}年 ${month + 1}月`;

  return (
    <div className="flex flex-col gap-6">
      {/* 头部控制栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{monthYearDisplay}</h2>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
          <Button variant="ghost" size="sm" onClick={prevMonth} className="!p-1.5 hover:bg-white rounded-xl text-slate-500">
            <Icon name="ChevronLeft" size={20} />
          </Button>
          <button 
            onClick={goToday}
            className="px-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors"
          >
            今天
          </button>
          <Button variant="ghost" size="sm" onClick={nextMonth} className="!p-1.5 hover:bg-white rounded-xl text-slate-500">
            <Icon name="ChevronRight" size={20} />
          </Button>
        </div>
      </div>

      {/* 网格主体 */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-[32px] overflow-hidden shadow-inner">
        {/* 星期表头 */}
        {dayNames.map(day => (
          <div 
            key={day} 
            className={`bg-slate-50/80 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] 
              ${day === '周六' || day === '周日' ? 'text-rose-400' : 'text-slate-400'}
            `}
          >
            {day}
          </div>
        ))}
        
        {/* 日期单元格 */}
        {days.map((date, idx) => (
          <CalendarCell 
            key={date ? date.getTime() : `empty-${idx}`} 
            date={date} 
            renderCell={renderCell} 
          />
        ))}
      </div>
    </div>
  );
};
