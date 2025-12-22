
import React, { useState, useMemo, useEffect } from 'react';
import { loadDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Grid } from '../../../platform/ui/layout/Grid';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { Button } from '../../../platform/ui/basic/Button';
import { castVote, getAggregatedStats } from '../logic/voteService';
// Fix: WeeklySchedule was removed/renamed to DailyMenu in types.ts
import { MenuModuleSchema, Dish, DailyMenu } from '../types';

export const MenuView: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [ratingScope, setRatingScope] = useState<'all' | 'year' | 'month'>('all');
  const [activeTab, setActiveTab] = useState<'today' | 'leaderboard'>('today');
  
  useEffect(() => {
    const handleFocus = () => setDb(loadDb());
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const menuData = db.modules.menu as MenuModuleSchema;
  const config = menuData.currentConfig;
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  const getWeekId = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
  };

  // Fix: Directly find the published DailyMenu for today
  const todaySchedule = useMemo(() => {
    return (menuData.schedules || []).find(s => s.date === dateStr && s.status === 'published') || null;
  }, [menuData.schedules, dateStr]);

  const handleVote = (dishId: string, type: 'like' | 'dislike') => {
    castVote(dishId, type, dateStr);
    setDb(loadDb()); // Refresh local view
  };

  // Ranking Logic
  const rankings = useMemo(() => {
    const dishes = menuData.dishes || [];
    const stats = menuData.dishStats || {};
    
    const aggregated = dishes.map(dish => ({
      ...dish,
      ...getAggregatedStats(dish.id, ratingScope, stats)
    }));
    
    const sorted = aggregated.sort((a, b) => b.score - a.score);
    return {
      top: sorted.slice(0, 5).filter(d => d.score > 0),
      bottom: [...sorted].reverse().slice(0, 5).filter(d => d.score < 0)
    };
  }, [menuData, ratingScope]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            美味食堂
            <Icon name="Utensils" className="text-orange-500" size={32} />
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            发现每日惊喜，为您的最爱投上一票。今日日期：{dateStr}
          </p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner self-start">
          <button 
            onClick={() => setActiveTab('today')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'today' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
          >
            今日菜单
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'leaderboard' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
          >
            红黑榜
          </button>
        </div>
      </header>

      {activeTab === 'today' ? (
        <div className="space-y-8">
          {todaySchedule ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {config.meals.map(meal => {
                // Fix: Access assignments from the DailyMenu object
                const mealSelection = todaySchedule.assignments[meal.id];
                if (!mealSelection) return null;
                
                return (
                  <ColorCard 
                    key={meal.id} 
                    variant="white" 
                    title={
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                          <Icon name={meal.name.includes('午') ? 'Sun' : 'Moon'} size={20} />
                        </div>
                        {meal.name}
                      </div>
                    }
                  >
                    <div className="space-y-4">
                      {meal.slots.map((slot, idx) => {
                        const dishId = mealSelection[idx];
                        const dish = menuData.dishes.find(d => d.id === dishId);
                        
                        return (
                          <div key={slot.id} className="group relative flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:border-orange-100 transition-all">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm overflow-hidden">
                              {dish?.imageUrl ? (
                                <img src={dish.imageUrl} className="w-full h-full object-cover" />
                              ) : (
                                <Icon name="Soup" className="text-slate-200" size={32} />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{slot.name}</p>
                              <h4 className="text-lg font-black text-slate-800 truncate">{dish?.name || '未排餐'}</h4>
                              <div className="flex gap-1 mt-1">
                                {dish?.tags.map(t => (
                                  <Badge key={t} className="text-[9px] py-0 px-1 bg-white text-slate-400 border-slate-100">{t}</Badge>
                                ))}
                              </div>
                            </div>

                            {config.enableRating && dish && (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleVote(dish.id, 'like')}
                                  className="w-10 h-10 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-all flex items-center justify-center group/btn"
                                >
                                  <Icon name="ThumbsUp" size={16} className="group-active/btn:scale-150 transition-transform" />
                                </button>
                                <button 
                                  onClick={() => handleVote(dish.id, 'dislike')}
                                  className="w-10 h-10 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center group/btn"
                                >
                                  <Icon name="ThumbsDown" size={16} className="group-active/btn:scale-150 transition-transform" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ColorCard>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200 animate-in zoom-in duration-500">
               <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mx-auto mb-6">
                 <Icon name="CalendarX2" size={48} />
               </div>
               <h3 className="text-2xl font-black text-slate-800 mb-2">今日暂未排餐</h3>
               <p className="text-slate-400 font-medium">请联系管理员更新本周菜单。</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-center">
            <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex gap-1">
              {[
                { label: '本月排行', value: 'month' },
                { label: '年度精选', value: 'year' },
                { label: '历史总计', value: 'all' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRatingScope(opt.value as any)}
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${ratingScope === opt.value ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Grid cols={2} gap={10}>
            {/* Red Board - Top Dishes */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                   <Icon name="Trophy" size={24} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-800">美食红榜 <span className="text-emerald-500">Top 5</span></h3>
              </div>
              
              <div className="space-y-4">
                {rankings.top.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${idx === 0 ? 'bg-amber-100 text-amber-600 shadow-inner' : 'bg-slate-50 text-slate-400'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800">{item.name}</h4>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                        净点赞数：{item.score}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 font-black">
                      <Icon name="TrendingUp" size={14} />
                    </div>
                  </div>
                ))}
                {rankings.top.length === 0 && (
                  <div className="py-12 text-center text-slate-300 italic text-sm">暂无数据</div>
                )}
              </div>
            </div>

            {/* Black Board - Bottom Dishes */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                   <Icon name="ThumbsDown" size={24} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-800">避雷黑榜 <span className="text-rose-500">Bottom 5</span></h3>
              </div>
              
              <div className="space-y-4">
                {rankings.bottom.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-xl text-slate-400">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800">{item.name}</h4>
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                        差评数：{Math.abs(item.score)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-rose-400 font-black">
                      <Icon name="TrendingDown" size={14} />
                    </div>
                  </div>
                ))}
                {rankings.bottom.length === 0 && (
                  <div className="py-12 text-center text-slate-300 italic text-sm">暂无数据</div>
                )}
              </div>
            </div>
          </Grid>
        </div>
      )}
    </div>
  );
};
