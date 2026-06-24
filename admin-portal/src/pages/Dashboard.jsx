import { useState, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function TeamBadge({ name }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  return <div className="sport-team-badge">{initial}</div>;
}

function MatchScore({ match }) {
  if (match.status === 'Finished') {
    return (
      <div className="sport-score">
        <span>{match.homeScore ?? 0}</span>
        <span className="sport-score-sep">:</span>
        <span>{match.awayScore ?? 0}</span>
      </div>
    );
  }
  return <div className="sport-score sport-score-vs">VS</div>;
}

function SportMatchCard({ match, compact = false }) {
  return (
    <div className={`sport-card ${compact ? 'sport-card-compact' : ''}`}>
      <div className="sport-card-top">
        <span className={`sport-live ${match.status === 'Live' ? 'is-live' : ''}`}>
          {match.status === 'Live' ? '● LIVE' : match.status}
        </span>
        <span className="sport-time">{match.matchTime}</span>
      </div>

      <div className="sport-teams-row">
        <div className="sport-team">
          <TeamBadge name={match.homeTeam?.name} />
          <span>{match.homeTeam?.name}</span>
        </div>
        <MatchScore match={match} />
        <div className="sport-team sport-team-away">
          <span>{match.awayTeam?.name}</span>
          <TeamBadge name={match.awayTeam?.name} />
        </div>
      </div>

      <div className="sport-card-meta">
        <FiMapPin size={12} />
        <span>{match.stadium}</span>
        {match.tournament?.name && <span>· {match.tournament.name}</span>}
      </div>

      {match.status === 'Live' && (
        <div className="sport-progress">
          <div className="sport-progress-bar" style={{ width: '65%' }} />
        </div>
      )}

      <div className="sport-card-actions">
        <Link to="/matches" className="sport-btn sport-btn-outline">View Details</Link>
        <Link to="/matches" className="sport-btn sport-btn-yellow">Manage Match</Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/matches/today'),
      api.get('/matches', { params: { limit: 6 } }),
      api.get('/news', { params: { limit: 4 } }),
    ]).then(([statsRes, todayRes, allRes, newsRes]) => {
      setStats(statsRes.data.data);
      const today = todayRes.data.data || [];
      const all = allRes.data.data || [];
      setMatches(today.length ? today : all);
      setNews(newsRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const featured = matches[0];
  const sideMatches = matches.slice(1, 3);

  return (
    <div className="dash-page">
      <div className="dash-hero">
        <div>
          <p className="dash-welcome">Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}</p>
          <h2 className="dash-heading">Sports Dashboard</h2>
          <p className="dash-desc">Live matches, teams & district sports overview</p>
        </div>
        <div className="dash-hero-badge">
          <FiTrendingUp size={18} />
          <span>{stats?.todayMatches ?? 0} matches today</span>
        </div>
      </div>

      <div className="sport-layout">
        <div className="sport-col sport-col-side">
          <p className="sport-section-label">Today&apos;s Matches</p>
          {sideMatches.length === 0 && !featured ? (
            <div className="sport-card sport-card-empty">No matches scheduled</div>
          ) : (
            sideMatches.map((m) => <SportMatchCard key={m._id} match={m} compact />)
          )}
        </div>

        <div className="sport-col sport-col-hero">
          {featured ? (
            <div className="sport-featured">
              <div className="sport-featured-glow" />
              <p className="sport-section-label sport-featured-label">Featured Match</p>
              <div className="sport-featured-teams">
                <div className="sport-featured-team">
                  <div className="sport-team-badge sport-team-badge-lg">{featured.homeTeam?.name?.charAt(0)}</div>
                  <h3>{featured.homeTeam?.name}</h3>
                </div>
                <div className="sport-featured-center">
                  <MatchScore match={featured} />
                  <p className="sport-featured-time"><FiCalendar size={14} /> {featured.matchTime}</p>
                  <p className="sport-featured-stadium">{featured.stadium}</p>
                  <Link to="/matches" className="sport-btn sport-btn-yellow sport-btn-lg">Match Details</Link>
                </div>
                <div className="sport-featured-team">
                  <div className="sport-team-badge sport-team-badge-lg">{featured.awayTeam?.name?.charAt(0)}</div>
                  <h3>{featured.awayTeam?.name}</h3>
                </div>
              </div>
              <div className="sport-featured-footer">
                <span className={`sport-live ${featured.status === 'Live' ? 'is-live' : ''}`}>{featured.status}</span>
                <span>{featured.tournament?.name || 'District League'}</span>
              </div>
            </div>
          ) : (
            <div className="sport-featured sport-featured-empty">
              <p>No featured match today</p>
              <Link to="/matches" className="sport-btn sport-btn-yellow">Schedule Match</Link>
            </div>
          )}
        </div>

        <div className="sport-col sport-col-side">
          <p className="sport-section-label">Platform Stats</p>
          <div className="sport-stat-stack">
            {[
              { label: 'Teams', value: stats?.totalTeams, emoji: '👥' },
              { label: 'Players', value: stats?.totalPlayers, emoji: '🏃' },
              { label: 'Coaches', value: stats?.totalCoaches, emoji: '🎯' },
              { label: 'Tournaments', value: stats?.totalTournaments, emoji: '🏆' },
            ].map(({ label, value, emoji }) => (
              <div key={label} className="sport-stat-pill">
                <span>{emoji}</span>
                <div>
                  <p>{label}</p>
                  <strong>{value ?? 0}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {matches.length > 3 && (
        <div>
          <p className="sport-section-label">All Upcoming</p>
          <div className="sport-cards-row">
            {matches.slice(3).map((m) => (
              <SportMatchCard key={m._id} match={m} compact />
            ))}
          </div>
        </div>
      )}

      <div className="dash-grid">
        <div className="card card-full">
          <div className="card-header">
            <h2>Latest News</h2>
            <Link to="/news" className="link-btn">View all</Link>
          </div>
          <div className="card-body">
            {news.length === 0 ? (
              <div className="empty-state">No news yet</div>
            ) : (
              <div className="dash-list">
                {news.map((n) => (
                  <div key={n._id} className="dash-list-item">
                    <p className="dash-news-title">{n.title}</p>
                    <p className="dash-news-text">{n.content?.slice(0, 100)}...</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card card-full">
          <div className="card-header"><h2>Quick Actions</h2></div>
          <div className="card-body sport-quick-grid">
            {[
              { to: '/teams', label: 'Teams', emoji: '👥' },
              { to: '/players', label: 'Players', emoji: '⚽' },
              { to: '/matches', label: 'Matches', emoji: '📅' },
              { to: '/notifications', label: 'Alerts', emoji: '🔔' },
            ].map(({ to, label, emoji }) => (
              <Link key={to} to={to} className="sport-quick-btn">
                <span>{emoji}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
