
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Button } from '../../../platform/ui/basic/Button';
import { Badge } from '../../../platform/ui/basic/Badge';

// 动态引入 DXF 解析器 (ESM)
const loadDxfParser = async () => {
  const DxfParser = (await import('https://esm.sh/dxf-parser')).default;
  return new DxfParser();
};

interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export const CadViewer: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [entities, setEntities] = useState<any[]>([]);
  const [layers, setLayers] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [fileName, setFileName] = useState<string>('');

  // 1. 文件读取与解析
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parser = await loadDxfParser();
        const dxf = parser.parseSync(event.target?.result as string);
        setEntities(dxf.entities || []);
        setLayers(dxf.layers || {});
        autoFit(dxf.entities || []);
      } catch (err) {
        alert('解析失败，请确保文件是有效的 ASCII DXF 格式。');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // 2. 自动缩放适配逻辑 (Auto-fit)
  const autoFit = (data: any[]) => {
    if (data.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    data.forEach(entity => {
      // 简化版包围盒计算：处理点和线段的主要坐标
      const processPoint = (x: number, y: number) => {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      };

      if (entity.vertices) entity.vertices.forEach((v: any) => processPoint(v.x, v.y));
      if (entity.center) {
        const r = entity.radius || 0;
        processPoint(entity.center.x - r, entity.center.y - r);
        processPoint(entity.center.x + r, entity.center.y + r);
      }
      if (entity.start && entity.end) {
        processPoint(entity.start.x, entity.start.y);
        processPoint(entity.end.x, entity.end.y);
      }
    });

    const padding = 40;
    const width = maxX - minX;
    const height = maxY - minY;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scaleX = (canvas.width - padding * 2) / width;
    const scaleY = (canvas.height - padding * 2) / height;
    const scale = Math.min(scaleX, scaleY);

    setViewState({
      scale: isFinite(scale) ? scale : 1,
      offsetX: -minX,
      offsetY: -minY
    });
  };

  // 3. 渲染循环
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || entities.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // 坐标系转换：平移并翻转 Y 轴（DXF 向上为正，Canvas 向下为正）
    ctx.translate(20, canvas.height - 20); // 留点边距
    ctx.scale(viewState.scale, -viewState.scale); // 翻转 Y
    ctx.translate(viewState.offsetX, viewState.offsetY);

    ctx.lineWidth = 1 / viewState.scale; // 保持细线
    ctx.strokeStyle = '#ffffff';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    entities.forEach(entity => {
      ctx.beginPath();
      
      switch (entity.type) {
        case 'LINE':
          ctx.moveTo(entity.vertices[0].x, entity.vertices[0].y);
          ctx.lineTo(entity.vertices[1].x, entity.vertices[1].y);
          break;
        case 'CIRCLE':
          ctx.arc(entity.center.x, entity.center.y, entity.radius, 0, Math.PI * 2);
          break;
        case 'ARC':
          // DXF 角度是以度为单位，逆时针
          ctx.arc(
            entity.center.x, 
            entity.center.y, 
            entity.radius, 
            entity.startAngle * Math.PI / 180, 
            entity.endAngle * Math.PI / 180, 
            false
          );
          break;
        case 'LWPOLYLINE':
        case 'POLYLINE':
          if (entity.vertices.length > 0) {
            ctx.moveTo(entity.vertices[0].x, entity.vertices[0].y);
            for (let i = 1; i < entity.vertices.length; i++) {
              ctx.lineTo(entity.vertices[i].x, entity.vertices[i].y);
            }
            if (entity.shape) ctx.closePath();
          }
          break;
      }
      ctx.stroke();
    });

    ctx.restore();
  }, [entities, viewState]);

  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        draw();
      }
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleZoom = (factor: number) => {
    setViewState(prev => ({ ...prev, scale: prev.scale * factor }));
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 animate-in fade-in duration-700 overflow-hidden">
      {/* 顶部控制栏 */}
      <header className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/tools')} className="!p-2 hover:bg-slate-50 rounded-full">
            <Icon name="ArrowLeft" size={24} />
          </Button>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">DXF 离线看图</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Client-Side Drawing Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} className="hidden" accept=".dxf" onChange={handleFileChange} />
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Icon name="FolderOpen" size={16} className="mr-2" />
            选择图纸
          </Button>
          
          <div className="h-6 w-px bg-slate-200 mx-2" />
          
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button onClick={() => handleZoom(1.2)} className="p-2 hover:bg-white rounded-lg transition-all text-slate-600"><Icon name="ZoomIn" size={18} /></button>
            <button onClick={() => handleZoom(0.8)} className="p-2 hover:bg-white rounded-lg transition-all text-slate-600"><Icon name="ZoomOut" size={18} /></button>
            <button onClick={() => autoFit(entities)} className="p-2 hover:bg-white rounded-lg transition-all text-slate-600"><Icon name="Maximize" size={18} /></button>
          </div>
        </div>
      </header>

      {/* 画布区域 */}
      <main className="flex-1 bg-[#1a1a1a] rounded-[40px] border-[8px] border-white shadow-2xl relative overflow-hidden group">
        <div ref={containerRef} className="w-full h-full">
          <canvas ref={canvasRef} />
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-50">
             <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-sm font-black uppercase tracking-[0.2em]">Parsing Entities...</p>
          </div>
        )}

        {!fileName && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4 pointer-events-none">
             <Icon name="Upload" size={64} className="opacity-10" />
             <p className="font-black text-sm uppercase tracking-widest opacity-20">No File Loaded</p>
          </div>
        )}

        {/* 水印标识 */}
        <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Local Engine v1.0</span>
        </div>
      </main>

      {/* 底部状态栏 */}
      <footer className="bg-slate-900 text-white/50 px-6 py-3 rounded-2xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="text-white/30">FILE:</span>
            <span className="text-white/80">{fileName || '---'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/30">ENTITIES:</span>
            <span className="text-white/80">{entities.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/30">LAYERS:</span>
            <span className="text-white/80">{Object.keys(layers).length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Icon name="Shield" size={12} className="text-emerald-500" />
           <span className="text-emerald-500/80">Secured Offline Workspace</span>
        </div>
      </footer>
    </div>
  );
};
