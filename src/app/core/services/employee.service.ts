import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmployeeCreateInterface, EmployeeInterface } from '../../interfaces/employee';
import { RoleService } from './role.service';
import { environment } from '../../../environment';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private roleService = inject(RoleService);
  private http = inject(HttpClient);

  getEmployeesForAdmin() {
    return this.http.get<EmployeeInterface[]>(`${environment.apiUrl}employees`);
  }

  getEmployees() {
    return this.http.get<EmployeeInterface[]>(`${environment.apiUrl}employees/restaurant`);
  }

  getEmployeeById(id: number) {
    return this.http.get<EmployeeInterface>(`${environment.apiUrl}employees/${id}`);
  }

  // ── PERFIL PROPIO ──────────────────────────────────────────
  getMyProfile() {
    return this.http.get<EmployeeInterface>(`${environment.apiUrl}employees/me`);
  }

  changeMyPassword(payload: ChangePasswordPayload) {
    return this.http.put<string>(`${environment.apiUrl}employees/me/password`, payload, {
      responseType: 'text' as 'json',
    });
  }
  // ───────────────────────────────────────────────────────────

  createEmployees(employee: EmployeeCreateInterface) {
    return this.http.post<EmployeeInterface>(
      `${environment.apiUrl}employees/create`,
      employee,
    );
  }

  updateEmployee(id: number, employee: any) {
    return this.http.put<any>(`${environment.apiUrl}employees/update/${id}`, employee);
  }

  deleteEmployee(id: number) {
    return this.http.delete(`${environment.apiUrl}employees/delete/${id}`, { responseType: 'text' });
  }

  assignShiftToEmployee(employeeId: number, shiftId: number) {
    return this.http.put(
      `${environment.apiUrl}employees/${employeeId}/shift/${shiftId}`,
      {}
    );
  }
}
