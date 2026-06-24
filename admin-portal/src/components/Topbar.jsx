import { useLocation } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { PAGE_TITLES } from '../config/adminMenus';

export default function Topbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = PAGE_TITLES[pathname] || 'Admin Portal';
  const now = new Date().toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  if (pathname === '/') return null;

  return (
    <header className="topbar">
      <div>
        <h1 className="page-title">{title}</h1>
      </div>
      <input className="topbar-search" placeholder="Search..." />
      <div className="topbar-right">
        <div className="topbar-date">{now}</div>
        <FiBell size={20} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
        <div className="topbar-avatar">{user?.fullName?.charAt(0) || 'A'}</div>
      </div>
    </header>
  );
}
