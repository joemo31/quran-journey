import React, { useState, useEffect } from 'react';
import { usersAPI, authAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useApi } from '../../hooks/useApi';
import { format } from 'date-fns';

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [resetModal, setResetModal] = useState({ open: false, user: null });
  const [editForm, setEditForm] = useState({ name: '', phone: '', specialization: '', bio: '', is_active: true });
  const [newPassword, setNewPassword] = useState('');
  const { execute, loading: saving } = useApi();

  const fetch = async () => {
    setLoading(true);
    try { const r = await usersAPI.getTeachers(); setTeachers(r.data.data || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openEdit = row => {
    setEditForm({ name: row.name, phone: row.phone || '', specialization: row.specialization || '', bio: row.bio || '', is_active: row.is_active });
    setEditModal({ open: true, data: row });
  };

  const handleEditSave = async e => {
    e.preventDefault();
    await execute(
      () => usersAPI.update(editModal.data.id, editForm),
      { successMsg: 'Teacher updated!', onSuccess: () => { setEditModal({ open: false, data: null }); fetch(); } }
    );
  };

  const handleResetPassword = async e => {
    e.preventDefault();
    await execute(
      () => authAPI.adminResetPassword(resetModal.user.id, { newPassword }),
      { successMsg: `Password reset for ${resetModal.user.name}!`, onSuccess: () => { setResetModal({ open: false, user: null }); setNewPassword(''); } }
    );
  };

  const columns = [
    {
      key: 'name', label: 'Teacher',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">{v?.charAt(0)}</div>
          <div><div className="font-semibold text-sm">{v}</div><div className="text-xs text-gray-400">{row.email}</div></div>
        </div>
      )
    },
    { key: 'specialization', label: 'Specialization', render: v => v || '—' },
    { key: 'total_sessions', label: 'Sessions', render: v => <span className="font-semibold text-primary">{v || 0}</span> },
    { key: 'created_at', label: 'Joined', render: v => format(new Date(v), 'MMM d, yyyy') },
    { key: 'is_active', label: 'Status', render: v => <span className={`badge ${v ? 'badge-success' : 'badge-error'}`}>{v ? 'Active' : 'Inactive'}</span> },
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
          <h1 className="font-display text-2xl font-bold text-primary">Teachers</h1>
          <p className="text-secondary/60 text-sm mt-0.5">{teachers.length} teachers registered</p>
        </div>
      </div>

      <div className="card bg-blue-50 border border-blue-100 !p-4">
        <p className="text-sm text-blue-800 font-medium">
          ℹ️ Teachers self-register at <a href="/register" target="_blank" className="underline font-bold">/register</a> — selecting the "Teacher" role. Manage or reset their passwords below.
        </p>
      </div>

      <div className="card">
        <DataTable columns={columns} data={teachers} loading={loading} emptyMessage="No teachers yet." />
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, data: null })} title="Edit Teacher">
        <form onSubmit={handleEditSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input className="input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div><label className="label">Phone</label><input className="input" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></div>
          </div>
          <div><label className="label">Specialization</label><input className="input" value={editForm.specialization} onChange={e => setEditForm(f => ({ ...f, specialization: e.target.value }))} placeholder="e.g. Tajweed & Memorization" /></div>
          <div><label className="label">Bio</label><textarea className="input resize-none" rows={3} value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ta" checked={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-primary" />
            <label htmlFor="ta" className="font-semibold text-secondary text-sm cursor-pointer">Account Active</label>
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
            <p className="text-sm text-amber-800">Resetting password for <strong>{resetModal.user?.name}</strong></p>
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
