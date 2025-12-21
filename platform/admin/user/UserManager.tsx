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

export const UserManager: React.FC = () => {
  const [db, setDb] = useState(loadDb());
  const [users, setUsers] = useState<User[]>(db.sys_config.users);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});

  // 重新加载数据
  const reloadData = () => {
    const freshDb = loadDb();
    setDb(freshDb);
    setUsers(freshDb.sys_config.users);
  };

  useEffect(() => { reloadData(); }, []);

  const persistUsers = (newUsers: User[]) => {
    const newDb = { ...db, sys_config: { ...db.sys_config, users: newUsers } };
    saveDb(newDb);
    reloadData(); 
  };

  // ★ 核心修复：防止事件冒泡，增加删除确认
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // ★ 防止点击行触发其他事件
    e.preventDefault();

    if (id === '1') {
      alert('Cannot delete root admin');
      return;
    }
    
    // 使用原生 confirm，最稳健
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const filtered = users.filter(u => u.id !== id);
      persistUsers(filtered);
    }
  };

  const openAdd = () => {
    setEditingUser({ role: 'user', isActive: true, department: 'Platform' });
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
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
        password: '123'
      } as User);
    }
    persistUsers(nextUsers);
    setIsModalOpen(false);
  };

  // Excel 导入逻辑
  const handleExcelImport = (data: any[]) => {
    const importedUsers: User[] = data.map((item, index) => ({
      id: `import-${Date.now()}-${index}`,
      username: item.Username || item.username || `user_${index}`,
      realName: item.RealName || item.realName || item.Name || 'Unknown',
      role: (item.Role || item.role || 'user').toLowerCase() as UserRole,
      department: item.Department || item.department || 'Imported',
      phone: String(item.Phone || item.phone || ''),
      isActive: true,
      password: '123'
    }));

    const existingUsernames = new Set(users.map(u => u.username));
    const uniqueImports = importedUsers.filter(u => !existingUsernames.has(u.username));

    if (uniqueImports.length === 0) {
      alert('All users in Excel already exist.');
      return;
    }

    persistUsers([...users, ...uniqueImports]);
    alert(`Successfully imported ${uniqueImports.length} users!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-900">User Management</h2>
        <div className="flex gap-3">
           <ExcelIO mode="import" onImport={handleExcelImport} label="Import Users" />
           <Button onClick={openAdd}><Icon name="UserPlus" size={18} className="mr-2"/> Add User</Button>
        </div>
      </header>

      <ColorCard variant="white" className="!p-0 border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Role</th>
              <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{user.realName}</div>
                  <div className="text-xs text-slate-400">@{user.username}</div>
                </td>
                <td className="px-6 py-4"><Badge variant="info">{user.role}</Badge></td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                    <Icon name="Pencil" size={14}/>
                  </Button>
                  {/* ★ 修复：传入 event 对象以阻止冒泡 */}
                  <Button variant="ghost" size="sm" className="text-rose-500" onClick={(e) => handleDelete(e, user.id)}>
                    <Icon name="Trash2" size={14}/>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ColorCard>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser.id ? "Edit" : "Add"} footer={
        <Button onClick={handleSave}>Save User</Button>
      }>
        <div className="space-y-4">
          <Input label="Real Name" value={editingUser.realName || ''} onChange={e => setEditingUser({...editingUser, realName: e.target.value})} />
          <Input label="Username" value={editingUser.username || ''} onChange={e => setEditingUser({...editingUser, username: e.target.value})} />
           <Select 
            label="Role"
            value={editingUser.role}
            onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}
            options={[{label:'User',value:'user'}, {label:'Super Admin',value:'super_admin'}, {label:'Duty Admin',value:'duty_admin'}]}
          />
        </div>
      </Modal>
    </div>
  );
};