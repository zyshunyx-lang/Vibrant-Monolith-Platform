
import React, { useState, useMemo } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { Input } from '../../../platform/ui/form/Input';
import { Modal } from '../../../platform/ui/layout/Modal';
import { Grid } from '../../../platform/ui/layout/Grid';
import { getAggregatedStats } from '../logic/voteService';
import { MenuModuleSchema, Dish } from '../types';

export const DishLibrary: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Partial<Dish> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const menuData = db.modules.menu as MenuModuleSchema;
  const dishes = menuData.dishes || [];
  const stats = menuData.dishStats || {};

  const updateDishes = (newDishes: Dish[]) => {
    const freshDb = loadDb();
    const newDb = {
      ...freshDb,
      modules: {
        ...freshDb.modules,
        menu: { ...freshDb.modules.menu, dishes: newDishes }
      }
    };
    saveDb(newDb);
    setDb(newDb);
  };

  const handleSaveDish = () => {
    if (!editingDish?.name) return;
    
    let nextDishes = [...dishes];
    if (editingDish.id) {
      nextDishes = nextDishes.map(d => d.id === editingDish.id ? editingDish as Dish : d);
    } else {
      const newDish: Dish = {
        ...editingDish as Dish,
        id: `dish_${Date.now()}`,
        tags: editingDish.tags || [],
        categoryId: 'default'
      };
      nextDishes.push(newDish);
    }
    
    updateDishes(nextDishes);
    setIsModalOpen(false);
    setEditingDish(null);
  };

  const handleDeleteDish = (id: string) => {
    if (!confirm('确定删除该菜品吗？')) return;
    updateDishes(dishes.filter(d => d.id !== id));
  };

  const dishListWithStats = useMemo(() => {
    return dishes.map(d => ({
      ...d,
      metrics: getAggregatedStats(d.id, 'all', stats)
    })).filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [dishes, stats, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96 text-slate-900">
          <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="搜索菜名、标签..." 
            className="pl-12" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => { setEditingDish({ name: '', tags: [] }); setIsModalOpen(true); }}>
          <Icon name="Plus" size={18} className="mr-2" />
          新增菜品
        </Button>
      </header>

      <Grid cols={4}>
        {dishListWithStats.map(dish => (
          <div key={dish.id} className="group relative bg-white rounded-[32px] border border-slate-100 p-5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="aspect-square bg-slate-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center relative">
              {dish.imageUrl ? (
                <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
              ) : (
                <Icon name="Utensils" size={48} className="text-slate-200" />
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingDish(dish); setIsModalOpen(true); }} className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                  <Icon name="Pencil" size={14} />
                </button>
                <button onClick={() => handleDeleteDish(dish.id)} className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm text-rose-600 hover:bg-rose-600 hover:text-white transition-colors">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
              
              {/* Popularity Badge */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-white/80 backdrop-blur rounded-lg border border-slate-100 shadow-sm">
                 <Icon name="TrendingUp" size={10} className={dish.metrics.score >= 0 ? 'text-emerald-500' : 'text-slate-300'} />
                 <span className={`text-[10px] font-black ${dish.metrics.score > 0 ? 'text-rose-500' : dish.metrics.score < 0 ? 'text-slate-400' : 'text-slate-400'}`}>
                   {dish.metrics.score > 0 ? `+${dish.metrics.score}` : dish.metrics.score}
                 </span>
              </div>
            </div>
            
            <h4 className="font-black text-slate-800 text-lg mb-2">{dish.name}</h4>
            
            <div className="flex flex-wrap gap-1.5 mb-4">
              {dish.tags.map(tag => (
                <Badge key={tag} variant="neutral" className="bg-slate-50 text-[10px] uppercase font-black tracking-tight">{tag}</Badge>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold">
               <div className="flex items-center gap-3">
                 <span className="text-emerald-500">👍 {dish.metrics.likes}</span>
                 <span className="text-rose-400">👎 {dish.metrics.dislikes}</span>
               </div>
               <span className="text-slate-300 uppercase tracking-widest">Feedback</span>
            </div>
          </div>
        ))}
        {dishListWithStats.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
             <Icon name="SearchX" size={48} className="mx-auto text-slate-300 mb-4" />
             <p className="text-slate-400 font-bold">未找到匹配的菜品或暂无数据</p>
          </div>
        )}
      </Grid>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingDish?.id ? "编辑菜品" : "新增菜品"}
      >
        <div className="space-y-5 py-2">
          <Input 
            label="菜品名称" 
            placeholder="如：红烧排骨" 
            value={editingDish?.name || ''} 
            onChange={e => setEditingDish(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input 
            label="图片 URL (可选)" 
            placeholder="https://..." 
            value={editingDish?.imageUrl || ''} 
            onChange={e => setEditingDish(prev => ({ ...prev, imageUrl: e.target.value }))}
          />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">标签</label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[46px]">
              {editingDish?.tags?.map(tag => (
                <Badge key={tag} variant="info" className="gap-1 pr-1 font-black">
                  {tag}
                  <button onClick={() => setEditingDish(prev => ({ ...prev, tags: prev?.tags?.filter(t => t !== tag) }))}>
                    <Icon name="X" size={12} />
                  </button>
                </Badge>
              ))}
              <input 
                className="bg-transparent border-none focus:ring-0 text-sm flex-1 min-w-[80px]"
                placeholder="输入后回车添加"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && !editingDish?.tags?.includes(val)) {
                      setEditingDish(prev => ({ ...prev, tags: [...(prev?.tags || []), val] }));
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button className="flex-1" onClick={handleSaveDish}>保存菜品</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
