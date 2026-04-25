import React, { useState, useEffect } from 'react';
import { usersAPI, authAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useApi } from '../../hooks/useApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resetModal, setResetModal] = useState({ open: false, user: null });
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [newPassword, setNewPassword] = useState('');
  const [editForm, setEditForm] = useState({ name: '', phone: '', is_active: true });
  const { execute, loading: saving } = useApi();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const r = await usersAPI.getStudents({ search });
      setStudents(r.data.data || []);
    } catch { toast.error('Failed to load students.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [search]);

  const openEdit = (row) => {
    setEditForm({ name: row.name, phone: row.phone || '', is_active: row.is_active });
    setEditModal({ open: true, data: row });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    await execute(
      () => usersAPI.update(editModal.data.id, editForm),
      { successMsg: 'Student updated!', onSuccess: () => { setEditModal({ open: false, data: null }); fetchStudents(); } }
    );
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    await execute(
      () => authAPI.adminResetPassword(resetModal.user.id, { newPassword }),
      { successMsg: `Password reset for ${resetModal.user.name}!`, onSuccess: () => { setResetModal({ open: false, user: null }); setNewPassword(''); } }
    );
  };

  const handleToggle = async (row) => {
    await execute(
      () => usersAPI.update(row.id, { is_active: !row.is_active }),
      { successMsg: `Student ${row.is_active ? 'deactivated' : 'activated'}.`, onSuccess: fetchStudents }
    );
  };

  const columns = [
    {
      key: 'name', label: 'Student',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">{v?.charAt(0)}</div>
          <div><div className="font-semibold text-sm">{v}</div><div className="text-xs text-gray-400">{row.email}</div></div>
        </div>
      )
    },
    { key: 'phone', label: 'Phone', render: v => v || '—' },
    { key: 'country', label: 'Country', render: v => v ? <span className="badge badge-info text-xs">{v}</span> : '—' },
    {
      key: 'payment_status', label: 'Payment',
      render: v => v ? <span className={`badge ${v === 'paid' ? 'badge-success' : 'badge-warning'}`}>{v}</span> : <span className="badge badge-info">none</span>
    },
    { key: 'total_sessions', label: 'Sessions', render: v => <span className="font-semibold text-primary">{v || 0}</span> },
    { key: 'created_at', label: 'Joined', render: v => format(new Date(v), 'MMM d, yyyy') },
    {
      key: 'is_active', label: 'Status',
      render: (v, row) => (
        <button onClick={() => handleToggle(row)} className={`badge cursor-pointer ${v ? 'badge-success' : 'badge-error'}`}>{v ? 'Active' : 'Inactive'}</button>
      )
    },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="text-primary hover:underline text-sm font-medium">Edit</button>
          <button onClick={() => { setResetModal({ open: true, user: row }); setNewPassword(''); }} className="text-amber-600 hover:underline text-sm font-medium">Reset PW</button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Students</h1>
          <p className="text-secondary/60 text-sm mt-0.5">{students.length} total • Students register themselves at <span className="font-mono text-primary">/register</span></p>
        </div>
      </div>

      <div className="card bg-blue-50 border border-blue-100 !p-4">
        <p className="text-sm text-blue-800 font-medium">
          ℹ️ Students and teachers register their own accounts at the <a href="/register" target="_blank" className="underline font-bold">/register</a> page. You can manage, edit, or reset passwords here.
        </p>
      </div>

      <div className="card">
        <div className="mb-4">
          <input className="input max-w-xs" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <DataTable columns={columns} data={students} loading={loading} emptyMessage="No students yet. Share the registration link!" />
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, data: null })} title="Edit Student">
        <form onSubmit={handleEditSave} className="space-y-4">
          <div><label className="label">Full Name</label><input className="input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><label className="label">Phone</label><input className="input" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-primary" />
            <label htmlFor="active" className="font-semibold text-secondary text-sm cursor-pointer">Account Active</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditModal({ open: false, data: null })} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={resetModal.open} onClose={() => setResetModal({ open: false, user: null })} title="Reset Password">
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-sm text-amber-800">Resetting password for <strong>{resetModal.user?.name}</strong> ({resetModal.user?.email})</p>
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setResetModal({ open: false, user: null })} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm bg-amber-600 hover:bg-amber-700">{saving ? 'Resetting...' : 'Reset Password'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
