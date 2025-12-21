
import React from 'react';
import { Button } from '../basic/Button';
import { Icon } from '../basic/Icon';

interface CalendarGridProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  renderCell: (date: Date, dateStr: string) => React.ReactNode;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate, onMonthChange, renderCell }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => onMonthChange(new Date(year, month - 1, 1));
  const nextMonth = () => onMonthChange(new Date(year, month + 1, 1));

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate days for the grid
  const days: (Date | null)[] = [];
  
  // Padding for start
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  
  // Real days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const monthYearStr = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{monthYearStr}</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={prevMonth}>
            <Icon name="ChevronLeft" size={20} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onMonthChange(new Date())}>
            Today
          </Button>
          <Button variant="secondary" size="sm" onClick={nextMonth}>
            <Icon name="ChevronRight" size={20} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-3xl overflow-hidden shadow-inner">
        {dayNames.map(day => (
          <div key={day} className="bg-slate-50 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
        {days.map((date, idx) => {
          let dateStr = '';
          if (date) {
            dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          }

          return (
            <div 
              key={idx} 
              className={`min-h-[140px] p-2 bg-white flex flex-col transition-colors hover:bg-slate-50/50 ${!date ? 'bg-slate-50/50' : ''}`}
            >
              {date && (
                <>
                  <div className="text-right">
                    <span className={`
                      inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                      ${date.toDateString() === new Date().toDateString() ? 'bg-indigo-600 text-white' : 'text-slate-400'}
                    `}>
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="mt-1 flex-1">
                    {renderCell(date, dateStr)}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
