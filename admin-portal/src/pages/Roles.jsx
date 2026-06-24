import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import PermissionGate from '../components/PermissionGate';
import { useAuth } from '../context/AuthContext';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', isActive: true });
  const [editId, setEditId] = useState(null);
  const { hasPermission } = useAuth();

  const fetchRoles = async () => {
    const { data } = await api.get('/rbac/roles');
    setRoles(data.data);
  };

  useEffect(() => { fetchRoles(); }, []);

  const openCreate = () => {
    setForm({ name: '', description: '', isActive: true });
    setEditId(null);
    setModal(true);
  };

  const openEdit = (role) => {
    setForm({
      name: role.name,
      description: role.description || '',
      isActive: role.isActive !== false,
    });
    setEditId(role._id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/rbac/roles/${editId}`, form);
    else await api.post('/rbac/roles', { ...form, permissions: [] });
    setModal(false);
    fetchRoles();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this role?')) return;
    await api.delete(`/rbac/roles/${id}`);
    fetchRoles();
  };

  return (
    <div className="rbac-page">
      <div className="rbac-page-head">
        <h1 className="rbac-title">Roles</h1>
        <PermissionGate permission="roles.manage">
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <FiPlus /> Add Role
          </button>
        </PermissionGate>
      </div>

      <div className="rbac-card">
        <table className="rbac-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r._id}>
                <td><strong>{r.name}</strong></td>
                <td>{r.description || '-'}</td>
                <td>
                  <span className={`rbac-status ${r.isActive !== false ? 'active' : 'inactive'}`}>
                    {r.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="rbac-actions">
                    {hasPermission('roles.manage') && (
                      <>
                        <button type="button" className="rbac-icon-btn edit" title="Edit" onClick={() => openEdit(r)}>
                          <FiEdit2 size={16} />
                        </button>
                        {!r.isSystem && (
                          <button type="button" className="rbac-icon-btn delete" title="Delete" onClick={() => handleDelete(r._id)}>
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editId ? 'Edit Role' : 'Add Role'}
        footer={(
          <>
            <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>Save</button>
          </>
        )}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <label className="rbac-check-row">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active role
          </label>
          <p className="rbac-hint">Permissions are assigned on the Permissions page.</p>
        </form>
      </Modal>
    </div>
  );
}
