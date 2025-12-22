
import React, { useState, useEffect } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Input } from '../../../platform/ui/form/Input';
import { Select } from '../../../platform/ui/form/Select';
import { Modal } from '../../../platform/ui/layout/Modal';
import { AssetsModuleSchema } from '../types';

type SettingTab = 'categories' | 'locations' | 'providers' | 'departments';

export const BasicSettings: React.FC = () => {
  // Use a refresh key to force re-renders if needed, though state updates usually suffice
  const [refreshKey, setRefreshKey] = useState(0);
  const [db, setDb] = useState(loadDb());
  const [activeTab, setActiveTab] = useState<SettingTab>('categories');
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});

  const assetData = (db.modules.assets || {}) as AssetsModuleSchema;
  const users = db.sys_config.users || [];

  // Re-sync local state with DB whenever refreshKey changes
  useEffect(() => {
    setDb(loadDb());
  }, [refreshKey]);

  const handleOpenModal = (item: any = null) => {
    setEditingItem(item);
    setFormData(item ? { ...item } : {});
    setIsModalOpen(true);
  };

  const handlePersistence = (type: SettingTab, items: any[]) => {
    const freshDb = loadDb();
    const updatedAssets = { ...freshDb.modules.assets, [type]: items };
    const newDb = {
      ...freshDb,
      modules: { ...freshDb.modules, assets: updatedAssets }
    };
    saveDb(newDb);
    // Force immediate local update and trigger effect for consistency
    setDb(newDb);
    setRefreshKey(prev => prev + 1);
  };

  const handleSave = () => {
    const currentItems = (assetData[activeTab] || []);
    let nextItems: any[];

    if (editingItem) {
      // Update existing
      nextItems = currentItems.map((item: any) => 
        item.id === editingItem.id ? { ...formData, id: item.id } : item
      );
    } else {
      // Create new
      const newId = `${activeTab.slice(0, 3)}_${Date.now()}`;
      nextItems = [...currentItems, { ...formData, id: newId }];
    }

    handlePersistence(activeTab, nextItems);
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定删除此项吗？该操作不可撤销。')) return;
    const nextItems = (assetData[activeTab] || []).filter((item: any) => item.id !== id);
    handlePersistence(activeTab, nextItems);
  };

  const tabs = [
    { id: 'categories', label: '分类管理', icon: 'Tag' },
    { id: 'locations', label: '地点管理', icon: 'MapPin' },
    { id: 'providers', label: '供应商管理', icon: 'Truck' },
    { id: 'departments', label: '部门管理', icon: 'Users' },
  ];

  const getUserName = (id: string) => users.find(u => u.id === id)?.realName || '未指定';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex bg-slate-100 p-1.5 rounded-3xl shadow-inner max-w-fit border border-slate-200/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as SettingTab);
              setEditingItem(null);
            }}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-black transition-all
              ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}
            `}
          >
            <Icon name={tab.icon as any} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <ColorCard 
        title={tabs.find(t => t.id === activeTab)?.label} 
        variant="white"
        headerAction={
          <Button size="sm" onClick={() => handleOpenModal()}>
            <Icon name="Plus" size={16} className="mr-2" />
            新增
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                {activeTab === 'categories' && (
                  <>
                    <th className="px-6 py-4">分类名称</th>
                    <th className="px-6 py-4">编码前缀</th>
                  </>
                )}
                {activeTab === 'locations' && (
                  <>
                    <th className="px-6 py-4">地点名称</th>
                    <th className="px-6 py-4">楼栋/楼层</th>
                  </>
                )}
                {activeTab === 'providers' && (
                  <>
                    <th className="px-6 py-4">供应商</th>
                    <th className="px-6 py-4">联系方式</th>
                  </>
                )}
                {activeTab === 'departments' && (
                  <>
                    <th className="px-6 py-4">部门名称</th>
                    <th className="px-6 py-4">资产管理员</th>
                  </>
                )}
                <th className="px-6 py-4 text-right">管理操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(assetData[activeTab] || []).map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  {activeTab === 'categories' && (
                    <>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{item.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-indigo-500">{item.code}</td>
                    </>
                  )}
                  {activeTab === 'locations' && (
                    <>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{item.building} {item.floor}F</td>
                    </>
                  )}
                  {activeTab === 'providers' && (
                    <>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        <div className="flex flex-col">
                          <span>{item.contact}</span>
                          <span className="text-[10px] font-mono">{item.phone}</span>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'departments' && (
                    <>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{item.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full overflow-hidden border bg-slate-100">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${users.find(u => u.id === item.managerId)?.username || 'guest'}`} alt="manager" />
                           </div>
                           <span className="text-sm font-medium text-slate-600">{getUserName(item.managerId)}</span>
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50" onClick={() => handleOpenModal(item)}>
                        <Icon name="Edit" size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50" onClick={() => handleDelete(item.id)}>
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(assetData[activeTab] || []).length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400 italic">暂无配置数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ColorCard>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? `编辑${tabs.find(t => t.id === activeTab)?.label.slice(0,2)}` : `新增${tabs.find(t => t.id === activeTab)?.label.slice(0,2)}`}
      >
        <div className="space-y-4 py-2">
          {activeTab === 'categories' && (
            <>
              <Input label="分类名称" placeholder="如：笔记本电脑" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input label="分类编码前缀" placeholder="如：PC" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
            </>
          )}
          {activeTab === 'locations' && (
            <>
              <Input label="地点名称" placeholder="如：A栋-101" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input label="所属楼栋" placeholder="如：A栋" value={formData.building || ''} onChange={e => setFormData({...formData, building: e.target.value})} />
              <Input label="所在楼层" placeholder="如：1" value={formData.floor || ''} onChange={e => setFormData({...formData, floor: e.target.value})} />
            </>
          )}
          {activeTab === 'providers' && (
            <>
              <Input label="供应商名称" placeholder="如：京东企业购" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input label="业务联系人" placeholder="姓名" value={formData.contact || ''} onChange={e => setFormData({...formData, contact: e.target.value})} />
              <Input label="联系电话" placeholder="手机或固话" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </>
          )}
          {activeTab === 'departments' && (
            <>
              <Input label="部门名称" placeholder="如：信息技术部" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Select 
                label="部门资产管理员" 
                options={[{label: '-- 请选择负责人 --', value: ''}, ...users.map(u => ({ label: u.realName, value: u.id }))]} 
                value={formData.managerId} 
                onChange={e => setFormData({...formData, managerId: e.target.value})} 
              />
            </>
          )}
          
          <div className="flex gap-3 pt-6 border-t border-slate-50">
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!formData.name}>
              {editingItem ? '更新配置' : '确认创建'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
