/**
 * Frontend menu config — sidebar & topbar
 *
 * Page cusub: 1) ku dar backend adminModules.js  2) halkan  3) App.jsx route  4) pages/YourPage.jsx
 */
export const MAIN_MENUS = [
  { path: '/', label: 'Dashboard', icon: 'FiHome', permission: 'dashboard.view', title: 'Dashboard' },
  { path: '/teams', label: 'Teams', icon: 'FiUsers', permission: 'teams.view', title: 'Team Management' },
  { path: '/players', label: 'Players', icon: 'FiUser', permission: 'players.view', title: 'Player Management' },
  { path: '/coaches', label: 'Coaches', icon: 'FiAward', permission: 'coaches.view', title: 'Coach Management' },
  { path: '/tournaments', label: 'Tournaments', icon: 'FiStar', permission: 'tournaments.view', title: 'Tournaments & Cups' },
  { path: '/matches', label: 'Matches', icon: 'FiCalendar', permission: 'matches.view', title: 'Match Management' },
  { path: '/discipline', label: 'Discipline', icon: 'FiActivity', permission: 'discipline.view', title: 'Discipline & Activity' },
  { path: '/news', label: 'News', icon: 'FiFileText', permission: 'news.view', title: 'News & Announcements' },
  { path: '/notifications', label: 'Notifications', icon: 'FiBell', permission: 'notifications.view', title: 'Notifications' },
];

export const ACCESS_MENUS = [
  { path: '/roles', label: 'Roles', icon: 'FiShield', permissions: ['roles.view', 'roles.manage'], title: 'Roles' },
  { path: '/permissions', label: 'Permissions', icon: 'FiKey', permissions: ['roles.view', 'roles.manage'], title: 'Permissions' },
  { path: '/admin-users', label: 'Admin Users', icon: 'FiLock', permissions: ['users.admins.view', 'users.admins.manage'], title: 'Admin Users' },
  { path: '/mobile-users', label: 'Coach/Team Users', icon: 'FiSmartphone', permissions: ['users.mobile.view', 'users.mobile.manage'], title: 'Coach & Team Users' },
];

export const PAGE_TITLES = Object.fromEntries(
  [...MAIN_MENUS, ...ACCESS_MENUS].map((m) => [m.path, m.title]),
);
