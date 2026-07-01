import { inject, Injectable } from '@angular/core';
import { RoleCreateInterface, RoleInterface, RoleResponseInterface } from '../../interfaces/role';
import { environment } from '../../../environment';
import { HttpClient } from '@angular/common/http';
import { Role } from '../models/RoleEnum';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private roleList: RoleInterface[] = [];

  private http = inject(HttpClient);

  private readonly creationPermissions: Record<Role, Role[]> = {
    [Role.ROLE_ADMIN]: [
      Role.ROLE_ADMIN,
      Role.ROLE_OWNER,
      Role.ROLE_MANAGER,
      Role.ROLE_ASSISTANT_MANAGER,
      Role.ROLE_TEAM_LEADER,
      Role.ROLE_EMPLOYEE,
    ],
    [Role.ROLE_OWNER]: [
      Role.ROLE_MANAGER,
      Role.ROLE_ASSISTANT_MANAGER,
      Role.ROLE_TEAM_LEADER,
      Role.ROLE_EMPLOYEE,
    ],
    [Role.ROLE_MANAGER]: [Role.ROLE_ASSISTANT_MANAGER, Role.ROLE_TEAM_LEADER, Role.ROLE_EMPLOYEE],
    [Role.ROLE_ASSISTANT_MANAGER]: [Role.ROLE_TEAM_LEADER, Role.ROLE_EMPLOYEE],
    [Role.ROLE_TEAM_LEADER]: [Role.ROLE_EMPLOYEE],
    [Role.ROLE_EMPLOYEE]: [],
  };

  getRoles() {
    return this.http.get<RoleResponseInterface[]>(`${environment.apiUrl}admin/roles`);
  }

  getRoleByName(name: string) {
    return this.roleList.find((r) => r.roleName === name);
  }

  createRole(role: RoleCreateInterface) {
    return this.http.post<RoleResponseInterface>(`${environment.apiUrl}admin/crear-role`, role);
  }

  deleteById(id: number) {
    return this.http.delete(`${environment.apiUrl}admin/roles/${id}`, { responseType: 'text' });
  }

  getAssignableRoles(currentRole: Role): Role[] {
    return this.creationPermissions[currentRole] ?? [];
  }
}
