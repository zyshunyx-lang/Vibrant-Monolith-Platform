
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Button } from '../../../platform/ui/basic/Button';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Badge } from '../../../platform/ui/basic/Badge';

export const DxfViewer: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.toLowerCase().endsWith('.dxf')) {
        alert('目前仅支持 .dxf 格式文件');
        return;
      }
      setIsLoading(true);
      setFile(selectedFile);
      // 模拟前端解析过程
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in duration-700">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/tools')} className="!p-2 hover:bg-slate-100 rounded-full">
            <Icon name="ArrowLeft" size={24} />
          </Button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">DXF 离线看图</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="success" className="text-[10px] font-black bg-emerald-50 text-emerald-600 border-none">OFFLINE READY</Badge>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Client-Side Parser v1.0</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Icon name="FolderOpen" size={16} className="mr-2" />
            更换图纸
          </Button>
          <Button size="sm" className="shadow-lg shadow-indigo-100">
            <Icon name="Maximize" size={16} className="mr-2" />
            全屏查看
          </Button>
        </div>
      </header>

      <main className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar: Layers & Info */}
        <aside className="w-72 hidden lg:flex flex-col gap-4 overflow-y-auto custom-scrollbar">
           <ColorCard variant="white" title="图纸概览" className="!p-0 border-slate-100 shadow-sm">
              <div className="p-4 space-y-4">
                {file ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">文件名</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">文件大小</p>
                      <p className="text-xs font-bold text-slate-700">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-4">未加载图纸</p>
                )}
              </div>
           </ColorCard>

           <ColorCard variant="white" title="图层管理 (Layers)" className="flex-1 !p-0 border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                 {file ? (
                   ['0', 'Defpoints', 'Layer_Wall', 'Layer_Furniture', 'Text_Info'].map(layer => (
                     <div key={layer} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <Icon name="Eye" size={14} className="text-indigo-500" />
                          <span className="text-xs font-bold text-slate-600">{layer}</span>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors" />
                     </div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                      <Icon name="Layers" size={40} className="mb-2" />
                      <span className="text-[10px] font-black uppercase">No Data</span>
                   </div>
                 )}
              </div>
           </ColorCard>
        </aside>

        {/* Drawing Area */}
        <div className="flex-1 bg-slate-900 rounded-[48px] relative overflow-hidden shadow-2xl border-[8px] border-white ring-1 ring-slate-200">
           {isLoading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/50 backdrop-blur-sm z-10">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-black uppercase tracking-[0.2em] animate-pulse">Parsing Entities...</p>
             </div>
           ) : file ? (
             <div className="h-full w-full flex items-center justify-center relative">
                {/* 此处未来将渲染 Canvas/WebGL 引擎 */}
                <div className="text-center space-y-4">
                  <Icon name="Cpu" size={64} className="mx-auto text-indigo-500/20" />
                  <div className="space-y-1">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest">WebGL Viewport Active</p>
                    <p className="text-white font-bold">{file.name}</p>
                  </div>
                  <p className="text-slate-600 text-[10px] max-w-xs mx-auto">
                    [模拟视图] 已解析 1,248 个实体 (Entities)。支持缩放、平移及图层可见性控制。
                  </p>
                </div>

                {/* Overlay Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                   <button className="p-3 hover:bg-white/20 rounded-xl transition-colors"><Icon name="ZoomIn" size={20} className="text-white" /></button>
                   <button className="p-3 hover:bg-white/20 rounded-xl transition-colors"><Icon name="ZoomOut" size={20} className="text-white" /></button>
                   <div className="w-px h-6 bg-white/10 mx-1" />
                   <button className="p-3 hover:bg-white/20 rounded-xl transition-colors"><Icon name="Move" size={20} className="text-white" /></button>
                   <button className="p-3 hover:bg-white/20 rounded-xl transition-colors"><Icon name="RotateCcw" size={20} className="text-white" /></button>
                </div>
             </div>
           ) : (
             <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center">
                <input type="file" ref={fileInputRef} className="hidden" accept=".dxf" onChange={handleFileChange} />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-md aspect-video border-2 border-dashed border-slate-700 rounded-[32px] flex flex-col items-center justify-center hover:bg-slate-800/50 hover:border-indigo-500/50 transition-all cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xl mb-6">
                    <Icon name="Upload" size={32} />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">选择 DXF 图纸文件</h3>
                  <p className="text-slate-500 text-sm max-w-xs px-4">
                    将 .dxf 文件拖拽至此，系统将自动进行本地解析，无需联网。
                  </p>
                </div>
             </div>
           )}

           {/* Security Badge */}
           <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">End-to-End Local Execution</span>
           </div>
        </div>
      </main>
    </div>
  );
};
