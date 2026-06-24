import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUsers, FiUser, FiAward, FiCalendar, FiStar,
  FiFileText, FiBell, FiLogOut, FiMoon, FiSun, FiActivity,
  FiShield, FiKey, FiSmartphone, FiLock,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MAIN_MENUS, ACCESS_MENUS } from '../config/adminMenus';

const ICONS = {
  FiHome, FiUsers, FiUser, FiAward, FiCalendar, FiStar,
  FiFileText, FiBell, FiActivity, FiShield, FiKey, FiSmartphone, FiLock,
};

export default function Sidebar() {
  const { logout, user, hasPermission, hasAnyPermission } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const visibleNav = MAIN_MENUS.filter((item) => hasPermission(item.permission));
  const visibleAdminNav = ACCESS_MENUS.filter((item) => hasAnyPermission(...item.permissions));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>District Sports</h2>
        <span>Admin Panel</span>
      </div>
      <nav className="sidebar-nav">
        {visibleNav.map(({ path, icon, label }) => {
          const Icon = ICONS[icon];
          return (
            <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          );
        })}
        {visibleAdminNav.length > 0 && (
          <>
            <div className="sidebar-divider">Access Control</div>
            {visibleAdminNav.map(({ path, icon, label }) => {
              const Icon = ICONS[icon];
              return (
                <NavLink key={path} to={path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Icon size={18} />
                  {label}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{user?.fullName?.charAt(0) || 'A'}</div>
          <div>
            <div className="sidebar-user-name">{user?.fullName}</div>
            <div className="sidebar-user-email">{user?.isSuperAdmin ? 'Super Admin' : (user?.adminRole?.name || user?.email)}</div>
          </div>
        </div>
        <button className="nav-link" onClick={toggleTheme} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
          {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button className="nav-link" onClick={() => { logout(); navigate('/login'); }} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
