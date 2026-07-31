import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import AddUserModal from '../components/modals/AddUserModal';
import { Input, Select } from '../components/common/Input';
import { UserPlus, Search, Edit2, ShieldOff } from 'lucide-react';

const ROLES = ['All', 'admin', 'staff', 'student'];
const DEPTS = ['All', 'Computer Science', 'Data Science & AI', 'Electrical Engineering', 'Mechanical Engineering', 'Administration & Academic Affairs'];

const UserManagementPage = () => {
  const { users } = useTask();
  const { activeRole } = useAuth();
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterDept, setFilterDept] = useState('All');

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'All' || u.role === filterRole;
    const matchDept = filterDept === 'All' || u.department === filterDept;
    return matchSearch && matchRole && matchDept;
  });

  const roleColors = {
    admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    staff: 'bg-blue-100 text-blue-700 border-blue-200',
    student: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage institutional user accounts, roles, and department allocations.</p>
        </div>
        {activeRole === 'admin' && (
          <Button variant="primary" icon={UserPlus} onClick={() => setAddUserOpen(true)}>
            Add New User
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>
          </div>
          <div className="w-36">
            <Select
              label="Role"
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              options={ROLES}
            />
          </div>
          <div className="w-60">
            <Select
              label="Department"
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              options={DEPTS}
            />
          </div>
          <Button variant="outline" onClick={() => { setSearch(''); setFilterRole('All'); setFilterDept('All'); }}>
            Clear
          </Button>
        </div>
      </div>

      {/* Summary Count */}
      <p className="text-xs font-semibold text-slate-500">
        Showing <span className="text-blue-600 font-bold">{filtered.length}</span> of {users.length} users
      </p>

      {/* Users Table */}
      <Table
        columns={[
          { header: 'Name & Email' },
          { header: 'Role' },
          { header: 'Department' },
          { header: 'Contact' },
          { header: 'Status' },
          { header: 'Actions' }
        ]}
        data={filtered}
        emptyText="No users match your filters."
        renderRow={(user) => (
          <>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`; }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3.5">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${roleColors[user.role] || 'bg-slate-100 text-slate-600'}`}>
                {user.role}
              </span>
            </td>
            <td className="px-4 py-3.5 text-xs text-slate-600 font-medium max-w-44">
              <span className="line-clamp-2">{user.department}</span>
            </td>
            <td className="px-4 py-3.5 text-xs text-slate-600">{user.phone || '—'}</td>
            <td className="px-4 py-3.5">
              <StatusBadge status={user.status} />
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit User">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {activeRole === 'admin' && (
                  <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Deactivate">
                    <ShieldOff className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </td>
          </>
        )}
      />

      <AddUserModal isOpen={addUserOpen} onClose={() => setAddUserOpen(false)} />
    </div>
  );
};

export default UserManagementPage;
