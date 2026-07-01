import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModule } from '../../ui/material-modules';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-settings-menu',
  imports: [MaterialModule, RouterLink],
  templateUrl: './settings-menu.html',
  styleUrl: './settings-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsMenuComponent {
  authService = inject(AuthService);
  router = inject(Router);

  logout() {
    if (this.authService.getRole() === "ROLE_ADMIN") {
      this.authService.logout();
      this.router.navigate(['/admin/login']);
    } else {
      this.authService.logout();
      this.router.navigate(['/login']);
    }

  }
}
