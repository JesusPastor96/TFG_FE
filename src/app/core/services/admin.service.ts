import { inject, Injectable, signal } from '@angular/core';
import {
  AdminCreateInterface,
  AdminInterface,
  AdminResponseInterface,
} from '../../interfaces/admin';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment';
import { tap } from 'rxjs';

interface LoginRequestInterface {
  username: string;
  password: string;
}

interface LoginResponseInterface {
  token: string;
}

interface CreateOwnerRequestInterface {
  email: string;
  firstName: string;
  lastName: string;
  dni: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);

  // CRUD

  getAllAdmins() {
    return this.http.get<AdminResponseInterface[]>(`${environment.apiUrl}admin`);
  }

  createAdmin(newAdmin: AdminCreateInterface) {
    return this.http.post<AdminCreateInterface>(`${environment.apiUrl}admin/signup`, newAdmin);
  }

  deleteById(id: number) {
    return this.http.delete(`${environment.apiUrl}admin/delete-admin/${id}`, {
      responseType: 'text',
    });
  }

  //login de admin
  login(credentials: LoginRequestInterface) {
    return this.http.post<LoginResponseInterface>(`${environment.apiUrl}admin/login`, credentials);
  }

  // Crear Usuario ROLE_OWNER

  createOwner(owner: Omit<CreateOwnerRequestInterface, 'role'>) {
    const payload: CreateOwnerRequestInterface = {
      ...owner,
      role: 'ROLE_OWNER',
    };
    return this.http.post<CreateOwnerRequestInterface>(
      `${environment.apiUrl}employees/create`,
      payload,
    );
  }

  // --- ADMISIONES ---

  pendingAdmissionsCount = signal<number>(0);

  getPendingAdmissions() {
    // This should fetch users/owners with a 'PENDING' status or similar
    // For now, using a hypothetical endpoint based on the requirement
    return this.http.get<any[]>(`${environment.apiUrl}admin/signup-requests`);
  }

  updatePendingAdmissionsCount() {
    this.getPendingAdmissions().subscribe({
      next: (admissions) => {
        if (admissions && Array.isArray(admissions)) {
          const pendingCount = admissions.filter(a => a.status === 'PENDING').length;
          this.pendingAdmissionsCount.set(pendingCount);
        }
      }
    });
  }

  processAdmission(id: number, approved: boolean) {
    const action = approved ? 'approve' : 'reject';
    return this.http.post(`${environment.apiUrl}admin/signup-requests/${id}/${action}`, {}).pipe(
      tap(() => this.updatePendingAdmissionsCount())
    );
  }
}
