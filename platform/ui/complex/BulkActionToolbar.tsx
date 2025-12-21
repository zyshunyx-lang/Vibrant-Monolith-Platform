
import React from 'react';
import { Button } from '../basic/Button';
import { Icon, IconName } from '../basic/Icon';

interface BulkAction {
  label: string;
  icon: IconName;
  onClick: () => void;
  variant?: 'primary' | 'danger' | 'secondary' | 'ghost';
}

interface BulkActionToolbarProps {
  selectedCount: number;
  onClear: () => void;
  actions: BulkAction[];
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  onClear,
  actions
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-slate-900 text-white px-6 py-4 rounded-[28px] shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-black">
            {selectedCount}
          </div>
          <span className="text-sm font-bold whitespace-nowrap">Items Selected</span>
          <button 
            onClick={onClear}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              size="sm"
              variant={action.variant || 'ghost'}
              onClick={action.onClick}
              className={`
                !rounded-xl px-4 py-2
                ${action.variant === 'ghost' ? 'text-white hover:bg-white/10' : ''}
              `}
            >
              <Icon name={action.icon} size={14} className="mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
