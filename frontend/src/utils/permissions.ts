export type Role = 'admin' | 'teacher' | 'student';

export interface Permission {
  resource: string;
  actions: string[];
}

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    'user:read',
    'user:create',
    'user:update',
    'user:delete',
    'course:read',
    'course:create',
    'course:update',
    'course:delete',
    'project:read',
    'project:create',
    'project:update',
    'project:delete',
    'resource:read',
    'resource:create',
    'resource:update',
    'resource:delete',
  ],
  teacher: [
    'user:read',
    'course:read',
    'course:create',
    'course:update',
    'project:read',
    'project:create',
    'project:update',
    'resource:read',
    'resource:create',
    'resource:update',
  ],
  student: [
    'course:read',
    'project:read',
    'project:create',
    'project:update',
    'resource:read',
  ],
};

export const hasPermission = (role: Role, permission: string): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

export const hasAnyPermission = (role: Role, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(role, permission));
};

export const hasAllPermissions = (role: Role, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(role, permission));
};
