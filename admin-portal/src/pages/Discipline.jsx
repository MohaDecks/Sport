import { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useModulePermissions } from '../hooks/useModulePermissions';

export default function Discipline() {
  const { canManage } = useModulePermissions('discipline');
  const [tab, setTab] = useState('injuries');
  const [injuries, setInjuries] = useState([]);
  const [suspensions, setSuspensions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [cards, setCards] = useState([]);
  const [cardFilter, setCardFilter] = useState('');
  const [players, setPlayers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get('/players', { params: { limit: 100 } }).then(({ data }) => setPlayers(data.data));
    fetchData();
  }, [tab, cardFilter]);

  const fetchData = async () => {
    if (tab === 'injuries') {
      const { data } = await api.get('/discipline/injuries');
      setInjuries(data.data);
    } else if (tab === 'suspensions') {
      const { data } = await api.get('/discipline/suspensions');
      setSuspensions(data.data);
    } else if (tab === 'cards') {
      const params = cardFilter ? { player: cardFilter } : {};
      const { data } = await api.get('/discipline/cards', { params });
      setCards(data.data);
    } else {
      const { data } = await api.get('/discipline/attendance');
      setAttendance(data.data);
    }
  };

  const handleInjurySubmit = async (e) => {
    e.preventDefault();
    await api.post('/discipline/injuries', form);
    setModal(false);
    fetchData();
  };

  const handleSuspensionSubmit = async (e) => {
    e.preventDefault();
    await api.post('/discipline/suspensions', form);
    setModal(false);
    fetchData();
  };

  const tabs = [
    { id: 'injuries', label: 'Injuries' },
    { id: 'suspensions', label: 'Suspensions' },
    { id: 'cards', label: 'Yellow / Red Cards' },
    { id: 'attendance', label: 'Attendance' },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Player Activity & Discipline</h2>
          <div className="filters">
            {tabs.map((t) => (
              <button key={t.id} className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
            {tab !== 'attendance' && tab !== 'cards' && canManage && (
              <button className="btn btn-primary" onClick={() => { setForm({}); setModal(true); }}><FiPlus /> Add</button>
            )}
            {tab === 'cards' && (
              <select
                className="form-control"
                style={{ width: 'auto' }}
                value={cardFilter}
                onChange={(e) => setCardFilter(e.target.value)}
              >
                <option value="">All Players</option>
                {players.map((p) => <option key={p._id} value={p._id}>{p.fullName}</option>)}
              </select>
            )}
          </div>
        </div>
        <div className="card-body">
          {tab === 'injuries' && (
            <table>
              <thead><tr><th>Player</th><th>Type</th><th>Date</th><th>Recovery</th><th>Status</th><th>Description</th></tr></thead>
              <tbody>
                {injuries.map((i) => (
                  <tr key={i._id}>
                    <td>{i.player?.fullName}</td>
                    <td>{i.injuryType}</td>
                    <td>{new Date(i.injuryDate).toLocaleDateString()}</td>
                    <td>{i.expectedRecoveryDate ? new Date(i.expectedRecoveryDate).toLocaleDateString() : '-'}</td>
                    <td><StatusBadge status={i.status} /></td>
                    <td>{i.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'suspensions' && (
            <table>
              <thead><tr><th>Player</th><th>Reason</th><th>Type</th><th>Start</th><th>End</th><th>Active</th></tr></thead>
              <tbody>
                {suspensions.map((s) => (
                  <tr key={s._id}>
                    <td>{s.player?.fullName}</td>
                    <td>{s.reason}</td>
                    <td>{s.type}</td>
                    <td>{new Date(s.startDate).toLocaleDateString()}</td>
                    <td>{new Date(s.endDate).toLocaleDateString()}</td>
                    <td><StatusBadge status={s.isActive ? 'Live' : 'Finished'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'cards' && (
            <>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Halkan waxaad ka aragtaa yellow/red cards — ciyaartoy, ciyaar, daqiiqad. Suspension manual ah ma muujinayo cards-ka.
              </p>
              {cards.length === 0 ? (
                <div className="empty-state">
                  No card records yet. Cards are recorded when match results include yellow/red cards.
                </div>
              ) : (
                <table>
                  <thead><tr><th>Player</th><th>Card</th><th>Minute</th><th>Match</th><th>Date</th><th>Team</th></tr></thead>
                  <tbody>
                    {cards.map((c) => (
                      <tr key={c._id}>
                        <td><strong>{c.player?.fullName}</strong></td>
                        <td>
                          <span className={`badge ${c.type === 'Yellow' ? 'badge-warning' : 'badge-danger'}`}>
                            {c.type}
                          </span>
                        </td>
                        <td>{c.minute}&apos;</td>
                        <td>
                          {c.match?.homeTeam?.name} vs {c.match?.awayTeam?.name}
                        </td>
                        <td>{c.match?.matchDate ? new Date(c.match.matchDate).toLocaleDateString() : '-'}</td>
                        <td>{c.team?.name || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
          {tab === 'attendance' && (
            <table>
              <thead><tr><th>Player</th><th>Type</th><th>Date</th><th>Status</th><th>Notes</th></tr></thead>
              <tbody>
                {attendance.map((a) => (
                  <tr key={a._id}>
                    <td>{a.player?.fullName}</td>
                    <td>{a.type}</td>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td><StatusBadge status={a.status === 'Present' ? 'Finished' : a.status === 'Late' ? 'Ongoing' : 'Upcoming'} /></td>
                    <td>{a.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={tab === 'injuries' ? 'Add Injury' : 'Add Suspension'}
        footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={tab === 'injuries' ? handleInjurySubmit : handleSuspensionSubmit}>Save</button></>}>
        <div className="form-group"><label>Player</label>
          <select className="form-control" value={form.player || ''} onChange={(e) => setForm({ ...form, player: e.target.value })} required>
            <option value="">Select Player</option>
            {players.map((p) => <option key={p._id} value={p._id}>{p.fullName}</option>)}
          </select>
        </div>
        {tab === 'injuries' ? (
          <>
            <div className="form-group"><label>Injury Type</label><input className="form-control" value={form.injuryType || ''} onChange={(e) => setForm({ ...form, injuryType: e.target.value })} required /></div>
            <div className="form-group"><label>Injury Date</label><input type="date" className="form-control" value={form.injuryDate || ''} onChange={(e) => setForm({ ...form, injuryDate: e.target.value })} required /></div>
            <div className="form-group"><label>Expected Recovery</label><input type="date" className="form-control" value={form.expectedRecoveryDate || ''} onChange={(e) => setForm({ ...form, expectedRecoveryDate: e.target.value })} /></div>
            <div className="form-group"><label>Status</label>
              <select className="form-control" value={form.status || 'Minor'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['Minor', 'Serious', 'Recovered'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Description</label><textarea className="form-control" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </>
        ) : (
          <>
            <div className="form-group"><label>Reason</label><input className="form-control" value={form.reason || ''} onChange={(e) => setForm({ ...form, reason: e.target.value })} required /></div>
            <div className="form-row">
              <div className="form-group"><label>Start Date</label><input type="date" className="form-control" value={form.startDate || ''} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
              <div className="form-group"><label>End Date</label><input type="date" className="form-control" value={form.endDate || ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></div>
            </div>
            <div className="form-group"><label>Type</label>
              <select className="form-control" value={form.type || 'Disciplinary'} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['Yellow Accumulation', 'Red Card', 'Disciplinary', 'Other'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
