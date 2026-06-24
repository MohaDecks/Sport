import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import PermissionGate from '../components/PermissionGate';
import { useAuth } from '../context/AuthContext';
import {
  matrixFromPermissions,
  buildPermissionsFromMatrix,
  hasColumnActions,
} from '../utils/permissionMatrix';

function ToggleSwitch({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      className={`toggle-switch ${checked ? 'on' : ''}`}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      aria-pressed={checked}
    >
      <span className="toggle-knob" />
    </button>
  );
}

export default function Permissions() {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [matrix, setMatrix] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { hasPermission } = useAuth();

  const selectedRole = roles.find((r) => r._id === selectedRoleId);
  const canEdit = hasPermission('roles.manage') && selectedRole && !selectedRole.isSystem;

  const loadData = useCallback(async (keepRoleId) => {
    const [rolesRes, permsRes] = await Promise.all([
      api.get('/rbac/roles'),
      api.get('/rbac/permissions'),
    ]);
    const roleList = rolesRes.data.data;
    const menuList = permsRes.data.data.menus || [];
    setRoles(roleList);
    setMenus(menuList);

    const roleId = keepRoleId || selectedRoleId || roleList[0]?._id;
    if (roleId) {
      setSelectedRoleId(roleId);
      const role = roleList.find((r) => r._id === roleId);
      if (role) setMatrix(matrixFromPermissions(menuList, role.permissions || []));
    }
  }, [selectedRoleId]);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = (roleId) => {
    setSelectedRoleId(roleId);
    const role = roles.find((r) => r._id === roleId);
    if (role && menus.length) {
      setMatrix(matrixFromPermissions(menus, role.permissions || []));
    }
    setMessage('');
  };

  const toggleCell = (menuKey, column) => {
    if (!canEdit) return;
    setMatrix((prev) => ({
      ...prev,
      [menuKey]: { ...prev[menuKey], [column]: !prev[menuKey]?.[column] },
    }));
  };

  const handleSave = async () => {
    if (!selectedRoleId || !canEdit) return;
    setSaving(true);
    setMessage('');
    try {
      const permissions = buildPermissionsFromMatrix(menus, matrix);
      await api.put(`/rbac/roles/${selectedRoleId}`, { permissions });
      setMessage('Permissions saved successfully.');
      await loadData(selectedRoleId);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    if (selectedRole && menus.length) {
      setMatrix(matrixFromPermissions(menus, selectedRole.permissions || []));
      setMessage('Refreshed.');
    }
  };

  return (
    <div className="rbac-page">
      <div className="rbac-page-head">
        <div>
          <h1 className="rbac-title">Permissions</h1>
          <p className="rbac-subtitle">Toggle permissions for each menu below. These are applied per role.</p>
        </div>
        <div className="rbac-toolbar">
          <div className="form-group rbac-role-select">
            <label>Select Role</label>
            <select
              className="form-control"
              value={selectedRoleId}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              {roles.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
          <button type="button" className="btn btn-outline" onClick={handleRefresh}>Refresh</button>
          <PermissionGate permission="roles.manage">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!canEdit || saving}
            >
              {saving ? 'Saving...' : 'Save Permissions'}
            </button>
          </PermissionGate>
        </div>
      </div>

      {selectedRole?.isSystem && (
        <div className="rbac-alert">Super Admin role has full access and cannot be edited here.</div>
      )}
      {message && <div className="rbac-alert info">{message}</div>}

      <div className="rbac-card">
        <table className="rbac-table perm-matrix">
          <thead>
            <tr>
              <th>Menu</th>
              <th>Parent</th>
              <th className="center">View</th>
              <th className="center">Add</th>
              <th className="center">Update</th>
              <th className="center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {menus.map((item) => (
              <tr key={item.key}>
                <td><strong>{item.menu}</strong></td>
                <td>{item.parent}</td>
                {['view', 'add', 'update', 'delete'].map((col) => (
                  <td key={col} className="center">
                    {hasColumnActions(item[col]) ? (
                      <ToggleSwitch
                        checked={!!matrix[item.key]?.[col]}
                        disabled={!canEdit}
                        onChange={() => toggleCell(item.key, col)}
                      />
                    ) : (
                      <span className="perm-na">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
