import React, { useMemo } from 'react';
import { Icon } from '../../../../platform/ui/basic/Icon';
import { predictNextDutyDates } from '../../logic/predictionService';

interface PredictionCardProps {
  userId: string;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ userId }) => {
  const predictions = useMemo(() => predictNextDutyDates(userId, 3), [userId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
          <Icon name="CrystalBall" size={16} />
        </div>
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">未来值班预估</h4>
      </div>

      {predictions.length > 0 ? (
        <div className="space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
          {predictions.map((date, idx) => (
            <div key={date} className="flex items-start gap-4 relative pl-7 group">
              <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center z-10 group-hover:scale-110 transition-transform shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </div>
              <div className="flex-1 p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-md group-hover:border-indigo-100 transition-all">
                <p className="text-sm font-black text-slate-800 leading-none mb-1">{date}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">预估班次</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-xs font-bold text-slate-400 italic">暂无预估数据</p>
        </div>
      )}
    </div>
  );
};