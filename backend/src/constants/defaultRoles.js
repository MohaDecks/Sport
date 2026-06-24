const { ALL_PERMISSIONS } = require('../constants/permissions');

const onlyView = ALL_PERMISSIONS.filter((p) => p.endsWith('.view'));

const sportsFull = ALL_PERMISSIONS.filter(
  (p) => !p.startsWith('roles.') && !p.startsWith('users.')
);

const DEFAULT_ROLES = [
  {
    name: 'Super Admin',
    description: 'Full access to all pages and actions',
    isSystem: true,
    permissions: ALL_PERMISSIONS,
  },
  {
    name: 'Sports Director',
    description: 'Manages all district sports operations and data',
    isSystem: false,
    permissions: sportsFull,
  },
  {
    name: 'Tournament Manager',
    description: 'Creates tournaments, schedules matches and updates results',
    isSystem: false,
    permissions: [
      'dashboard.view',
      'teams.view', 'teams.create', 'teams.update', 'teams.delete',
      'players.view', 'players.create', 'players.update', 'players.delete',
      'tournaments.view', 'tournaments.create', 'tournaments.update', 'tournaments.delete',
      'matches.view', 'matches.create', 'matches.update', 'matches.delete', 'matches.results',
    ],
  },
  {
    name: 'Match Official',
    description: 'Updates match results and views discipline records',
    isSystem: false,
    permissions: [
      'dashboard.view',
      'teams.view',
      'players.view',
      'matches.view',
      'matches.results',
      'discipline.view',
    ],
  },
  {
    name: 'Data Entry Clerk',
    description: 'Registers teams, players and coaches — no delete access',
    isSystem: false,
    permissions: [
      'dashboard.view',
      'teams.view', 'teams.create', 'teams.update',
      'players.view', 'players.create', 'players.update',
      'coaches.view', 'coaches.create', 'coaches.update',
    ],
  },
  {
    name: 'Content Manager',
    description: 'Publishes news and push notifications',
    isSystem: false,
    permissions: [
      'dashboard.view',
      'news.view', 'news.manage',
      'notifications.view', 'notifications.manage',
    ],
  },
  {
    name: 'Discipline Officer',
    description: 'Manages cards, suspensions and injuries',
    isSystem: false,
    permissions: [
      'dashboard.view',
      'players.view',
      'discipline.view',
      'discipline.manage',
    ],
  },
  {
    name: 'Viewer',
    description: 'Read-only access for reporting and audit',
    isSystem: false,
    permissions: onlyView,
  },
];

const sanitizePermissions = (permissions) =>
  permissions.filter((p) => ALL_PERMISSIONS.includes(p));

module.exports = { DEFAULT_ROLES, sanitizePermissions };
