import React from 'react';
import { PredictionCard } from './personal/PredictionCard';
import { StatsCard } from './personal/StatsCard';
import { SwapRequestCard } from './personal/SwapRequestCard';
import { getCurrentUser } from '../../../platform/core/db';
import { Icon } from '../../../platform/ui/basic/Icon';

export const PersonalDashboard: React.FC = () => {
  const user = getCurrentUser();
  const currentUserId = user?.id || "1";

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-10">
        <header className="pb-4 border-b border-slate-50">
           <h3 className="text-lg font-black text-slate-900 tracking-tight">个人值班中心</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Personal Workspace</p>
        </header>

        <StatsCard userId={currentUserId} />
        
        <PredictionCard userId={currentUserId} />
        
        <SwapRequestCard />
        
        <footer className="pt-8 text-center mt-auto">
           <div className="p-4 rounded-2xl bg-indigo-600 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">值班守则</p>
                <p className="text-xs font-bold leading-relaxed">认真负责，严守岗位。<br/>发现异常，及时上报。</p>
              </div>
              <Icon name="ShieldCheck" size={64} className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 transition-transform" />
           </div>
        </footer>
      </div>
    </div>
  );
};