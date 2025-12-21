import React, { useState, useEffect } from 'react';
import { loadDb, saveDb } from '../../core/db';
import { User, UserRole } from '../../core/types';
import { ColorCard } from '../../ui/layout/ColorCard';
import { Button } from '../../ui/basic/Button';
import { Badge } from '../../ui/basic/Badge';
import { Icon } from '../../ui/basic/Icon';
import { ExcelIO } from '../../ui/complex/ExcelIO';
import { Modal } from '../../ui/layout/Modal';
import { Input } from '../../ui/form/Input';
import { Select } from '../../ui/form/Select';
import { useTranslation } from '../../core/i18n';

export const UserManager: React.FC = () => {
  const { t } = useTranslation();
  const [db, setDb] = useState(loadDb());
  const [users, setUsers] = useState<User[]>(db.sys_config.users);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const reloadData = () => {
    const freshDb = loadDb();
    setDb(freshDb);
    setUsers(freshDb.sys_config.users);
  };

  useEffect(() => { reloadData(); }, []);

  const persistUsers = (newUsers: User[]) => {
    const newDb = { ...db, sys_config: { ...db.sys_config, users: newUsers } };
    saveDb(newDb);
    setDb(newDb);
    setUsers(newUsers);
  };

  const toggleUserStatus = (id: string) => {
    if (id === '1') return;
    const next = users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
    persistUsers(next);
  };

  const initiateDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (id === '1') {
      alert('Security Alert: Cannot delete the root Super Admin.');
      return;
    }
    setDeleteTargetId(id);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      const filtered = users.filter(u => u.id !== deleteTargetId);
      persistUsers(filtered);
      setDeleteTargetId(null);
    }
  };

  const openAdd = () => {
    setEditingUser({ 
      role: 'user', 
      isActive: true, 
      department: 'Operations',
      password: '123' 
    });
    setIsEditModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    if (!editingUser.username || !editingUser.realName) return alert('Missing fields');
    
    let nextUsers = [...users];
    if (editingUser.id) {
      nextUsers = nextUsers.map(u => u.id === editingUser.id ? (editingUser as User) : u);
    } else {
      nextUsers.push({
        ...editingUser,
        id: Date.now().toString(),
      } as User);
    }
    persistUsers(nextUsers);
    setIsEditModalOpen(false);
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

    const existingUsernames = new Set(users.map(u => u.username));
    const uniqueImports = importedUsers.filter(u => !existingUsernames.has(u.username));

    if (uniqueImports.length === 0) return alert('No new users found.');
    persistUsers([...users, ...uniqueImports]);
    alert(`Successfully imported ${uniqueImports.length} users.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('admin.menu.users')}</h2>
          <p className="text-slate-500 font-medium">Manage organization members and permissions.</p>
        </div>
        <div className="flex gap-3">
           <ExcelIO mode="import" onImport={handleExcelImport} label="Import Excel" />
           <Button onClick={openAdd}><Icon name="UserPlus" size={18} className="mr-2"/> Add User</Button>
        </div>
      </header>

      <ColorCard variant="white" className="!p-0 border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('user.realName')}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('user.phone')}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('user.role')}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('user.status')}</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-indigo-600 font-black overflow-hidden border-2 border-white shadow-sm">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.realName}</div>
                        <div className="text-xs text-slate-400 font-mono">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600">{user.phone || '--'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === 'super_admin' ? 'danger' : 'info'}>
                      {t(`role.${user.role}`)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleUserStatus(user.id)}
                      className={`
                        px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all
                        ${user.isActive 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                          : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}
                        ${user.id === '1' ? 'cursor-not-allowed opacity-50' : ''}
                      `}
                    >
                      {user.isActive ? t('user.active') : t('user.inactive')}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(user)} className="text-slate-400 hover:text-indigo-600">
                        <Icon name="Pencil" size={14}/>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50" 
                        onClick={(e) => initiateDelete(e, user.id)}
                      >
                        <Icon name="Trash2" size={14}/>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ColorCard>

      {/* Edit Modal Expanded */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={editingUser.id ? "Edit User Profile" : "Create New User"} footer={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSave}>{t('common.save')}</Button>
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t('user.realName')} value={editingUser.realName || ''} onChange={e => setEditingUser({...editingUser, realName: e.target.value})} required />
          <Input label={t('user.username')} value={editingUser.username || ''} onChange={e => setEditingUser({...editingUser, username: e.target.value})} disabled={!!editingUser.id} required />
          <Input label={t('user.phone')} value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} placeholder="138xxxxxxxx" />
          <Input label={t('user.dept')} value={editingUser.department || ''} onChange={e => setEditingUser({...editingUser, department: e.target.value})} />
          
          <div className="col-span-2">
            <Select 
              label={t('user.role')}
              value={editingUser.role}
              onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}
              options={[
                {label: t('role.user'), value:'user'}, 
                {label: t('role.super_admin'), value:'super_admin'}, 
                {label: t('role.duty_admin'), value:'duty_admin'},
                {label: t('role.menu_admin'), value:'menu_admin'}
              ]}
            />
          </div>

          <div className="col-span-2 pt-2">
            <Input 
              label={t('user.password')} 
              type="password" 
              value={editingUser.password || ''} 
              onChange={e => setEditingUser({...editingUser, password: e.target.value})} 
              placeholder="Enter new password"
            />
            <p className="text-[10px] text-slate-400 mt-1 italic">Default for new users is "123".</p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTargetId} onClose={() => setDeleteTargetId(null)} title="Delete User" footer={
          <div className="flex gap-3">
             <Button variant="secondary" onClick={() => setDeleteTargetId(null)}>{t('common.cancel')}</Button>
             <Button variant="danger" onClick={confirmDelete}>{t('common.delete')}</Button>
          </div>
      }>
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
            <Icon name="AlertTriangle" size={32} />
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-2">Are you sure?</h4>
          <p className="text-slate-500 text-sm">
            This will permanently remove the user and all their associated data. This action is irreversible.
          </p>
        </div>
      </Modal>
    </div>
  );
};