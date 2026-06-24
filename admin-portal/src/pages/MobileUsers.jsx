import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/Modal';
import PermissionGate from '../components/PermissionGate';
import { useAuth } from '../context/AuthContext';

export default function MobileUsers() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const { hasPermission } = useAuth();

  const fetchData = async () => {
    const params = roleFilter ? { role: roleFilter } : {};
    const [usersRes, teamsRes, coachesRes] = await Promise.all([
      api.get('/rbac/mobile-users', { params }),
      api.get('/teams', { params: { limit: 100 } }),
      api.get('/coaches', { params: { limit: 100 } }),
    ]);
    setUsers(usersRes.data.data);
    setTeams(teamsRes.data.data);
    setCoaches(coachesRes.data.data);
  };

  useEffect(() => { fetchData(); }, [roleFilter]);

  const openCreate = () => {
    setForm({ fullName: '', email: '', phone: '', password: '', role: 'coach', team: '', coach: '' });
    setEditId(null);
    setModal(true);
  };

  const openEdit = (u) => {
    setForm({
      fullName: u.fullName,
      email: u.email || '',
      phone: u.phone || '',
      password: '',
      role: u.role,
      team: u.team?._id || u.team || '',
      coach: u.coach?._id || u.coach || '',
      isActive: u.isActive,
    });
    setEditId(u._id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    if (editId) await api.put(`/rbac/mobile-users/${editId}`, payload);
    else await api.post('/rbac/mobile-users', payload);
    setModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/rbac/mobile-users/${id}`);
    fetchData();
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Coach & Team Users (Mobile App)</h2>
          <div className="filters">
            <select className="form-control" style={{ width: 'auto' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All</option>
              <option value="coach">Coach</option>
              <option value="team">Team</option>
            </select>
            <PermissionGate permission="users.mobile.manage">
              <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add User</button>
            </PermissionGate>
          </div>
        </div>
        <div className="card-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            Users-ka halkan la abuuro waxay galaan <strong>mobile app</strong> kaliya — ma geli karaan admin portal.
          </p>
          <table>
            <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Phone</th><th>Team</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.fullName}</strong></td>
                  <td><span className={`badge ${u.role === 'coach' ? 'badge-info' : 'badge-warning'}`}>{u.role}</span></td>
                  <td>{u.email || '-'}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.team?.name || '-'}</td>
                  <td>{u.isActive ? 'Active' : 'Inactive'}</td>
                  <td>
                    {hasPermission('users.mobile.manage') && (
                      <>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(u)}><FiEdit2 /></button>{' '}
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u._id)}><FiTrash2 /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Mobile User' : 'Create Coach/Team User'}
        footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Save</button></>}>
        <div className="form-group"><label>Full Name</label><input className="form-control" value={form.fullName || ''} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
        <div className="form-row">
          <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
        <div className="form-group"><label>{editId ? 'New Password (optional)' : 'Password'}</label><input type="password" className="form-control" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editId} minLength={6} /></div>
        <div className="form-group"><label>Role</label>
          <select className="form-control" value={form.role || 'coach'} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="coach">Coach</option>
            <option value="team">Team</option>
          </select>
        </div>
        {form.role === 'team' && (
          <div className="form-group"><label>Team</label>
            <select className="form-control" value={form.team || ''} onChange={(e) => setForm({ ...form, team: e.target.value })}>
              <option value="">Select team</option>
              {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
        )}
        {form.role === 'coach' && (
          <div className="form-group"><label>Coach Profile</label>
            <select className="form-control" value={form.coach || ''} onChange={(e) => setForm({ ...form, coach: e.target.value })}>
              <option value="">Select coach</option>
              {coaches.map((c) => <option key={c._id} value={c._id}>{c.fullName}</option>)}
            </select>
          </div>
        )}
        {editId && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active account
          </label>
        )}
      </Modal>
    </div>
  );
}
