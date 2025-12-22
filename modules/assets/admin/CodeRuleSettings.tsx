
import React, { useState } from 'react';
import { loadDb, saveDb } from '../../../platform/core/db';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { Input } from '../../../platform/ui/form/Input';
import { Select } from '../../../platform/ui/form/Select';
import { AssetsModuleSchema, AssetCodeRule } from '../types';

export const CodeRuleSettings: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const assetData = db.modules.assets as AssetsModuleSchema;
  const [rule, setRule] = useState<AssetCodeRule>(assetData.codeRule);

  const handleSave = () => {
    const freshDb = loadDb();
    freshDb.modules.assets.codeRule = rule;
    saveDb(freshDb);
    setDb(freshDb);
    alert('编码规则已更新');
  };

  const generatePreview = () => {
    const datePart = rule.includeDate ? (rule.dateFormat === 'YYYY' ? '2024' : '202401') : '';
    const seqPart = String(rule.currentSeq + 1).padStart(rule.seqDigits, '0');
    return [rule.prefix, datePart, seqPart].filter(Boolean).join(rule.separator);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <ColorCard title="自动编码规则" variant="white">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label="编码前缀" value={rule.prefix} onChange={e => setRule({...rule, prefix: e.target.value})} placeholder="例如: ZC" />
            <Input label="分隔符" value={rule.separator} onChange={e => setRule({...rule, separator: e.target.value})} placeholder="例如: -" />
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">包含日期</p>
              <p className="text-xs text-slate-400">在编码中加入购置年份或月份</p>
            </div>
            <input type="checkbox" checked={rule.includeDate} onChange={e => setRule({...rule, includeDate: e.target.checked})} className="w-5 h-5" />
          </div>

          {rule.includeDate && (
            <Select 
              label="日期格式" 
              options={[{label: '年 (YYYY)', value: 'YYYY'}, {label: '年月 (YYYYMM)', value: 'YYYYMM'}]} 
              value={rule.dateFormat}
              onChange={e => setRule({...rule, dateFormat: e.target.value as any})}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="流水号位数" type="number" value={rule.seqDigits} onChange={e => setRule({...rule, seqDigits: parseInt(e.target.value)})} />
            <div className="space-y-1.5">
               <label className="text-sm font-semibold text-slate-700 ml-1">当前流水号 (校准用)</label>
               <div className="flex gap-2">
                 <Input type="number" value={rule.currentSeq} onChange={e => setRule({...rule, currentSeq: parseInt(e.target.value)})} className="flex-1" />
                 <Button variant="secondary" size="sm" onClick={() => setRule({...rule, currentSeq: 0})}>重置</Button>
               </div>
            </div>
          </div>

          <div className="p-6 bg-indigo-50 rounded-[32px] border border-indigo-100 border-dashed">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">生成预览 (下一件资产)</p>
            <p className="text-2xl font-black text-indigo-600 tracking-tight">{generatePreview()}</p>
          </div>

          <div className="pt-4">
            <Button className="w-full" onClick={handleSave}>
              <Icon name="Save" size={18} className="mr-2" />
              应用配置
            </Button>
          </div>
        </div>
      </ColorCard>
    </div>
  );
};
