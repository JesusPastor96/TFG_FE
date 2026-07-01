import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environment';
import { Role } from '../models/RoleEnum';

interface JwtPayloadInterface {
  sub: string;
  role: string;
  exp: number;
}

export type UserRole = 'ROLE_EMPLOYEE' | 'ROLE_OWNER' | 'ROLE_ADMIN';

export interface LoginCredentials {
  dni?: string;
  username?: string; // used by admin login
  password?: string;
}

export interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private roleSignal = signal<Role | null>(null);
  private usernameSignal = signal<string | null>(null);
  private fullNameSignal = signal<string | null>(null);

  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    const role = this.getRole();
    const tokenPayload = this.getDecodedToken();

    if (role) {
      this.roleSignal.set(role as Role);
    }
    if (tokenPayload && tokenPayload.sub) {
      this.usernameSignal.set(tokenPayload.sub);
    }
  }

  get usernameValue(): string | null {
    return this.usernameSignal();
  }

  get userFullName(): string | null {
    return this.fullNameSignal();
  }

  setFullName(name: string) {
    this.fullNameSignal.set(name);
  }

  /**
   * Performs standard user login using DNI and password
   */
  login(credentials: LoginCredentials) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}login`, credentials);
  }

  /**
   * Envía la solicitud de registro de un nuevo Owner.
   */
  submitRegistration(data: any) {
    return this.http.post(`${environment.apiUrl}signup`, data);
  }

  public readonly roleLevels: Record<string, number> = {
    ROLE_EMPLOYEE: 0,
    ROLE_TEAM_LEADER: 1,
    ROLE_ASSISTANT_MANAGER: 2,
    ROLE_MANAGER: 3,
    ROLE_OWNER: 4,
    ROLE_ADMIN: 5,
  };

  /**
   * Obtiene el rol actual de forma reactiva (Signal)
   */
  get currentRole() {
    return this.roleSignal.asReadonly();
  }

  /**
   * Obtiene el valor string del rol para comprobaciones de igualdad directa
   */
  get roleValue(): Role | null {
    return this.roleSignal();
  }

  /**
   * Obtiene el nivel numérico del rol actual
   */
  get currentLevel(): number {
    const role = this.roleSignal();
    return role ? this.roleLevels[role] : -1;
  }

  /**
   * Verifica si el usuario actual tiene el nivel necesario
   */
  hasAccess(requiredLevel: number): boolean {
    return this.currentLevel >= requiredLevel;
  }

  /**
   * Cierra la sesión y redirige al login
   */

  saveToken(token: string) {
    localStorage.setItem('token', token);
    const decoded = this.getDecodedToken();
    if (decoded && decoded.role) {
      this.roleSignal.set(decoded.role as Role);
    }
    if (decoded && decoded.sub) {
      this.usernameSignal.set(decoded.sub);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.roleSignal.set(null);
    this.usernameSignal.set(null);
    this.fullNameSignal.set(null);
  }

  getDecodedToken(): JwtPayloadInterface | null {
    const token = this.getToken();
    if (!token) return null;
    return jwtDecode<JwtPayloadInterface>(token);
  }

  getRole(): Role | null {
    //return this.getDecodedToken()?.role ?? null;
    const role = this.getDecodedToken()?.role;
    return role ? (role as Role) : null;
  }

  // hasRole(role: string): boolean {
  //   return this.getRole() === role;
  // }
  hasRole(role: Role): boolean {
    return this.roleValue === role;
  }

  isAdmin(): boolean {
    return this.roleValue === Role.ROLE_ADMIN;
  }
}
