
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    role: 'user',
    isActive: true,
    department: 'Platform'
  });

  useEffect(() => {
    const updatedDb = loadDb();
    setDb(updatedDb);
    setUsers(updatedDb.sys_config.users);
  }, []);

  const handleSave = (updatedUsers: User[]) => {
    const newDb = { ...db, sys_config: { ...db.sys_config, users: updatedUsers } };
    saveDb(newDb);
    setDb(newDb);
    setUsers(updatedUsers);
  };

  const deleteUser = (id: string) => {
    if (id === '1') return alert('Cannot delete root admin');
    if (confirm('Are you sure you want to delete this user?')) {
      handleSave(users.filter(u => u.id !== id));
    }
  };

  const addUser = () => {
    if (!newUser.username || !newUser.realName) return alert('Please fill in required fields');
    
    const userToAdd: User = {
      id: Date.now().toString(),
      username: newUser.username!,
      realName: newUser.realName!,
      role: (newUser.role as UserRole) || 'user',
      department: newUser.department || 'Platform',
      phone: newUser.phone || '',
      isActive: true,
      password: '123'
    };

    handleSave([...users, userToAdd]);
    setIsAddModalOpen(false);
    setNewUser({ role: 'user', isActive: true, department: 'Platform' });
  };

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

    // Simple deduplication based on username
    const existingUsernames = new Set(users.map(u => u.username));
    const uniqueImports = importedUsers.filter(u => !existingUsernames.has(u.username));

    if (uniqueImports.length === 0) {
      alert('All users in Excel already exist.');
      return;
    }

    handleSave([...users, ...uniqueImports]);
    alert(`Successfully imported ${uniqueImports.length} users!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h2>
          <p className="text-slate-500 font-medium mt-1">Central directory for all platform identities.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExcelIO mode="import" onImport={handleExcelImport} label="Import Users" />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Icon name="UserPlus" size={18} className="mr-2" />
            Add User
          </Button>
        </div>
      </header>

      <ColorCard className="!p-0 overflow-hidden border-slate-200">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
                        {user.realName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.realName}</div>
                        <div className="text-xs text-slate-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === 'super_admin' ? 'danger' : 'info'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 !p-0">
                        <Icon name="Pencil" size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 !p-0 text-rose-500 hover:bg-rose-50"
                        onClick={() => deleteUser(user.id)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ColorCard>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
        footer={
          <div className="flex gap-3">
             <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
             <Button onClick={addUser}>Create User</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Username (Login Name)" 
            placeholder="e.g. zhangsan" 
            value={newUser.username || ''}
            onChange={e => setNewUser({...newUser, username: e.target.value})}
          />
          <Input 
            label="Real Name" 
            placeholder="e.g. Zhang San" 
            value={newUser.realName || ''}
            onChange={e => setNewUser({...newUser, realName: e.target.value})}
          />
          <Select 
            label="System Role"
            value={newUser.role}
            onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
            options={[
              { label: 'Standard User', value: 'user' },
              { label: 'Duty Admin', value: 'duty_admin' },
              { label: 'Menu Admin', value: 'menu_admin' },
              { label: 'Super Admin', value: 'super_admin' },
            ]}
          />
          <Select 
            label="Department"
            value={newUser.department}
            onChange={e => setNewUser({...newUser, department: e.target.value})}
            options={db.sys_config.departments.map(d => ({ label: d, value: d }))}
          />
          <Input 
            label="Phone Number" 
            placeholder="Optional" 
            value={newUser.phone || ''}
            onChange={e => setNewUser({...newUser, phone: e.target.value})}
          />
        </div>
      </Modal>
    </div>
  );
};
