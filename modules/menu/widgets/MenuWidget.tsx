
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Icon } from '../../../platform/ui/basic/Icon';
import { MenuModuleSchema } from '../types';

export const MenuWidget: React.FC = () => {
  const db = loadDb();
  const menuData = db.modules.menu as MenuModuleSchema;
  const config = menuData.currentConfig;
  
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  const todayMenu = useMemo(() => {
    // Fix: Find the DailyMenu directly for today
    const dayPlan = (menuData.schedules || []).find(s => s.date === dateStr && s.status === 'published');
    if (!dayPlan) return null;
    
    const summary: Record<string, string[]> = {};
    
    config.meals.forEach(meal => {
      // Fix: Access assignments from the DailyMenu object
      const dishIds = dayPlan.assignments[meal.id] || [];
      // Show first 3 slots
      summary[meal.name] = dishIds.slice(0, 3).map(id => {
        return menuData.dishes.find(d => d.id === id)?.name || '未排餐';
      });
    });
    
    return summary;
  }, [menuData, config, dateStr]);

  return (
    <Link to="/menu" className="block group h-full">
      <ColorCard 
        variant="orange" 
        title={
          <div className="flex items-center gap-2">
            <Icon name="UtensilsCrossed" size={20} />
            <span>今日菜谱</span>
          </div>
        }
        className="h-full hover:shadow-lg transition-shadow border-orange-200"
      >
        <div className="space-y-4">
          {todayMenu && Object.keys(todayMenu).length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {/* Fix: Explicitly cast Object.entries result to [string, string[]][] to avoid 'unknown' type for 'dishes' */}
              {(Object.entries(todayMenu) as [string, string[]][]).map(([mealName, dishes], idx) => (
                <div key={mealName} className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name={idx === 0 ? "Sun" : "Moon"} size={12} className="text-orange-500" />
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{mealName}</span>
                  </div>
                  <ul className="space-y-1">
                    {/* Fix: Property 'map' now exists on 'dishes' due to explicit type casting above */}
                    {dishes.map((dish, i) => (
                      <li key={i} className="text-xs font-bold text-slate-700 bg-white/40 px-2 py-1 rounded-md border border-orange-100/50 truncate">
                        {dish}
                      </li>
                    ))}
                    {/* Fix: Property 'length' now exists on 'dishes' due to explicit type casting above */}
                    {dishes.length === 0 && <li className="text-[10px] italic text-slate-400">未排餐</li>}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-orange-400">
              <Icon name="Soup" size={32} className="mb-2 opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest">今日暂无菜谱</p>
            </div>
          )}
          
          <div className="pt-2 flex justify-end">
             <span className="text-[10px] font-black text-orange-600 uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              浏览详细菜单 <Icon name="ArrowRight" size={10} />
            </span>
          </div>
        </div>
      </ColorCard>
    </Link>
  );
};
