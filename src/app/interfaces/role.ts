export type RoleCategory = 'ROLE_ADMIN' | 'ROLE_OWNER' | 'ROLE_EMPLOYEE';
export type RoleName = 'ROLE_OWNER' | 'ROLE_MANAGER' | 'ROLE_ASSISTANT_MANAGER' | 'ROLE_TEAM_LEADER' | 'ROLE_EMPLOYEE';

export interface RoleInterface {
  id: number;
  roleName: string;
  roleCategory: RoleCategory; // O usa tu tipo RoleCategory
}

export interface RoleResponseInterface {
  idRole: number;
  roleName: string;
}

export interface RoleCreateInterface {
  roleName: string;
}