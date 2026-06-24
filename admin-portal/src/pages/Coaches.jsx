import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useModulePermissions } from '../hooks/useModulePermissions';

const emptyForm = { fullName: '', phone: '', email: '', password: '', team: '' };

export default function Coaches() {
  const [coaches, setCoaches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { canCreate, canUpdate, canDelete, showActions } = useModulePermissions('coaches');

  useEffect(() => {
    api.get('/teams', { params: { limit: 100 } }).then(({ data }) => setTeams(data.data));
  }, []);

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search) params.search = search;
    const { data } = await api.get('/coaches', { params });
    setCoaches(data.data);
    setPagination(data.pagination);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchCoaches(); }, [fetchCoaches]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (profile) fd.append('profile', profile);

    if (editId) await api.put(`/coaches/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    else await api.post('/coaches', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

    setModal(false);
    fetchCoaches();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coach?')) return;
    await api.delete(`/coaches/${id}`);
    fetchCoaches();
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Coach Management</h2>
          <div className="filters">
            <input className="search-input" placeholder="Search coaches..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            {canCreate && (
              <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setModal(true); }}><FiPlus /> Add Coach</button>
            )}
          </div>
        </div>
        <div className="card-body">
          {loading ? <div className="loading">Loading...</div> : (
            <table>
              <thead><tr><th>Profile</th><th>Name</th><th>Phone</th><th>Email</th><th>Team</th>{showActions && <th>Actions</th>}</tr></thead>
              <tbody>
                {coaches.map((c) => (
                  <tr key={c._id}>
                    <td>{c.profile ? <img src={`http://localhost:5001${c.profile}`} alt="" className="avatar" /> : <div className="avatar" />}</td>
                    <td><strong>{c.fullName}</strong></td>
                    <td>{c.phone}</td>
                    <td>{c.email || '-'}</td>
                    <td>{c.team?.name || '-'}</td>
                    {showActions && (
                      <td>
                        {canUpdate && (
                          <button className="btn btn-sm btn-outline" onClick={() => { setForm({ fullName: c.fullName, phone: c.phone, email: c.email || '', password: '', team: c.team?._id || '' }); setEditId(c._id); setModal(true); }}><FiEdit2 /></button>
                        )}
                        {canUpdate && canDelete && ' '}
                        {canDelete && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id)}><FiTrash2 /></button>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Coach' : 'Add Coach'}
        footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Save</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Full Name</label><input className="form-control" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
            <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          {!editId && <div className="form-group"><label>Password (for mobile login)</label><input type="password" className="form-control" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>}
          <div className="form-group"><label>Team</label>
            <select className="form-control" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}>
              <option value="">Select Team</option>
              {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Profile Photo</label><input type="file" accept="image/*" onChange={(e) => setProfile(e.target.files[0])} /></div>
        </form>
      </Modal>
    </div>
  );
}
