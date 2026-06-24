import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBarChart2 } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { useModulePermissions } from '../hooks/useModulePermissions';

const emptyForm = { homeTeam: '', awayTeam: '', matchDate: '', matchTime: '', stadium: '', tournament: '', status: 'Upcoming' };

const emptyResultForm = {
  homeScore: 0,
  awayScore: 0,
  cards: [],
  goalScorers: [],
};

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [resultForm, setResultForm] = useState(emptyResultForm);
  const [editId, setEditId] = useState(null);
  const [resultMatchId, setResultMatchId] = useState(null);
  const [resultMatch, setResultMatch] = useState(null);
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [resultLoading, setResultLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { canCreate, canUpdate, canDelete, canResults } = useModulePermissions('matches');
  const showActions = canUpdate || canDelete || canResults;

  useEffect(() => {
    Promise.all([
      api.get('/teams', { params: { limit: 100 } }),
      api.get('/tournaments', { params: { limit: 100 } }),
    ]).then(([teamsRes, tourRes]) => {
      setTeams(teamsRes.data.data);
      setTournaments(tourRes.data.data);
    });
  }, []);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (statusFilter) params.status = statusFilter;
    const { data } = await api.get('/matches', { params });
    setMatches(data.data);
    setPagination(data.pagination);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/matches/${editId}`, form);
    else await api.post('/matches', form);
    setModal(false);
    fetchMatches();
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      homeScore: Number(resultForm.homeScore) || 0,
      awayScore: Number(resultForm.awayScore) || 0,
      cards: resultForm.cards
        .filter((c) => c.player && c.minute !== '' && c.team)
        .map((c) => ({
          player: c.player,
          type: c.type,
          minute: Number(c.minute),
          team: c.team,
        })),
      goalScorers: resultForm.goalScorers
        .filter((g) => g.player && g.minute !== '' && g.team)
        .map((g) => ({
          player: g.player,
          minute: Number(g.minute),
          team: g.team,
          isOwnGoal: !!g.isOwnGoal,
        })),
    };
    await api.post(`/match-results/${resultMatchId}`, payload);
    setResultModal(false);
    fetchMatches();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this match?')) return;
    await api.delete(`/matches/${id}`);
    fetchMatches();
  };

  const homeTeamId = resultMatch?.homeTeam?._id || resultMatch?.homeTeam;
  const awayTeamId = resultMatch?.awayTeam?._id || resultMatch?.awayTeam;

  const playersForTeam = (teamId) => {
    if (teamId === homeTeamId) return homePlayers;
    if (teamId === awayTeamId) return awayPlayers;
    return [];
  };

  const openResult = async (match) => {
    setResultLoading(true);
    setResultMatchId(match._id);
    setResultMatch(match);
    setResultModal(true);

    const homeId = match.homeTeam?._id || match.homeTeam;
    const awayId = match.awayTeam?._id || match.awayTeam;

    try {
      const [homeRes, awayRes, existingRes] = await Promise.all([
        api.get('/players', { params: { team: homeId, limit: 100 } }),
        api.get('/players', { params: { team: awayId, limit: 100 } }),
        api.get(`/match-results/${match._id}`).catch(() => null),
      ]);

      setHomePlayers(homeRes.data.data || []);
      setAwayPlayers(awayRes.data.data || []);

      const existing = existingRes?.data?.data;
      if (existing) {
        setResultForm({
          homeScore: existing.homeScore ?? match.homeScore ?? 0,
          awayScore: existing.awayScore ?? match.awayScore ?? 0,
          cards: (existing.cards || []).map((c) => ({
            player: c.player?._id || c.player,
            type: c.type,
            minute: c.minute,
            team: c.team?._id || c.team,
          })),
          goalScorers: (existing.goalScorers || []).map((g) => ({
            player: g.player?._id || g.player,
            minute: g.minute,
            team: g.team?._id || g.team,
            isOwnGoal: g.isOwnGoal || false,
          })),
        });
      } else {
        setResultForm({
          homeScore: match.homeScore || 0,
          awayScore: match.awayScore || 0,
          cards: [],
          goalScorers: [],
        });
      }
    } finally {
      setResultLoading(false);
    }
  };

  const updateCard = (index, field, value) => {
    setResultForm((prev) => {
      const cards = [...prev.cards];
      cards[index] = { ...cards[index], [field]: value };
      if (field === 'team') cards[index].player = '';
      return { ...prev, cards };
    });
  };

  const updateGoal = (index, field, value) => {
    setResultForm((prev) => {
      const goalScorers = [...prev.goalScorers];
      goalScorers[index] = { ...goalScorers[index], [field]: value };
      if (field === 'team') goalScorers[index].player = '';
      return { ...prev, goalScorers };
    });
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Match Management</h2>
          <div className="filters">
            <select className="form-control" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              {['Upcoming', 'Live', 'Finished'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {canCreate && (
              <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setModal(true); }}><FiPlus /> Create Match</button>
            )}
          </div>
        </div>
        <div className="card-body">
          {loading ? <div className="loading">Loading...</div> : (
            <table>
              <thead><tr><th>Home</th><th>Score</th><th>Away</th><th>Date</th><th>Time</th><th>Stadium</th><th>Tournament</th><th>Status</th>{showActions && <th>Actions</th>}</tr></thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m._id}>
                    <td><strong>{m.homeTeam?.name}</strong></td>
                    <td>{m.status === 'Finished' ? `${m.homeScore} - ${m.awayScore}` : 'vs'}</td>
                    <td><strong>{m.awayTeam?.name}</strong></td>
                    <td>{new Date(m.matchDate).toLocaleDateString()}</td>
                    <td>{m.matchTime}</td>
                    <td>{m.stadium}</td>
                    <td>{m.tournament?.name}</td>
                    <td><StatusBadge status={m.status} /></td>
                    {showActions && (
                      <td>
                        {canResults && (
                          <button className="btn btn-sm btn-outline" title="Update Result" onClick={() => openResult(m)}><FiBarChart2 /></button>
                        )}
                        {canResults && canUpdate && ' '}
                        {canUpdate && (
                          <button className="btn btn-sm btn-outline" onClick={() => { setForm({ homeTeam: m.homeTeam?._id, awayTeam: m.awayTeam?._id, matchDate: m.matchDate.split('T')[0], matchTime: m.matchTime, stadium: m.stadium, tournament: m.tournament?._id, status: m.status }); setEditId(m._id); setModal(true); }}><FiEdit2 /></button>
                        )}
                        {canUpdate && canDelete && ' '}
                        {canDelete && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m._id)}><FiTrash2 /></button>
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

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Match' : 'Create Match'}
        footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Save</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label>Home Team</label>
              <select className="form-control" value={form.homeTeam} onChange={(e) => setForm({ ...form, homeTeam: e.target.value })} required>
                <option value="">Select</option>{teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Away Team</label>
              <select className="form-control" value={form.awayTeam} onChange={(e) => setForm({ ...form, awayTeam: e.target.value })} required>
                <option value="">Select</option>{teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Match Date</label><input type="date" className="form-control" value={form.matchDate} onChange={(e) => setForm({ ...form, matchDate: e.target.value })} required /></div>
            <div className="form-group"><label>Match Time</label><input type="time" className="form-control" value={form.matchTime} onChange={(e) => setForm({ ...form, matchTime: e.target.value })} required /></div>
          </div>
          <div className="form-group"><label>Stadium</label><input className="form-control" value={form.stadium} onChange={(e) => setForm({ ...form, stadium: e.target.value })} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Tournament</label>
              <select className="form-control" value={form.tournament} onChange={(e) => setForm({ ...form, tournament: e.target.value })} required>
                <option value="">Select</option>{tournaments.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Status</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['Upcoming', 'Live', 'Finished'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={resultModal}
        onClose={() => setResultModal(false)}
        title="Update Match Result"
        wide
        footer={<><button className="btn btn-outline" onClick={() => setResultModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleResultSubmit} disabled={resultLoading}>Save Result</button></>}
      >
        {resultLoading ? (
          <div className="loading">Loading match data...</div>
        ) : (
          <form onSubmit={handleResultSubmit}>
            <p className="result-match-title">
              {resultMatch?.homeTeam?.name} vs {resultMatch?.awayTeam?.name}
            </p>

            <div className="form-row">
              <div className="form-group">
                <label>Home Score — {resultMatch?.homeTeam?.name}</label>
                <input type="number" min="0" className="form-control" value={resultForm.homeScore} onChange={(e) => setResultForm({ ...resultForm, homeScore: +e.target.value })} />
              </div>
              <div className="form-group">
                <label>Away Score — {resultMatch?.awayTeam?.name}</label>
                <input type="number" min="0" className="form-control" value={resultForm.awayScore} onChange={(e) => setResultForm({ ...resultForm, awayScore: +e.target.value })} />
              </div>
            </div>

            <div className="result-section">
              <div className="result-section-head">
                <h3>Goal Scorers</h3>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setResultForm((f) => ({
                    ...f,
                    goalScorers: [...f.goalScorers, { player: '', minute: '', team: homeTeamId, isOwnGoal: false }],
                  }))}
                >
                  <FiPlus /> Add Goal
                </button>
              </div>
              <p className="result-hint">Dooro ciyaartoy, koox, daqiiqad goolka lagu dhaliyay.</p>
              {resultForm.goalScorers.length === 0 && (
                <p className="result-hint">No goals added yet.</p>
              )}
              {resultForm.goalScorers.map((goal, i) => (
                <div key={`goal-${i}`} className="result-row result-row-sm">
                  <select className="form-control" value={goal.team} onChange={(e) => updateGoal(i, 'team', e.target.value)}>
                    <option value={homeTeamId}>{resultMatch?.homeTeam?.name}</option>
                    <option value={awayTeamId}>{resultMatch?.awayTeam?.name}</option>
                  </select>
                  <select className="form-control" value={goal.player} onChange={(e) => updateGoal(i, 'player', e.target.value)} required>
                    <option value="">Select player</option>
                    {playersForTeam(goal.team).map((p) => (
                      <option key={p._id} value={p._id}>{p.fullName} #{p.jerseyNumber}</option>
                    ))}
                  </select>
                  <input type="number" min="1" max="120" className="form-control" placeholder="Min" value={goal.minute} onChange={(e) => updateGoal(i, 'minute', e.target.value)} />
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => setResultForm((f) => ({ ...f, goalScorers: f.goalScorers.filter((_, idx) => idx !== i) }))}>
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            <div className="result-section">
              <div className="result-section-head">
                <h3>Yellow / Red Cards</h3>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setResultForm((f) => ({
                    ...f,
                    cards: [...f.cards, { player: '', type: 'Yellow', minute: '', team: homeTeamId }],
                  }))}
                >
                  <FiPlus /> Add Card
                </button>
              </div>
              <p className="result-hint">Cards-ka halkan lagu daro waxay u muuqdaan Discipline → Yellow / Red Cards.</p>
              {resultForm.cards.length === 0 && (
                <p className="result-hint">No cards added yet.</p>
              )}
              {resultForm.cards.map((card, i) => (
                <div key={`card-${i}`} className="result-row">
                  <select className="form-control" value={card.team} onChange={(e) => updateCard(i, 'team', e.target.value)}>
                    <option value={homeTeamId}>{resultMatch?.homeTeam?.name}</option>
                    <option value={awayTeamId}>{resultMatch?.awayTeam?.name}</option>
                  </select>
                  <select className="form-control" value={card.player} onChange={(e) => updateCard(i, 'player', e.target.value)} required>
                    <option value="">Select player</option>
                    {playersForTeam(card.team).map((p) => (
                      <option key={p._id} value={p._id}>{p.fullName} #{p.jerseyNumber}</option>
                    ))}
                  </select>
                  <select className="form-control" value={card.type} onChange={(e) => updateCard(i, 'type', e.target.value)}>
                    <option value="Yellow">Yellow</option>
                    <option value="Red">Red</option>
                  </select>
                  <input type="number" min="1" max="120" className="form-control" placeholder="Min" value={card.minute} onChange={(e) => updateCard(i, 'minute', e.target.value)} />
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => setResultForm((f) => ({ ...f, cards: f.cards.filter((_, idx) => idx !== i) }))}>
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
