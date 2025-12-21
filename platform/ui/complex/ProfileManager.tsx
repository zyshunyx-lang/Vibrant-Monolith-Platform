
import React from 'react';
import { ColorCard } from '../layout/ColorCard';
import { Button } from '../basic/Button';
import { Icon } from '../basic/Icon';
import { Select } from '../form/Select';

interface Profile {
  id: string;
  name: string;
}

interface ProfileManagerProps {
  currentProfileName: string;
  profiles: Profile[];
  onSave: () => void;
  onSaveAs: (newName: string) => void;
  onRename: (newName: string) => void;
  onLoad: (profileId: string) => void;
  className?: string;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  currentProfileName,
  profiles,
  onSave,
  onSaveAs,
  onRename,
  onLoad,
  className = ''
}) => {
  const handleRenameClick = () => {
    const name = prompt('Enter new profile name:', currentProfileName);
    if (name && name.trim()) onRename(name.trim());
  };

  const handleSaveAsClick = () => {
    const name = prompt('Save current configuration as:');
    if (name && name.trim()) onSaveAs(name.trim());
  };

  return (
    <ColorCard variant="indigo" className={`!p-4 shadow-xl shadow-indigo-100 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Icon name="Layers" size={24} className="text-white" />
          </div>
          <div>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Current Scheme</p>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white">{currentProfileName}</h3>
              <button onClick={handleRenameClick} className="text-white/40 hover:text-white transition-colors p-1">
                <Icon name="Pencil" size={14} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[180px]">
            <Select 
              options={[
                { label: '-- Load Saved Scheme --', value: '' },
                ...profiles.map(p => ({ label: p.name, value: p.id }))
              ]}
              onChange={(e) => e.target.value && onLoad(e.target.value)}
              className="!py-2 !text-xs !bg-white/10 !border-white/20 !text-white [&>option]:text-slate-900"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20" onClick={onSave}>
              <Icon name="Save" size={16} className="mr-2"/> Save
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20" onClick={handleSaveAsClick}>
              <Icon name="Copy" size={16} className="mr-2"/> Save As
            </Button>
          </div>
        </div>
      </div>
    </ColorCard>
  );
};
