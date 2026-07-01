import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicFormComponent } from '../../../shared/components/dynamic-form/dynamic-form';
import { LOGIN_FORM } from '../../../forms/login-form';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [DynamicFormComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {

  fields = LOGIN_FORM;

  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  onSubmit(data: any) {
    this.authService.login(data).subscribe({
      next: (res) => {
        // Guardamos token y el signal se actualiza automáticamente con el rol
        this.authService.saveToken(res.token);

        // Mensaje de feedback visual extra
        this.snackBar.open('¡Bienvenido!', 'Aceptar', {
          duration: 2500,
          panelClass: ['snackbar-success'], // Requiere estilo si lo tienes custom
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });

        // Redirigimos al área protegida
        this.router.navigate(['/dashboard/home']);
      },
      error: (err) => {
        console.error('Error en login:', err);
        // Feedack al usuario en caso de DNI o Password incorrectos
        this.snackBar.open('Credenciales incorrectas', 'Aceptar', {
          duration: 3500,
          panelClass: ['snackbar-error'],
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      }
    });
  }
}
