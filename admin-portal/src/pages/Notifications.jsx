import { useState, useEffect, useCallback } from 'react';
import { FiPlus } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useModulePermissions } from '../hooks/useModulePermissions';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'announcement', targetRole: 'all', isPush: true });
  const [loading, setLoading] = useState(true);
  const { canManage } = useModulePermissions('notifications');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/notifications', { params: { page, limit: 10 } });
    setNotifications(data.data);
    setPagination(data.pagination);
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/notifications', form);
    setModal(false);
    fetchData();
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Notifications</h2>
          {canManage && (
            <button className="btn btn-primary" onClick={() => setModal(true)}><FiPlus /> Send Notification</button>
          )}
        </div>
        <div className="card-body">
          {loading ? <div className="loading">Loading...</div> : (
            <table>
              <thead><tr><th>Title</th><th>Message</th><th>Type</th><th>Target</th><th>Push</th><th>Date</th></tr></thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n._id}>
                    <td><strong>{n.title}</strong></td>
                    <td>{n.message}</td>
                    <td>{n.type}</td>
                    <td>{n.targetRole}</td>
                    <td>{n.isPush ? 'Yes' : 'No'}</td>
                    <td>{new Date(n.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Send Notification"
        footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Send</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="form-group"><label>Message</label><textarea className="form-control" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Type</label>
              <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['news', 'match', 'announcement', 'system'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Target Role</label>
              <select className="form-control" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
                {['all', 'admin', 'coach', 'team'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={form.isPush} onChange={(e) => setForm({ ...form, isPush: e.target.checked })} /> Push notification
          </label>
        </form>
      </Modal>
    </div>
  );
}
