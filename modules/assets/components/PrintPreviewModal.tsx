
import React from 'react';
import { Modal } from '../../../platform/ui/layout/Modal';
import { Button } from '../../../platform/ui/basic/Button';
import { Icon } from '../../../platform/ui/basic/Icon';
import { AssetLabel } from './AssetLabel';
import { Asset } from '../types';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ isOpen, onClose, assets }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`标签打印预览 (${assets.length} 件)`}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={handlePrint}>
            <Icon name="Printer" size={18} className="mr-2" />
            立即打印
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
          <Icon name="Info" size={20} className="text-amber-500 shrink-0" />
          <div className="text-xs text-amber-800 font-medium space-y-1">
            <p>1. 请确保打印机已装载 50mm * 30mm 标签纸。</p>
            <p>2. 在打印设置中，请将【页边距】设为【无】，【缩放】设为【100%】。</p>
          </div>
        </div>

        {/* Labels Grid for Screen View */}
        <div 
          id="print-area" 
          className="grid grid-cols-2 gap-4 bg-slate-100 p-6 rounded-3xl overflow-y-auto max-h-[400px] border-2 border-slate-200"
        >
          {assets.map(asset => (
            <div key={asset.id} className="shadow-lg hover:ring-2 hover:ring-indigo-500 transition-all cursor-default">
              <AssetLabel asset={asset} />
            </div>
          ))}
        </div>
      </div>

      {/* Actual Hidden Print Container for Paper Formatting */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: auto !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            border: none !important;
            display: block !important;
            column-count: 1 !important;
            overflow: visible !important;
          }
          /* Standard page setup for labels */
          @page {
            size: 50mm 30mm;
            margin: 0;
          }
        }
      `}} />
    </Modal>
  );
};
