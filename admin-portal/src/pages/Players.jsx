import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useModulePermissions } from '../hooks/useModulePermissions';

const emptyForm = { fullName: '', age: '', position: '', jerseyNumber: '', team: '' };

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const { canCreate, canUpdate, canDelete, showActions } = useModulePermissions('players');

  useEffect(() => {
    api.get('/teams', { params: { limit: 100 } }).then(({ data }) => setTeams(data.data));
  }, []);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (teamFilter) params.team = teamFilter;
    const { data } = await api.get('/players', { params });
    setPlayers(data.data);
    setPagination(data.pagination);
    setLoading(false);
  }, [page, search, teamFilter]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setPhoto(null); setModal(true); };
  const openEdit = (p) => {
    setForm({ fullName: p.fullName, age: p.age, position: p.position, jerseyNumber: p.jerseyNumber, team: p.team?._id || p.team });
    setEditId(p._id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append('photo', photo);

    try {
      if (editId) await api.put(`/players/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/players', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setModal(false);
      fetchPlayers();
    } catch (err) {
      alert(err.response?.data?.message || 'Action not allowed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this player?')) return;
    try {
      await api.delete(`/players/${id}`);
      fetchPlayers();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete not allowed');
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Player Management</h2>
          <div className="filters">
            <input className="search-input" placeholder="Search players..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            <select className="form-control" style={{ width: 'auto' }} value={teamFilter} onChange={(e) => { setTeamFilter(e.target.value); setPage(1); }}>
              <option value="">All Teams</option>
              {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            {canCreate && (
              <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Player</button>
            )}
          </div>
        </div>
        <div className="card-body">
          {loading ? <div className="loading">Loading...</div> : (
            <table>
              <thead>
                <tr>
                  <th>Photo</th><th>Name</th><th>Age</th><th>Position</th><th>#</th><th>Team</th><th>Cards</th>
                  {showActions && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p._id}>
                    <td>{p.photo ? <img src={`http://localhost:5001${p.photo}`} alt="" className="avatar" /> : <div className="avatar" />}</td>
                    <td><strong>{p.fullName}</strong></td>
                    <td>{p.age}</td>
                    <td>{p.position}</td>
                    <td>{p.jerseyNumber}</td>
                    <td>{p.team?.name || '-'}</td>
                    <td><span className="badge badge-warning">{p.yellowCards}Y</span> <span className="badge badge-danger">{p.redCards}R</span></td>
                    {showActions && (
                      <td>
                        {canUpdate && (
                          <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}><FiEdit2 /></button>
                        )}
                        {canUpdate && canDelete && ' '}
                        {canDelete && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                        )}
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

      {modal && (canCreate || canUpdate) && (
        <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Player' : 'Add Player'}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Save</button></>}>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Full Name</label><input className="form-control" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
            <div className="form-row">
              <div className="form-group"><label>Age</label><input type="number" className="form-control" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required /></div>
              <div className="form-group"><label>Jersey Number</label><input type="number" className="form-control" value={form.jerseyNumber} onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Position</label><input className="form-control" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required /></div>
              <div className="form-group"><label>Team</label>
                <select className="form-control" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} required>
                  <option value="">Select Team</option>
                  {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Photo</label><input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} /></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
