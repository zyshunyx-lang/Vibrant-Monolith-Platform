
import React, { useState } from 'react';
import { loadDb, saveDb, getCurrentUser } from '../../../platform/core/db';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { ExcelIO } from '../../../platform/ui/complex/ExcelIO';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Badge } from '../../../platform/ui/basic/Badge';
import { AssetsModuleSchema, Asset, AssetLog, AssetCodeRule } from '../types';

export const AssetImportWizard: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [step, setStep] = useState(1);
  const [rawData, setRawData] = useState<any[]>([]);
  const [autoGenMissing, setAutoGenMissing] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);

  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  const operator = getCurrentUser();

  const handleImportedData = (data: any[]) => {
    setRawData(data);
    setStep(2);
  };

  const generateCode = (rule: AssetCodeRule, dateStr: string, seq: number) => {
    const year = dateStr ? new Date(dateStr).getFullYear() : new Date().getFullYear();
    const month = dateStr ? String(new Date(dateStr).getMonth() + 1).padStart(2, '0') : '01';
    const datePart = rule.includeDate ? (rule.dateFormat === 'YYYY' ? String(year) : `${year}${month}`) : '';
    const seqPart = String(seq).padStart(rule.seqDigits, '0');
    return [rule.prefix, datePart, seqPart].filter(Boolean).join(rule.separator);
  };

  const executeImport = () => {
    setIsExecuting(true);
    const freshDb = loadDb();
    const freshAssets = freshDb.modules.assets as AssetsModuleSchema;
    const existingCodes = new Set(freshAssets.assets.map(a => a.assetCode));
    const newAssets: Asset[] = [];
    const newLogs: AssetLog[] = [];
    
    let currentSeq = freshAssets.codeRule.currentSeq;
    let maxFoundSeq = currentSeq;

    try {
      for (const row of rawData) {
        let code = String(row['资产编码'] || row['Asset Code'] || '').trim();
        
        // Handle Auto-Gen for missing codes
        if (!code) {
          if (autoGenMissing) {
            currentSeq++;
            code = generateCode(freshAssets.codeRule, row['购置日期'], currentSeq);
          } else {
            throw new Error(`行 [${row['资产名称']}] 缺少编码且未开启自动生成`);
          }
        }

        // Duplicate Check
        if (existingCodes.has(code)) {
          throw new Error(`编码冲突: ${code} 已在系统中存在。请检查 Excel 是否包含重复项。`);
        }

        const asset: Asset = {
          id: `ast_import_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          assetCode: code,
          name: String(row['资产名称'] || row['Name'] || '未命名资产'),
          model: String(row['规格型号'] || row['Model'] || ''),
          price: parseFloat(row['金额'] || row['Price'] || '0'),
          purchaseDate: row['购置日期'] || new Date().toISOString().split('T')[0],
          categoryId: freshAssets.categories[0]?.id || 'default',
          locationId: freshAssets.locations[0]?.id || 'default',
          status: 'idle',
          createdAt: new Date().toISOString()
        };

        const log: AssetLog = {
          id: `alog_import_${asset.id}`,
          assetId: asset.id,
          type: 'import',
          operatorId: operator?.id || 'system',
          timestamp: new Date().toISOString(),
          remark: '系统初始化导入 (System Migration)',
        };

        newAssets.push(asset);
        newLogs.push(log);
        existingCodes.add(code);

        // Smart sequence detection: Extract numeric part if it matches the prefix style
        const match = code.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0]);
          if (num > maxFoundSeq) maxFoundSeq = num;
        }
      }

      // Update Global State
      freshAssets.assets = [...newAssets, ...freshAssets.assets];
      freshAssets.logs = [...newLogs, ...(freshAssets.logs || [])];
      
      // Auto-Calibration logic
      if (maxFoundSeq > freshAssets.codeRule.currentSeq) {
        if (confirm(`导入完成！检测到导入的编码最大流水号为 ${maxFoundSeq}，是否将系统规则同步校准至此值？`)) {
          freshAssets.codeRule.currentSeq = maxFoundSeq;
        } else {
          freshAssets.codeRule.currentSeq = currentSeq;
        }
      } else {
        freshAssets.codeRule.currentSeq = currentSeq;
      }

      saveDb(freshDb);
      alert(`成功导入 ${newAssets.length} 条资产记录！`);
      onSuccess();
    } catch (e: any) {
      alert(`导入失败: ${e.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[40px] bg-slate-50">
           <div className="w-20 h-20 bg-white rounded-[28px] shadow-sm flex items-center justify-center mb-6 text-indigo-500">
             <Icon name="FileSpreadsheet" size={40} />
           </div>
           <h3 className="text-xl font-black text-slate-800 mb-2">上传资产数据</h3>
           <p className="text-slate-400 text-sm mb-8 text-center px-10">
             请上传包含“资产编码”、“资产名称”、“规格型号”、“购置日期”等字段的 Excel 文件。<br/>
             系统支持继承旧编码，无需更换实物标签。
           </p>
           <ExcelIO onImport={handleImportedData} label="选择 Excel 文件" variant="primary" />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <ColorCard variant="white" title="导入预览与配置">
             <div className="flex items-center justify-between mb-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-3">
                   <Badge variant="info">待导入: {rawData.length} 行</Badge>
                   <div className="flex items-center gap-2">
                      <input type="checkbox" checked={autoGenMissing} onChange={e => setAutoGenMissing(e.target.checked)} className="w-4 h-4" />
                      <span className="text-xs font-bold text-slate-700">自动为无码资产生成新编码</span>
                   </div>
                </div>
                <Icon name="ShieldCheck" className="text-indigo-400" size={24} />
             </div>

             <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-2xl custom-scrollbar">
                <table className="w-full text-left text-xs">
                   <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10 font-black uppercase">
                      <tr>
                        <th className="px-4 py-2">资产编码</th>
                        <th className="px-4 py-2">资产名称</th>
                        <th className="px-4 py-2">规格型号</th>
                        <th className="px-4 py-2">购置日期</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {rawData.slice(0, 10).map((row, i) => (
                        <tr key={i}>
                           <td className="px-4 py-2 font-mono text-indigo-600">{row['资产编码'] || row['Asset Code'] || <span className="italic text-slate-300">自动生成</span>}</td>
                           <td className="px-4 py-2 font-bold">{row['资产名称'] || row['Name']}</td>
                           <td className="px-4 py-2 text-slate-500">{row['规格型号'] || row['Model']}</td>
                           <td className="px-4 py-2 text-slate-400">{row['购置日期'] || '-'}</td>
                        </tr>
                      ))}
                      {rawData.length > 10 && (
                        <tr><td colSpan={4} className="text-center py-2 text-slate-300 italic">... 以及另外 {rawData.length - 10} 行数据</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </ColorCard>

          <div className="flex gap-3">
             <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>重新上传</Button>
             <Button className="flex-1" onClick={executeImport} isLoading={isExecuting}>
                <Icon name="Check" size={18} className="mr-2" />
                执行数据迁移
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};
