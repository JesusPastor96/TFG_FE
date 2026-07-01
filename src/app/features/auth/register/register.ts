import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from '../../../shared/components/dynamic-form/dynamic-form';
import { OWNER_REGISTER_FORM } from '../../../forms/owner-register';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MaterialModule } from '../../../shared/ui/material-modules';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [DynamicFormComponent, CommonModule, MaterialModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  fields = OWNER_REGISTER_FORM;
  title = "Registro"
  subtitle = "Completa los datos para registrarte"
  submitLabel = "Registrarse"
  isSubmitting = signal(false);
  registrationSuccess = signal(false);

  onSubmit(data: any) {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);

    this.authService.submitRegistration(data).subscribe({
      next: () => {
        this.registrationSuccess.set(true);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Registration error', err);
        this.notificationService.notify('Su solicitud esta pendiente de aprobación.', 'error');
        this.isSubmitting.set(false);
      }
    });
  }
}