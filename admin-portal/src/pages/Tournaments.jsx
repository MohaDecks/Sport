import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { useModulePermissions } from '../hooks/useModulePermissions';

const emptyForm = { name: '', startDate: '', endDate: '', status: 'Upcoming', description: '', teams: [] };

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { canCreate, canUpdate, canDelete, showActions } = useModulePermissions('tournaments');

  useEffect(() => {
    api.get('/teams', { params: { limit: 100 } }).then(({ data }) => setTeams(data.data));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/tournaments', { params: { page, limit: 10 } });
    setTournaments(data.data);
    setPagination(data.pagination);
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, teams: form.teams };
    if (editId) await api.put(`/tournaments/${editId}`, payload);
    else await api.post('/tournaments', payload);
    setModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tournament?')) return;
    await api.delete(`/tournaments/${id}`);
    fetchData();
  };

  const toggleTeam = (teamId) => {
    setForm((prev) => ({
      ...prev,
      teams: prev.teams.includes(teamId) ? prev.teams.filter((t) => t !== teamId) : [...prev.teams, teamId],
    }));
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Tournament / Cup Management</h2>
          {canCreate && (
            <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setModal(true); }}><FiPlus /> Create Tournament</button>
          )}
        </div>
        <div className="card-body">
          {loading ? <div className="loading">Loading...</div> : (
            <table>
              <thead><tr><th>Name</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Teams</th>{showActions && <th>Actions</th>}</tr></thead>
              <tbody>
                {tournaments.map((t) => (
                  <tr key={t._id}>
                    <td><strong>{t.name}</strong></td>
                    <td>{new Date(t.startDate).toLocaleDateString()}</td>
                    <td>{new Date(t.endDate).toLocaleDateString()}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>{t.teams?.length || 0}</td>
                    {showActions && (
                      <td>
                        {canUpdate && (
                          <button className="btn btn-sm btn-outline" onClick={() => { setForm({ name: t.name, startDate: t.startDate.split('T')[0], endDate: t.endDate.split('T')[0], status: t.status, description: t.description || '', teams: t.teams?.map((tm) => tm._id || tm) || [] }); setEditId(t._id); setModal(true); }}><FiEdit2 /></button>
                        )}
                        {canUpdate && canDelete && ' '}
                        {canDelete && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t._id)}><FiTrash2 /></button>}
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

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Tournament' : 'Create Tournament'}
        footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Save</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Tournament Name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Start Date</label><input type="date" className="form-control" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
            <div className="form-group"><label>End Date</label><input type="date" className="form-control" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></div>
          </div>
          <div className="form-group"><label>Status</label>
            <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Description</label><textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label>Teams</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {teams.map((t) => (
                <label key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={form.teams.includes(t._id)} onChange={() => toggleTeam(t._id)} /> {t.name}
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
