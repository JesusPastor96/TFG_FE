import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  notify(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Aceptar', {
      duration: 3000,
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }
}
