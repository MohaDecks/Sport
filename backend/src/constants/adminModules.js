/**
 * SINGLE SOURCE — backend permissions & permission matrix
 *
 * Page cusub ku dar: kaliya halkan ku dar module cusub.
 * Kadib: frontend adminMenus.js + App.jsx route + page component + API routes
 *
 * actions:
 *   view, create, update, delete — CRUD caadi ah
 *   results — matches natiijada (update column)
 *   manage — hal permission oo add/update/delete wada xakameeya (news, discipline, iwm.)
 */

const ADMIN_MODULES = [
  { key: 'dashboard', label: 'Dashboard', menu: 'Dashboard', parent: 'Parent', actions: ['view'] },
  { key: 'teams', label: 'Teams', menu: 'Teams', parent: 'Sports', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'players', label: 'Players', menu: 'Players', parent: 'Sports', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'coaches', label: 'Coaches', menu: 'Coaches', parent: 'Sports', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'tournaments', label: 'Tournaments', menu: 'Tournaments', parent: 'Sports', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'matches', label: 'Matches', menu: 'Matches', parent: 'Sports', actions: ['view', 'create', 'update', 'delete', 'results'] },
  { key: 'discipline', label: 'Discipline', menu: 'Discipline', parent: 'Sports', actions: ['view', 'manage'] },
  { key: 'news', label: 'News', menu: 'News', parent: 'Content', actions: ['view', 'manage'] },
  { key: 'notifications', label: 'Notifications', menu: 'Notifications', parent: 'Content', actions: ['view', 'manage'] },
  { key: 'roles', label: 'Roles', menu: 'Roles', parent: 'Settings', actions: ['view', 'manage'] },
  { key: 'permissions', label: 'Permissions', menu: 'Permissions', parent: 'Settings', actions: ['view', 'manage'] },
  { key: 'admin-users', label: 'Admin Users', menu: 'Admin Users', parent: 'Settings', actions: ['view', 'manage'], permPrefix: 'users.admins' },
  { key: 'mobile-users', label: 'Coach/Team Users', menu: 'Coach/Team Users', parent: 'Settings', actions: ['view', 'manage'], permPrefix: 'users.mobile' },
];

const ACTION_LABELS = {
  view: 'View',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
  results: 'Update Results',
  manage: 'Manage',
};

const permKey = (mod, action) => {
  const prefix = mod.permPrefix || mod.key;
  if (action === 'manage') return `${prefix}.manage`;
  if (action === 'results') return `${prefix}.results`;
  return `${prefix}.${action}`;
};

const PERMISSION_GROUPS = ADMIN_MODULES.map((mod) => ({
  key: mod.key,
  label: mod.label,
  permissions: mod.actions.map((action) => ({
    key: permKey(mod, action),
    label: `${ACTION_LABELS[action]} ${mod.label}`,
  })),
}));

const columnKeys = (mod, column) => {
  if (column === 'view') return mod.actions.includes('view') ? [permKey(mod, 'view')] : [];
  if (column === 'add') {
    if (mod.actions.includes('create')) return [permKey(mod, 'create')];
    if (mod.actions.includes('manage')) return [permKey(mod, 'manage')];
    return [];
  }
  if (column === 'update') {
    const keys = [];
    if (mod.actions.includes('update')) keys.push(permKey(mod, 'update'));
    if (mod.actions.includes('results')) keys.push(permKey(mod, 'results'));
    if (mod.actions.includes('manage')) keys.push(permKey(mod, 'manage'));
    return keys;
  }
  if (column === 'delete') {
    if (mod.actions.includes('delete')) return [permKey(mod, 'delete')];
    if (mod.actions.includes('manage')) return [permKey(mod, 'manage')];
    return [];
  }
  return [];
};

const PERMISSION_MENUS = ADMIN_MODULES.map((mod) => ({
  key: mod.key,
  menu: mod.menu,
  parent: mod.parent,
  view: columnKeys(mod, 'view'),
  add: columnKeys(mod, 'add'),
  update: columnKeys(mod, 'update'),
  delete: columnKeys(mod, 'delete'),
}));

const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key));

const getUserPermissions = (user) => {
  if (!user || user.role !== 'admin') return [];
  if (user.isSuperAdmin) return ALL_PERMISSIONS;

  const role = user.adminRole;
  if (!role || typeof role !== 'object') return [];
  if (role.isActive === false) return [];
  return role.permissions || [];
};

module.exports = {
  ADMIN_MODULES,
  PERMISSION_GROUPS,
  PERMISSION_MENUS,
  ALL_PERMISSIONS,
  getUserPermissions,
};
