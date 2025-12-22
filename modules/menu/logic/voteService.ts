
import { loadDb, saveDb } from '../../../platform/core/db';
import { MenuModuleSchema, DishVoteRecord } from '../types';

/**
 * Persists a vote (like/dislike) for a specific dish on a specific date.
 * No user identification required for high-frequency anonymous feedback.
 */
export const castVote = (dishId: string, type: 'like' | 'dislike', dateStr: string) => {
  const db = loadDb();
  const menuData = db.modules.menu as MenuModuleSchema;
  
  if (!menuData.dishStats) {
    menuData.dishStats = {};
  }
  
  if (!menuData.dishStats[dishId]) {
    menuData.dishStats[dishId] = {};
  }
  
  if (!menuData.dishStats[dishId][dateStr]) {
    menuData.dishStats[dishId][dateStr] = { likes: 0, dislikes: 0 };
  }
  
  const record = menuData.dishStats[dishId][dateStr];
  if (type === 'like') {
    record.likes += 1;
  } else {
    record.dislikes += 1;
  }
  
  saveDb({
    ...db,
    modules: {
      ...db.modules,
      menu: menuData
    }
  });
};

/**
 * Aggregates stats for a dish over a specific scope.
 */
export const getAggregatedStats = (
  dishId: string, 
  scope: 'all' | 'year' | 'month', 
  stats: Record<string, Record<string, DishVoteRecord>>
) => {
  if (!stats || !stats[dishId]) return { likes: 0, dislikes: 0, score: 0 };
  
  const now = new Date();
  const yearStr = now.getFullYear().toString();
  const monthStr = `${yearStr}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  let totalLikes = 0;
  let totalDislikes = 0;
  
  Object.entries(stats[dishId]).forEach(([date, record]) => {
    let include = false;
    if (scope === 'all') include = true;
    else if (scope === 'year' && date.startsWith(yearStr)) include = true;
    else if (scope === 'month' && date.startsWith(monthStr)) include = true;
    
    if (include) {
      totalLikes += record.likes;
      totalDislikes += record.dislikes;
    }
  });
  
  return {
    likes: totalLikes,
    dislikes: totalDislikes,
    score: totalLikes - totalDislikes
  };
};
