import { Component, inject } from '@angular/core';
import { DynamicFormComponent } from '../../../shared/components/dynamic-form/dynamic-form';
import { ADMIN_LOGIN_FORM } from '../../../forms/admin-login';
import { AdminService } from '../../../core/services/admin.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [DynamicFormComponent],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLoginComponent {

  fields = ADMIN_LOGIN_FORM;
  title = "Iniciar Sesión"
  subtitle = "Completa los datos para iniciar sesión"
  submitLabel = "Login"

  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit(data: any) {
    this.adminService.login(data).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token)
        this.router.navigate(["dashboard/home"])
      },
      error: (err) => {
        console.error("Error login: ", err)
      }
    })
  }
}
