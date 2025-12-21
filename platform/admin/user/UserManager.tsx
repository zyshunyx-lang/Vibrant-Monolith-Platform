
import React, { useState, useEffect } from 'react';
import { loadDb, saveDb } from '../../core/db';
import { User, UserRole } from '../../core/types';
import { ColorCard } from '../../ui/layout/ColorCard';
import { Button } from '../../ui/basic/Button';
import { Badge } from '../../ui/basic/Badge';
import { Icon } from '../../ui/basic/Icon';
import { ExcelIO } from '../../ui/complex/ExcelIO';
import { BulkActionToolbar } from '../../ui/complex/BulkActionToolbar';
import { Modal } from '../../ui/layout/Modal';
import { Input } from '../../ui/form/Input';
import { Select } from '../../ui/form/Select';
import { useTranslation } from '../../core/i18n';

export const UserManager: React.FC = () => {
  const { t } = useTranslation();
  const [db, setDb] = useState(loadDb());
  const [users, setUsers] = useState<User[]>(db.sys_config.users);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});

  const reloadData = () => {
    const freshDb = loadDb();
    setDb(freshDb);
    setUsers(freshDb.sys_config.users);
  };

  const persistUsers = (newUsers: User[]) => {
    const newDb = { ...db, sys_config: { ...db.sys_config, users: newUsers } };
    saveDb(newDb);
    setDb(newDb);
    setUsers(newUsers);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === users.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(users.map(u => u.id)));
  };

  // --- Bulk Actions ---
  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedIds.size} users?`)) return;
    const next = users.filter(u => !selectedIds.has(u.id) || u.id === '1');
    persistUsers(next);
    setSelectedIds(new Set());
  };

  const handleBulkToggleStatus = (active: boolean) => {
    const next = users.map(u => selectedIds.has(u.id) && u.id !== '1' ? { ...u, isActive: active } : u);
    persistUsers(next);
    setSelectedIds(new Set());
  };

  const handleExcelImport = (data: any[]) => {
    const importedUsers: User[] = data.map((item, index) => ({
      id: `import-${Date.now()}-${index}`,
      username: String(item.Username || item.username || `user_${index}`),
      realName: String(item.RealName || item.realName || item.Name || 'Unknown'),
      role: (String(item.Role || item.role || 'user').toLowerCase()) as UserRole,
      department: String(item.Department || item.department || 'Imported'),
      phone: String(item.Phone || item.phone || ''),
      isActive: true,
      password: '123'
    }));
    const existing = new Set(users.map(u => u.username));
    const unique = importedUsers.filter(u => !existing.has(u.username));
    persistUsers([...users, ...unique]);
    alert(`Imported ${unique.length} users.`);
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('admin.menu.users')}</h2>
          <p className="text-slate-500 font-medium">Manage members and run batch imports.</p>
        </div>
        <div className="flex gap-3">
           <ExcelIO mode="export_template" templateData={[{ Username: 'admin_test', RealName: 'John Doe', Role: 'user', Department: 'IT', Phone: '138...' }]} label="Template" variant="ghost" />
           <ExcelIO mode="import" onImport={handleExcelImport} label="Import" />
           <Button onClick={() => { setEditingUser({ role: 'user', isActive: true, password: '123' }); setIsEditModalOpen(true); }}>
             <Icon name="UserPlus" size={18} className="mr-2"/> Add User
           </Button>
        </div>
      </header>

      <ColorCard variant="white" className="!p-0 border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input type="checkbox" checked={selectedIds.size === users.length && users.length > 0} onChange={toggleAll} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('user.realName')}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('user.role')}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('user.status')}</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.has(user.id) ? 'bg-indigo-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => toggleSelect(user.id)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full border-2 border-white shadow-sm overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.realName}</div>
                        <div className="text-xs text-slate-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === 'super_admin' ? 'danger' : 'info'}>{t(`role.${user.role}`)}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={user.isActive ? 'success' : 'neutral'}>{user.isActive ? t('user.active') : t('user.inactive')}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingUser(user); setIsEditModalOpen(true); }}><Icon name="Pencil" size={14}/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ColorCard>

      <BulkActionToolbar 
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        actions={[
          { label: 'Activate', icon: 'CheckCircle', onClick: () => handleBulkToggleStatus(true) },
          { label: 'Deactivate', icon: 'MinusCircle', onClick: () => handleBulkToggleStatus(false) },
          { label: 'Delete', icon: 'Trash2', onClick: handleBulkDelete, variant: 'danger' },
        ]}
      />

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="User Profile">
         <div className="space-y-4">
            <Input label="Real Name" value={editingUser.realName || ''} onChange={e => setEditingUser({...editingUser, realName: e.target.value})} />
            <Input label="Username" value={editingUser.username || ''} onChange={e => setEditingUser({...editingUser, username: e.target.value})} disabled={!!editingUser.id} />
            <Select label="Role" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})} options={[{label:'User', value:'user'}, {label:'Admin', value:'duty_admin'}]} />
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={() => {
                const next = editingUser.id ? users.map(u => u.id === editingUser.id ? editingUser as User : u) : [...users, { ...editingUser, id: Date.now().toString() } as User];
                persistUsers(next);
                setIsEditModalOpen(false);
              }}>{t('common.save')}</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};
