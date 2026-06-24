import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useModulePermissions } from '../hooks/useModulePermissions';

export default function News() {
  const [news, setNews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', sendPush: false });
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { canManage } = useModulePermissions('news');

  const fetchNews = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/news', { params: { page, limit: 10 } });
    setNews(data.data);
    setPagination(data.pagination);
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('content', form.content);
    fd.append('sendPush', form.sendPush);
    if (image) fd.append('image', image);
    images.forEach((file) => fd.append('images', file));
    await api.post('/news', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setModal(false);
    setForm({ title: '', content: '', sendPush: false });
    setImage(null);
    setImages([]);
    fetchNews();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this news?')) return;
    await api.delete(`/news/${id}`);
    fetchNews();
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>News & Announcements</h2>
          {canManage && (
            <button className="btn btn-primary" onClick={() => setModal(true)}><FiPlus /> Add News</button>
          )}
        </div>
        <div className="card-body">
          {loading ? <div className="loading">Loading...</div> : (
            <table>
              <thead><tr><th>Title</th><th>Content</th><th>Author</th><th>Date</th><th>Push</th>{canManage && <th>Actions</th>}</tr></thead>
              <tbody>
                {news.map((n) => (
                  <tr key={n._id}>
                    <td><strong>{n.title}</strong></td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.content}</td>
                    <td>{n.author?.fullName}</td>
                    <td>{new Date(n.createdAt).toLocaleDateString()}</td>
                    <td>{n.sendPush ? 'Yes' : 'No'}</td>
                    {canManage && (
                      <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(n._id)}><FiTrash2 /></button></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add News"
        footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Publish</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="form-group"><label>Content</label><textarea className="form-control" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></div>
          <div className="form-group">
            <label>Cover Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0] || null)} />
          </div>
          <div className="form-group">
            <label>Banner Images (multiple — auto carousel on mobile)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files || []))}
            />
            {images.length > 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                {images.length} image{images.length > 1 ? 's' : ''} selected for banner rotation
              </p>
            )}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={form.sendPush} onChange={(e) => setForm({ ...form, sendPush: e.target.checked })} /> Send push notification
          </label>
        </form>
      </Modal>
    </div>
  );
}
