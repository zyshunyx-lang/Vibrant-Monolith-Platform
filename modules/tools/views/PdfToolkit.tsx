
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Button } from '../../../platform/ui/basic/Button';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Input } from '../../../platform/ui/form/Input';
import { Badge } from '../../../platform/ui/basic/Badge';

// 动态加载 PDF 处理库 (ESM 模式)
const loadPdfLib = () => import('https://esm.sh/pdf-lib@1.17.1');
const loadPdfJs = () => import('https://esm.sh/pdfjs-dist@4.0.379/build/pdf.mjs');

type ToolTab = 'merge' | 'split' | 'watermark' | 'convert';

export const PdfToolkit: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ToolTab>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 文件管理
  const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 功能配置
  const [splitRange, setSplitRange] = useState('1-5');
  const [watermarkText, setWatermarkText] = useState('内部机密文件');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.4);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f
      }));
      
      if (activeTab === 'merge') {
        setFiles(prev => [...prev, ...newFiles]);
      } else {
        setFiles(newFiles.slice(0, 1)); // 其他功能仅支持单文件
      }
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    const index = files.findIndex(f => f.id === id);
    if (index < 0) return;
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= files.length) return;

    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[nextIndex];
    newFiles[nextIndex] = temp;
    setFiles(newFiles);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- 逻辑：合并 PDF ---
  const executeMerge = async () => {
    if (files.length < 2) return alert('合并至少需要两个 PDF 文件');
    setIsProcessing(true);
    try {
      const { PDFDocument } = await loadPdfLib();
      const mergedPdf = await PDFDocument.create();
      
      for (const fileItem of files) {
        const bytes = await fileItem.file.arrayBuffer();
        const srcPdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
        copiedPages.forEach((page: any) => mergedPdf.addPage(page));
      }
      
      const pdfBytes = await mergedPdf.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), '合并文档.pdf');
    } catch (err) {
      console.error(err);
      alert('合并失败，请检查文件是否为标准 PDF 格式');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 逻辑：拆分 PDF ---
  const executeSplit = async () => {
    if (files.length === 0) return alert('请先上传文件');
    setIsProcessing(true);
    try {
      const { PDFDocument } = await loadPdfLib();
      const bytes = await files[0].file.arrayBuffer();
      const srcPdf = await PDFDocument.load(bytes);
      const splitPdf = await PDFDocument.create();

      // 解析范围，例如 "1-5" 或 "1, 3, 5"
      const pagesToKeep: number[] = [];
      const parts = splitRange.split(',').map(p => p.trim());
      parts.forEach(p => {
        if (p.includes('-')) {
          const [start, end] = p.split('-').map(n => parseInt(n) - 1);
          for (let i = start; i <= end; i++) if (i >= 0 && i < srcPdf.getPageCount()) pagesToKeep.push(i);
        } else {
          const idx = parseInt(p) - 1;
          if (idx >= 0 && idx < srcPdf.getPageCount()) pagesToKeep.push(idx);
        }
      });

      if (pagesToKeep.length === 0) throw new Error('无效的页码范围');

      const copiedPages = await splitPdf.copyPages(srcPdf, pagesToKeep);
      copiedPages.forEach((page: any) => splitPdf.addPage(page));
      
      const pdfBytes = await splitPdf.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `拆分_${files[0].file.name}`);
    } catch (err: any) {
      alert(err.message || '拆分失败');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 逻辑：加水印 ---
  const executeWatermark = async () => {
    if (files.length === 0) return alert('请先上传文件');
    setIsProcessing(true);
    try {
      const { PDFDocument, rgb, degrees, StandardFonts } = await loadPdfLib();
      const bytes = await files[0].file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      pages.forEach((page: any) => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 4,
          y: height / 2,
          size: 50,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: watermarkOpacity,
          rotate: degrees(45),
        });
      });

      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `水印_${files[0].file.name}`);
    } catch (err) {
      alert('添加水印失败');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 逻辑：转 Word (提取文本) ---
  const executeConvert = async () => {
    if (files.length === 0) return alert('请先上传文件');
    setIsProcessing(true);
    try {
      const pdfjs: any = await loadPdfJs();
      // 设置 worker 地址
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs';
      
      const bytes = await files[0].file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += `--- 第 ${i} 页 ---\n${pageText}\n\n`;
      }

      // 生成 TXT 文件 (最安全兼容的方式)
      downloadBlob(new Blob([fullText], { type: 'text/plain;charset=utf-8' }), `${files[0].file.name.split('.')[0]}.txt`);
      
      // 生成简易 HTML DOC 文件
      const htmlDoc = `<html><body><pre style="white-space: pre-wrap;">${fullText}</pre></body></html>`;
      downloadBlob(new Blob([htmlDoc], { type: 'application/msword' }), `${files[0].file.name.split('.')[0]}.doc`);
      
      alert('文本提取成功！已同时下载 .txt 与 .doc 格式。');
    } catch (err) {
      console.error(err);
      alert('转换失败，部分扫描件 PDF 可能无法提取文字');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <Icon name="FileText" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">PDF 全能工具包</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Offline-First PDF Processing</p>
          </div>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
          {[
            { id: 'merge', label: '合并', icon: 'PlusSquare' },
            { id: 'split', label: '拆分', icon: 'Scissors' },
            { id: 'watermark', label: '水印', icon: 'Type' },
            { id: 'convert', label: '提取文字', icon: 'FileCode' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as ToolTab); setFiles([]); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon name={tab.icon as any} size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 操作区 */}
        <div className="lg:col-span-2 space-y-6">
          <ColorCard variant="white" title="文件配置" className="shadow-sm border-slate-100">
            <div className="space-y-4">
               {/* 动态配置项 */}
               {activeTab === 'split' && (
                 <Input label="拆分页码范围" placeholder="例如: 1-5, 8, 10-12" value={splitRange} onChange={e => setSplitRange(e.target.value)} />
               )}
               {activeTab === 'watermark' && (
                 <div className="space-y-4">
                   <Input label="水印文本" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} />
                   <div className="space-y-1.5 px-1">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">不透明度 ({Math.round(watermarkOpacity * 100)}%)</label>
                      <input 
                        type="range" min="0.1" max="1" step="0.1" 
                        value={watermarkOpacity} 
                        onChange={e => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full h-2 bg-indigo-50 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                   </div>
                 </div>
               )}
               {activeTab === 'convert' && (
                 <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">注意 (Notice)</p>
                    <p className="text-xs font-medium text-amber-800 leading-relaxed">
                      纯前端转换仅支持提取 PDF 内部的文本流。如果您的文件是图片扫描件，请先进行 OCR 识别。
                    </p>
                 </div>
               )}

               <div className="pt-4">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf" 
                    multiple={activeTab === 'merge'} 
                    onChange={handleFileChange} 
                  />
                  <Button 
                    variant="secondary" 
                    className="w-full !rounded-2xl py-4 border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-400 transition-all group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                       <Icon name="Upload" size={32} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                       <span className="text-sm font-black text-slate-400 group-hover:text-indigo-600">点击上传 PDF 文件</span>
                    </div>
                  </Button>
               </div>

               <Button 
                className="w-full py-4 !rounded-2xl shadow-xl shadow-indigo-100" 
                isLoading={isProcessing}
                disabled={files.length === 0}
                onClick={() => {
                  if (activeTab === 'merge') executeMerge();
                  if (activeTab === 'split') executeSplit();
                  if (activeTab === 'watermark') executeWatermark();
                  if (activeTab === 'convert') executeConvert();
                }}
               >
                 <Icon name="Zap" size={18} className="mr-2" />
                 立即开始处理
               </Button>
            </div>
          </ColorCard>
          
          <div className="p-6 bg-slate-900 rounded-[32px] text-white relative overflow-hidden">
             <div className="relative z-10 space-y-2">
                <h4 className="text-lg font-black tracking-tight">隐私安全保障</h4>
                <p className="text-xs font-medium text-slate-400 leading-relaxed">
                  本模块采用 WebAssembly 和原生 JS 引擎。所有处理逻辑均在您的浏览器本地内存中完成，文件<b>永不上传</b>至服务器，确保机密文档 100% 安全。
                </p>
             </div>
             <Icon name="ShieldCheck" size={120} className="absolute -right-6 -bottom-6 text-white/5" />
          </div>
        </div>

        {/* 文件列表/预览区 */}
        <div className="lg:col-span-3">
          <ColorCard variant="white" title="待处理清单" className="h-full shadow-sm border-slate-100 flex flex-col !p-0">
             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                {files.map((fileItem, idx) => (
                  <div key={fileItem.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 transition-all hover:border-indigo-200 animate-in slide-in-from-right-4 duration-300">
                     <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-500">
                        <Icon name="FileText" size={20} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-black text-slate-800 truncate">{fileItem.file.name}</h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                        </p>
                     </div>
                     
                     <div className="flex items-center gap-1">
                        {activeTab === 'merge' && (
                          <>
                            <button onClick={() => moveFile(fileItem.id, 'up')} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                              <Icon name="ArrowUp" size={14} />
                            </button>
                            <button onClick={() => moveFile(fileItem.id, 'down')} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                              <Icon name="ArrowDown" size={14} />
                            </button>
                          </>
                        )}
                        <button onClick={() => removeFile(fileItem.id)} className="p-2 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-500 transition-colors ml-2">
                           <Icon name="Trash2" size={16} />
                        </button>
                     </div>
                  </div>
                ))}

                {files.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300 gap-4">
                     <Icon name="FileSearch" size={64} className="opacity-10" />
                     <p className="font-bold text-sm">暂无待处理文件，请先从左侧上传</p>
                  </div>
                )}
             </div>
             
             {files.length > 0 && (
               <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-[32px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Ready for sequence {activeTab.toUpperCase()}</span>
                  <Badge variant="info">共 {files.length} 个文件</Badge>
               </div>
             )}
          </ColorCard>
        </div>
      </main>
    </div>
  );
};
