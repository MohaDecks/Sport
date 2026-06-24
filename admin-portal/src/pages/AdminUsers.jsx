import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/Modal';
import PermissionGate from '../components/PermissionGate';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const { user: currentUser, hasPermission } = useAuth();

  const fetchData = async () => {
    const [usersRes, rolesRes] = await Promise.all([
      api.get('/rbac/admins'),
      api.get('/rbac/roles'),
    ]);
    setUsers(usersRes.data.data);
    setRoles(rolesRes.data.data);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setForm({ fullName: '', email: '', phone: '', password: '', adminRole: '', isSuperAdmin: false });
    setEditId(null);
    setModal(true);
  };

  const openEdit = (u) => {
    setForm({
      fullName: u.fullName,
      email: u.email || '',
      phone: u.phone || '',
      password: '',
      adminRole: u.adminRole?._id || '',
      isActive: u.isActive,
      isSuperAdmin: u.isSuperAdmin,
    });
    setEditId(u._id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    if (editId) await api.put(`/rbac/admins/${editId}`, payload);
    else await api.post('/rbac/admins', payload);
    setModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this admin user?')) return;
    await api.delete(`/rbac/admins/${id}`);
    fetchData();
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Admin Users</h2>
          <PermissionGate permission="users.admins.manage">
            <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Admin</button>
          </PermissionGate>
        </div>
        <div className="card-body">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.fullName}</strong>{u.isSuperAdmin && <span className="badge badge-warning" style={{ marginLeft: 8 }}>Super</span>}</td>
                  <td>{u.email || '-'}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.isSuperAdmin ? 'Super Admin' : (u.adminRole?.name || 'No role')}</td>
                  <td>{u.isActive ? 'Active' : 'Inactive'}</td>
                  <td>
                    {hasPermission('users.admins.manage') && !u.isSuperAdmin && (
                      <>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(u)}><FiEdit2 /></button>{' '}
                        {String(u._id) !== String(currentUser?._id) && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u._id)}><FiTrash2 /></button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Admin User' : 'Create Admin User'}
        footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Save</button></>}>
        <div className="form-group"><label>Full Name</label><input className="form-control" value={form.fullName || ''} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
        <div className="form-row">
          <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
        <div className="form-group"><label>{editId ? 'New Password (optional)' : 'Password'}</label><input type="password" className="form-control" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editId} minLength={6} /></div>
        {!form.isSuperAdmin && (
          <div className="form-group"><label>Admin Role</label>
            <select className="form-control" value={form.adminRole || ''} onChange={(e) => setForm({ ...form, adminRole: e.target.value })}>
              <option value="">Select role</option>
              {roles.filter((r) => r.name !== 'Super Admin').map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </div>
        )}
        {currentUser?.isSuperAdmin && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={!!form.isSuperAdmin} onChange={(e) => setForm({ ...form, isSuperAdmin: e.target.checked })} />
            Super Admin (full access)
          </label>
        )}
        {editId && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active account
          </label>
        )}
      </Modal>
    </div>
  );
}
