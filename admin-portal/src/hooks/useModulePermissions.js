import { useAuth } from '../context/AuthContext';

export function useModulePermissions(module) {
  const { hasPermission } = useAuth();

  return {
    canView: hasPermission(`${module}.view`),
    canCreate: hasPermission(`${module}.create`),
    canUpdate: hasPermission(`${module}.update`),
    canDelete: hasPermission(`${module}.delete`),
    canManage: hasPermission(`${module}.manage`),
    canResults: hasPermission(`${module}.results`),
    showActions: hasPermission(`${module}.update`) || hasPermission(`${module}.delete`) || hasPermission(`${module}.manage`) || hasPermission(`${module}.results`),
  };
}
