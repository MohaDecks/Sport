import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

import { getAssetUrl } from '../utils/assets';
import { useModulePermissions } from '../hooks/useModulePermissions';

const emptyForm = { name: '', district: '', category: 'Football' };

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { canCreate, canUpdate, canDelete, showActions } = useModulePermissions('teams');

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (category) params.category = category;
    const { data } = await api.get('/teams', { params });
    setTeams(data.data);
    setPagination(data.pagination);
    setLoading(false);
  }, [page, search, category]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setLogo(null); setModal(true); };
  const openEdit = (team) => {
    setForm({ name: team.name, district: team.district, category: team.category });
    setEditId(team._id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (logo) fd.append('logo', logo);

    if (editId) await api.put(`/teams/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    else await api.post('/teams', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

    setModal(false);
    fetchTeams();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this team?')) return;
    await api.delete(`/teams/${id}`);
    fetchTeams();
  };

  return (
    <div className="page-shell">
      <div className="card card-full">
        <div className="card-header">
          <div className="card-header-left">
            <h2>All Teams</h2>
            <span className="count-badge">{pagination?.total ?? teams.length} teams</span>
          </div>
          <div className="filters">
            <input className="search-input" placeholder="Search teams..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            <select className="form-control filter-select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {['Football', 'Basketball', 'Volleyball', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {canCreate && (
              <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Team</button>
            )}
          </div>
        </div>
        <div className="card-body">
          {loading ? <div className="loading">Loading teams...</div> : (
            <div className="table-wrap">
            <table>
              <thead><tr><th>Logo</th><th>Name</th><th>District</th><th>Category</th><th>Coach</th>{showActions && <th>Actions</th>}</tr></thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t._id}>
                    <td>
                      {t.logo ? (
                        <img src={getAssetUrl(t.logo)} alt={t.name} className="avatar" />
                      ) : (
                        <div className="avatar avatar-placeholder">{t.name.charAt(0)}</div>
                      )}
                    </td>
                    <td><strong>{t.name}</strong></td>
                    <td>{t.district}</td>
                    <td><span className="badge badge-info">{t.category}</span></td>
                    <td>{t.coach?.fullName || <span className="text-muted">—</span>}</td>
                    {showActions && (
                      <td className="actions-cell">
                        {canUpdate && <button className="btn btn-sm btn-outline" onClick={() => openEdit(t)} title="Edit"><FiEdit2 /></button>}
                        {canUpdate && canDelete && ' '}
                        {canDelete && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t._id)} title="Delete"><FiTrash2 /></button>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Team' : 'Add Team'}
        footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Save</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Team Name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-row">
            <div className="form-group"><label>District</label><input className="form-control" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required /></div>
            <div className="form-group"><label>Category</label>
              <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {['Football', 'Basketball', 'Volleyball', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label>Team Logo</label><input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} /></div>
        </form>
      </Modal>
    </div>
  );
}
