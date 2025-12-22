
import React from 'react';
import QRCode from 'react-qr-code';
import { Asset } from '../types';

interface AssetLabelProps {
  asset: Asset;
  companyName?: string;
}

/**
 * AssetLabel Component
 * Optimized for 50mm x 30mm thermal label printers.
 * High contrast, no borders, precise physical dimensions.
 */
export const AssetLabel: React.FC<AssetLabelProps> = ({ asset, companyName = "企业资产管理中心" }) => {
  return (
    <div 
      className="bg-white text-black flex overflow-hidden p-2 select-none print:break-inside-avoid"
      style={{ 
        width: '50mm', 
        height: '30mm',
        boxSizing: 'border-box',
        pageBreakInside: 'avoid'
      }}
    >
      {/* Left: QR Code */}
      <div className="w-[18mm] flex flex-col items-center justify-center shrink-0 mr-2">
        <QRCode 
          value={`ASSET:${asset.id}`} 
          size={50} 
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          viewBox={`0 0 50 50`}
        />
        <span className="text-[6px] mt-0.5 font-bold uppercase tracking-tighter opacity-50">Scan to Audit</span>
      </div>

      {/* Right: Asset Info */}
      <div className="flex-1 flex flex-col justify-between py-0.5 overflow-hidden">
        <div>
          <p className="text-[7px] font-black text-slate-400 uppercase leading-none mb-1 truncate">
            {companyName}
          </p>
          <h4 className="text-[10px] font-black leading-tight line-clamp-2 uppercase">
            {asset.name}
          </h4>
        </div>

        <div className="border-t border-black/10 pt-1 mt-auto">
          <p className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Inventory Code</p>
          <p className="text-[11px] font-black font-mono leading-none tracking-tight">
            {asset.assetCode}
          </p>
        </div>
      </div>
    </div>
  );
};
