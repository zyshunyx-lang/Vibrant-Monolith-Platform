
import React, { useState, useMemo } from 'react';
import QRCode from 'react-qr-code';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Badge } from '../../../platform/ui/basic/Badge';
import { Modal } from '../../../platform/ui/layout/Modal';
import { Input } from '../../../platform/ui/form/Input';
import { Select } from '../../../platform/ui/form/Select';
import { AssetDetailModal } from './AssetDetailModal';
import { BulkActionToolbar } from '../../../platform/ui/complex/BulkActionToolbar';
import { PrintPreviewModal } from '../components/PrintPreviewModal';
import { AssetsModuleSchema, Asset, AssetStatus } from '../types';

type ViewMode = 'category' | 'location' | 'department';

export const AssetLedger: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('category');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  
  const [editingAsset, setEditingAsset] = useState<Partial<Asset> | null>(null);
  const [activeAsset, setActiveAsset] = useState<Asset | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const assetData = (db.modules.assets || {}) as AssetsModuleSchema;
  const { assets = [], categories = [], locations = [], departments = [] } = assetData;
  const users = db.sys_config.users || [];

  const filteredAssets = useMemo(() => {
    return [...assets]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.assetCode.toLowerCase().includes(searchQuery.toLowerCase());
        if (!selectedNodeId) return matchesSearch;
        let matchesNode = false;
        if (viewMode === 'category') matchesNode = a.categoryId === selectedNodeId;
        if (viewMode === 'location') matchesNode = a.locationId === selectedNodeId;
        if (viewMode === 'department') matchesNode = a.departmentId === selectedNodeId;
        return matchesSearch && matchesNode;
      });
  }, [assets, searchQuery, viewMode, selectedNodeId]);

  const selectedAssetList = useMemo(() => assets.filter(a => selectedAssetIds.has(a.id)), [assets, selectedAssetIds]);

  const nodeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    assets.forEach(a => {
      counts[`cat_${a.categoryId}`] = (counts[`cat_${a.categoryId}`] || 0) + 1;
      counts[`loc_${a.locationId}`] = (counts[`loc_${a.locationId}`] || 0) + 1;
      if (a.departmentId) counts[`dept_${a.departmentId}`] = (counts[`dept_${a.departmentId}`] || 0) + 1;
    });
    return counts;
  }, [assets]);

  const handleUpdate = () => setDb(loadDb());

  const handleSaveAsset = () => {
    if (!editingAsset?.name || !editingAsset?.assetCode) return;
    const freshDb = loadDb();
    const freshAssets = freshDb.modules.assets as AssetsModuleSchema;
    let nextAssets = [...freshAssets.assets];
    if (editingAsset.id) nextAssets = nextAssets.map(a => a.id === editingAsset.id ? editingAsset as Asset : a);
    else nextAssets.push({ ...editingAsset, id: `ast_${Date.now()}`, createdAt: new Date().toISOString() } as Asset);
    saveDb({ ...freshDb, modules: { ...freshDb.modules, assets: { ...freshAssets, assets: nextAssets } } });
    handleUpdate();
    setIsEditModalOpen(false);
  };

  const getStatusBadge = (status: AssetStatus) => {
    const config: Record<AssetStatus, { label: string; variant: any }> = {
      idle: { label: '闲置', variant: 'success' },
      in_use: { label: '在用', variant: 'info' },
      maintenance: { label: '维修中', variant: 'warning' },
      scrapped: { label: '已报废', variant: 'danger' }
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const sidebarTabs = [
    { id: 'category', icon: 'Tag', label: '资产分类' },
    { id: 'location', icon: 'MapPin', label: '存放地点' },
    { id: 'department', icon: 'Users', label: '所属部门' },
  ];

  return (
    <div className="flex gap-8 animate-in fade-in duration-500 h-[calc(100vh-200px)] relative">
      <aside className="w-72 flex flex-col gap-4 overflow-hidden">
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200 shadow-inner">
           {sidebarTabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => { setViewMode(tab.id as ViewMode); setSelectedNodeId(null); }}
               className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${viewMode === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <Icon name={tab.icon as any} size={16} />
               <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">{tab.label.slice(0,2)}</span>
             </button>
           ))}
        </div>

        <ColorCard title={sidebarTabs.find(t => t.id === viewMode)?.label} variant="white" className="flex-1 flex flex-col !p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            <button onClick={() => setSelectedNodeId(null)} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-all ${selectedNodeId === null ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span>全部资产</span>
              <span className={`text-[10px] font-black ${selectedNodeId === null ? 'text-indigo-100' : 'text-slate-300'}`}>{assets.length}</span>
            </button>
            {viewMode === 'category' && categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedNodeId(cat.id)} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-all ${selectedNodeId === cat.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                <span className="truncate">{cat.name}</span>
                <span className="text-[10px] font-black">{nodeCounts[`cat_${cat.id}`] || 0}</span>
              </button>
            ))}
          </div>
        </ColorCard>
      </aside>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <header className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder={`请输入关键字搜索资产...`} className="pl-12 shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Button onClick={() => { setEditingAsset({ status: 'idle', purchaseDate: new Date().toISOString().split('T')[0] }); setIsEditModalOpen(true); }}>
            <Icon name="Plus" size={18} className="mr-2" /> 资产入库
          </Button>
        </header>

        <ColorCard variant="white" className="!p-0 overflow-hidden shadow-sm flex-1 flex flex-col">
          <div className="overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10 font-black">
                <tr className="text-[10px] text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded" onChange={() => {}} /></th>
                  <th className="px-6 py-4">资产信息</th>
                  <th className="px-6 py-4">状态</th>
                  <th className="px-6 py-4">领用人</th>
                  <th className="px-6 py-4 text-right">管理</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => { setSelectedAssetId(asset.id); setIsDetailModalOpen(true); }}>
                    <td className="px-6 py-4"><input type="checkbox" className="rounded" /></td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-600 mb-0.5">{asset.assetCode}</span>
                        <span className="text-sm font-bold text-slate-800">{asset.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{users.find(u => u.id === asset.currentUserId)?.realName || '---'}</td>
                    <td className="px-6 py-4 text-right">
                       <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingAsset(asset); setIsEditModalOpen(true); }}>
                         <Icon name="Edit" size={14} />
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ColorCard>
      </div>

      <BulkActionToolbar 
        selectedCount={selectedAssetIds.size}
        onClear={() => setSelectedAssetIds(new Set())}
        actions={[
          { label: '打印标签', icon: 'Printer', onClick: () => setIsPrintModalOpen(true), variant: 'primary' },
          { label: '报修登记', icon: 'Wrench', onClick: () => {}, variant: 'ghost' },
        ]}
      />

      <AssetDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} assetId={selectedAssetId} onUpdate={handleUpdate} />
      <PrintPreviewModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} assets={selectedAssetList} />
    </div>
  );
};
