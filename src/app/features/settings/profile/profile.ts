import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MaterialModule } from '../../../shared/ui/material-modules';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeInterface } from '../../../interfaces/employee';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');
  if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  profile = signal<EmployeeInterface | null>(null);
  loading = signal(true);
  changingPassword = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.employeeService.getMyProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.notify('Error cargando el perfil', 'error');
        this.loading.set(false);
      },
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;

    this.changingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.employeeService.changeMyPassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.notificationService.notify('Contraseña actualizada correctamente', 'success');
        this.passwordForm.reset();
        this.changingPassword.set(false);
      },
      error: (err) => {
        const msg = err.status === 401
          ? 'La contraseña actual es incorrecta'
          : 'Error al cambiar la contraseña';
        this.notificationService.notify(msg, 'error');
        this.changingPassword.set(false);
      },
    });
  }

  formatRole(role: string | undefined): string {
    if (!role) return 'N/A';
    return role
      .replace('ROLE_', '')
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  get roleClass(): string {
    const role = this.profile()?.role ?? '';
    return role.toLowerCase().replace('role_', '');
  }
}
