import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions, Role } from '../utils/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const role = user?.role as Role;

  const can = useMemo(() => {
    return (permission: string): boolean => {
      if (!role) return false;
      return hasPermission(role, permission);
    };
  }, [role]);

  const canAny = useMemo(() => {
    return (permissions: string[]): boolean => {
      if (!role) return false;
      return hasAnyPermission(role, permissions);
    };
  }, [role]);

  const canAll = useMemo(() => {
    return (permissions: string[]): boolean => {
      if (!role) return false;
      return hasAllPermissions(role, permissions);
    };
  }, [role]);

  const isAdmin = useMemo(() => role === 'admin', [role]);
  const isTeacher = useMemo(() => role === 'teacher', [role]);
  const isStudent = useMemo(() => role === 'student', [role]);

  return {
    can,
    canAny,
    canAll,
    isAdmin,
    isTeacher,
    isStudent,
    role,
  };
};
