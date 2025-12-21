import React from 'react';
import { ColorCard } from '../../../platform/ui/layout/ColorCard';
import { Icon } from '../../../platform/ui/basic/Icon';
import { useTranslation } from '../../../platform/core/i18n';

export const MenuView: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('module.menu.name')}</h2>
        <p className="text-slate-500 font-medium">{t('module.menu.desc')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ColorCard variant="white" title="Today's Special">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-6">
              <Icon name="Utensils" size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Coming Soon</h3>
            <p className="text-slate-500 max-w-sm">
              The smart cafeteria system is currently under construction. 
              Check back later for digital meal plans and voting.
            </p>
          </div>
        </ColorCard>

        <ColorCard variant="orange" title="Announcement">
            <div className="text-orange-900 font-medium">
                The new digital menu system is being deployed.
            </div>
        </ColorCard>
      </div>
    </div>
  );
};