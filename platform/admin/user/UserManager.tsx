
import React, { useState, useMemo } from 'react';
import { loadDb, saveDb } from '../../core/db';
import { User, UserRole, ModuleId } from '../../core/types';
import { AllModules } from '../../../modules/index';
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

  // 获取系统全局开启的模块（白名单），用于在给用户分配权限时进行过滤
  const enabledModules = useMemo(() => db.sys_config.enabledModules || [], [db]);
  const activeModuleConfigs = useMemo(() => 
    AllModules.filter(m => enabledModules.includes(m.id as ModuleId)), 
    [enabledModules]
  );

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

  const handleBulkDelete = () => {
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 名用户吗？`)) return;
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
      username: String(item.账号名 || item.Username || item.username || `user_${index}`),
      realName: String(item.姓名 || item.RealName || item.realName || item.Name || '未知'),
      role: (String(item.权限 || item.Role || item.role || 'user').toLowerCase()) as UserRole,
      department: String(item.部门 || item.Department || item.department || '外部导入'),
      phone: String(item.电话 || item.Phone || item.phone || ''),
      isActive: true,
      password: '123',
      allowedModules: [...enabledModules] // 默认赋予当前所有开启模块的权限
    }));
    const existing = new Set(users.map(u => u.username));
    const unique = importedUsers.filter(u => !existing.has(u.username));
    persistUsers([...users, ...unique]);
    alert(`成功导入 ${unique.length} 名新用户。`);
  };

  const toggleModulePermission = (moduleId: ModuleId) => {
    // 超管默认拥有所有权限，不允许手动修改
    if (editingUser.role === 'super_admin') return;
    
    const current = editingUser.allowedModules || [];
    const next = current.includes(moduleId)
      ? current.filter(id => id !== moduleId)
      : [...current, moduleId];
    setEditingUser({ ...editingUser, allowedModules: next });
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">成员权限管理</h2>
          <p className="text-slate-500 font-medium">维护院内成员档案，并为不同岗位的成员分配<b>精细化模块访问权限</b>。</p>
        </div>
        <div className="flex gap-3">
           <ExcelIO mode="export_template" templateData={[{ 姓名: '张三', 账号名: 'zhangsan', 权限: 'user', 部门: '技术部', 电话: '138...' }]} label="下载模版" variant="ghost" />
           <ExcelIO mode="import" onImport={handleExcelImport} label="批量导入" />
           <Button onClick={() => { setEditingUser({ role: 'user', isActive: true, password: '123', allowedModules: [] }); setIsEditModalOpen(true); }}>
             <Icon name="UserPlus" size={18} className="mr-2"/> 新增用户
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
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">姓名 / 账号</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">系统角色</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">模块访问权限</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">状态</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">操作</th>
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
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                      {user.role === 'super_admin' ? (
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">FULL PLATFORM ACCESS</span>
                      ) : (
                        (user.allowedModules || []).map(mid => {
                          const m = AllModules.find(am => am.id === mid);
                          return m ? (
                            <div key={mid} title={m.name} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200/50">
                              <Icon name={m.icon} size={14} />
                            </div>
                          ) : null;
                        })
                      )}
                      {user.role !== 'super_admin' && (!user.allowedModules || user.allowedModules.length === 0) && (
                        <span className="text-[10px] text-slate-300 italic">未分配模块</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={user.isActive ? 'success' : 'neutral'}>{user.isActive ? '正常' : '冻结'}</Badge>
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
          { label: '批量激活', icon: 'CheckCircle', onClick: () => handleBulkToggleStatus(true) },
          { label: '批量禁用', icon: 'MinusCircle', onClick: () => handleBulkToggleStatus(false) },
          { label: '批量删除', icon: 'Trash2', onClick: handleBulkDelete, variant: 'danger' },
        ]}
      />

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="用户档案及精细化权限编辑">
         <div className="space-y-6">
            <section className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <Icon name="Fingerprint" size={12} />
                身份基准信息
              </h4>
              <Input label="真实姓名" placeholder="成员姓名..." value={editingUser.realName || ''} onChange={e => setEditingUser({...editingUser, realName: e.target.value})} />
              <Input label="系统登录账号" placeholder="用于唯一登录标识..." value={editingUser.username || ''} onChange={e => setEditingUser({...editingUser, username: e.target.value})} disabled={!!editingUser.id} />
              <Select 
                label="组织角色 (Role)" 
                value={editingUser.role} 
                onChange={e => {
                  const newRole = e.target.value as UserRole;
                  // 切换角色时，如果是超管，自动补齐所有权限
                  const modules = newRole === 'super_admin' ? [...enabledModules] : (editingUser.allowedModules || []);
                  setEditingUser({...editingUser, role: newRole, allowedModules: modules});
                }} 
                options={[
                  {label:'普通员工 (User)', value:'user'}, 
                  {label:'值班管理员 (Duty Admin)', value:'duty_admin'},
                  {label:'食堂管理员 (Menu Admin)', value:'menu_admin'},
                  {label:'超级管理员 (Super Admin)', value:'super_admin'}
                ]} 
              />
            </section>

            <section className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex justify-between items-center">
                <span className="flex items-center gap-2"><Icon name="ShieldCheck" size={12} /> 模块访问控制 (ACL)</span>
                {editingUser.role === 'super_admin' && <Badge variant="info" className="!text-[9px]">全权限锁定</Badge>}
              </h4>
              
              <div className={`grid grid-cols-2 gap-2 p-4 rounded-3xl border transition-all ${editingUser.role === 'super_admin' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-inner'}`}>
                {activeModuleConfigs.map(m => {
                  const isChecked = editingUser.role === 'super_admin' || (editingUser.allowedModules || []).includes(m.id as ModuleId);
                  return (
                    <label 
                      key={m.id} 
                      className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                        editingUser.role === 'super_admin' 
                        ? 'cursor-not-allowed' 
                        : 'cursor-pointer hover:bg-indigo-50 group'
                      } ${isChecked && editingUser.role !== 'super_admin' ? 'bg-indigo-50/30' : ''}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        disabled={editingUser.role === 'super_admin'}
                        onChange={() => toggleModulePermission(m.id as ModuleId)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 w-4 h-4"
                      />
                      <div className="flex items-center gap-2 min-w-0">
                         <Icon name={m.icon} size={14} className={isChecked ? 'text-indigo-600' : 'text-slate-300'} />
                         <span className={`text-xs font-bold truncate ${isChecked ? 'text-slate-800' : 'text-slate-400'}`}>{m.name}</span>
                      </div>
                    </label>
                  );
                })}
                {activeModuleConfigs.length === 0 && (
                  <div className="col-span-2 py-4 text-center text-xs text-slate-400 italic">系统全局未开启任何业务模块</div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 px-2 italic font-medium">提示：只有在系统管理中“全局开启”的模块才会出现在此列表中。</p>
            </section>

            <div className="flex gap-2 justify-end pt-6 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>取消</Button>
              <Button onClick={() => {
                // 保存前最后确认：如果是超管，强制写入所有已开启模块 ID
                const modules = editingUser.role === 'super_admin' ? [...enabledModules] : (editingUser.allowedModules || []);
                const dataToSave = { ...editingUser, allowedModules: modules } as User;
                
                const next = editingUser.id 
                  ? users.map(u => u.id === editingUser.id ? dataToSave : u) 
                  : [...users, { ...dataToSave, id: Date.now().toString() }];
                
                persistUsers(next);
                setIsEditModalOpen(false);
              }}>更新成员档案</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};
