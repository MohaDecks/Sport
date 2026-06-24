export function isColumnOn(permissions, keys) {
  if (!keys?.length) return false;
  return keys.some((k) => permissions.includes(k));
}

export function matrixFromPermissions(menus, permissions) {
  const matrix = {};
  menus.forEach((m) => {
    matrix[m.key] = {
      view: isColumnOn(permissions, m.view),
      add: isColumnOn(permissions, m.add),
      update: isColumnOn(permissions, m.update),
      delete: isColumnOn(permissions, m.delete),
    };
  });
  return matrix;
}

export function buildPermissionsFromMatrix(menus, matrix) {
  const perms = new Set();
  menus.forEach((m) => {
    ['view', 'add', 'update', 'delete'].forEach((col) => {
      if (matrix[m.key]?.[col]) {
        m[col].forEach((k) => perms.add(k));
      }
    });
  });
  return [...perms];
}

export function hasColumnActions(keys) {
  return keys?.length > 0;
}
