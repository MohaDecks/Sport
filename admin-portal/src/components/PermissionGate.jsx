import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PermissionGate({ permission, permissions = [], children, fallback = null }) {
  const { hasPermission, hasAnyPermission } = useAuth();
  const allowed = permission
    ? hasPermission(permission)
    : hasAnyPermission(...permissions);

  if (!allowed) return fallback;
  return children;
}

export function PermissionRoute({ permission, permissions = [], children }) {
  const { hasPermission, hasAnyPermission } = useAuth();
  const allowed = permission
    ? hasPermission(permission)
    : hasAnyPermission(...permissions);

  if (!allowed) return <Navigate to="/" replace />;
  return children;
}
