
import React, { useState } from 'react';
import { ColorCard } from '../layout/ColorCard';
import { Button } from '../basic/Button';
import { Icon } from '../basic/Icon';
import { Select } from '../form/Select';
import { Modal } from '../layout/Modal';
import { Input } from '../form/Input';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'rename' | 'save_as' | null>(null);
  const [inputValue, setInputValue] = useState('');

  const openModal = (type: 'rename' | 'save_as') => {
    setActionType(type);
    setInputValue(type === 'rename' ? currentProfileName : '');
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (!inputValue.trim() || !actionType) return;
    
    if (actionType === 'rename') {
      onRename(inputValue.trim());
    } else {
      onSaveAs(inputValue.trim());
    }
    
    setIsModalOpen(false);
  };

  return (
    <>
      <ColorCard variant="indigo" className={`!p-4 shadow-xl shadow-indigo-100 ${className}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Icon name="Layers" size={24} className="text-white" />
            </div>
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest leading-none mb-1">当前生效方案</p>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{currentProfileName}</h3>
                <button 
                  onClick={() => openModal('rename')} 
                  className="text-white/40 hover:text-white transition-colors p-1"
                >
                  <Icon name="Pencil" size={14} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[180px]">
              <Select 
                options={[
                  { label: '-- 加载已存方案 --', value: '' },
                  ...profiles.map(p => ({ label: p.name, value: p.id }))
                ]}
                onChange={(e) => e.target.value && onLoad(e.target.value)}
                className="!py-2 !text-xs !bg-white/10 !border-white/20 !text-white [&>option]:text-slate-900"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20" onClick={onSave}>
                <Icon name="Save" size={16} className="mr-2"/> 保存
              </Button>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10 border border-white/20" 
                onClick={() => openModal('save_as')}
              >
                <Icon name="Copy" size={16} className="mr-2"/> 另存为
              </Button>
            </div>
          </div>
        </div>
      </ColorCard>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={actionType === 'rename' ? '重命名方案' : '另存为新方案'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button onClick={handleConfirm}>确认</Button>
          </div>
        }
      >
        <div className="py-2">
          <Input 
            label="方案名称" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="请输入方案名称..."
            autoFocus
          />
        </div>
      </Modal>
    </>
  );
};
