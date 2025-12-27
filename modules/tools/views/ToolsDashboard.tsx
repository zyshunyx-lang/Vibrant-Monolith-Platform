
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Grid } from '../../../platform/ui/layout/Grid';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Button } from '../../../platform/ui/basic/Button';
import { Badge } from '../../../platform/ui/basic/Badge';

export const ToolsDashboard: React.FC = () => {
  const navigate = useNavigate();

  const toolsets = [
    {
      id: 'pdf',
      title: 'PDF 全能工具包',
      description: '提供 PDF 合并、拆分、水印添加及简易 Word 文本提取功能。',
      icon: 'FileText' as const,
      color: 'indigo' as const,
      route: '/tools/pdf',
      features: ['合并拆分', '批量水印', '简易转 Word'],
      isHot: true
    },
    {
      id: 'cad',
      title: 'DXF 离线看图',
      description: '支持 .dxf 格式图纸在线极速预览。纯前端解析，无需联网，确保工程图纸绝对安全。',
      icon: 'Box' as const,
      color: 'emerald' as const,
      route: '/tools/cad',
      features: ['DXF 解析', '图层切换', '免安装'],
      isHot: false
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Icon name="Wrench" size={24} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">常用工具箱</h2>
          </div>
          <p className="text-slate-500 font-medium ml-12">
            集成高频办公辅助工具。基于局域网安全设计，所有操作均在浏览器本地完成。
          </p>
        </div>
        
        <Badge variant="success" className="px-4 py-1.5 font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-100 shrink-0">
          Local Environment Ready
        </Badge>
      </header>

      <Grid cols={2} gap={8}>
        {toolsets.map((tool) => (
          <ColorCard 
            key={tool.id}
            variant="white"
            className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden relative border-slate-100"
            onClick={() => navigate(tool.route)}
          >
            <div className="flex gap-6">
              <div className={`w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner shrink-0`}>
                <Icon name={tool.icon} size={36} />
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-slate-800">{tool.title}</h3>
                  {tool.isHot && <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[8px] font-black uppercase rounded tracking-tighter">Hot</span>}
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  {tool.description}
                </p>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {tool.features.map(f => (
                    <span key={f} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-md group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Icon name="ArrowRight" size={18} />
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
          </ColorCard>
        ))}
      </Grid>

      <section className="mt-12 p-10 rounded-[48px] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <h4 className="text-2xl font-black mb-2">安全声明</h4>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            本工具箱所有功能模块（PDF处理、DXF预览）均采用<b>纯前端计算技术</b>。文件在处理过程中<b>不会被上传至任何服务器</b>。
            适合处理涉密、内部敏感文档，支持在无外网环境下完美运行。
          </p>
        </div>
        <div className="relative z-10 mt-8 md:mt-0 flex gap-4">
           <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
              <Icon name="Shield" className="text-emerald-400" />
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Data Security</p>
                <p className="text-xs font-bold">100% 本地处理</p>
              </div>
           </div>
        </div>
        <Icon name="Zap" size={160} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
      </section>
    </div>
  );
};
