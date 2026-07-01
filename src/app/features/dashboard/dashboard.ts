import { ChangeDetectionStrategy, Component, inject, ViewChild, OnInit, signal, effect } from '@angular/core';
import { MaterialModule } from '../../shared/ui/material-modules';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { SettingsMenuComponent } from "../../shared/components/settings-menu/settings-menu";
import { RouterOutlet } from '@angular/router';
import { ScreenSizeService } from '../../core/services/screen-size';
import { ThemeSelectorComponent } from "../../shared/components/theme-selector/theme-selector";
import { SideBarMenuComponent } from '../../shared/components/sidebar-menu/sidebar-menu';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';
import { EmployeeService } from '../../core/services/employee.service';
import { Role } from '../../core/models/RoleEnum';


@Component({
  selector: 'app-dashboard',
  imports: [MaterialModule, MatSidenavModule, SettingsMenuComponent, RouterOutlet, SideBarMenuComponent, ThemeSelectorComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  @ViewChild('sidebar-sections') drawer!: MatDrawer;
  private readonly screenSizeService = inject(ScreenSizeService);
  public authService = inject(AuthService); // Injecting AuthService directly
  private adminService = inject(AdminService);
  private employeeService = inject(EmployeeService);
  protected readonly Role = Role;


  isMobile = this.screenSizeService.isMobile;
  pendingAdmissionsCount = this.adminService.pendingAdmissionsCount;

  constructor() {
    effect(() => {
      if (this.authService.roleValue === 'ROLE_ADMIN') {
        this.adminService.updatePendingAdmissionsCount();
      } else {
        this.adminService.pendingAdmissionsCount.set(0);
      }
    });
  }

  onNavigate() {
    if (this.isMobile()) {
      this.drawer.close();
    }
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  private loadUserProfile() {
    const role = this.authService.roleValue;
    if (role && role !== Role.ROLE_ADMIN) {
      this.employeeService.getMyProfile().subscribe({
        next: (profile) => {
          if (profile) {
            this.authService.setFullName(`${profile.firstName} ${profile.lastName}`);
          }
        },
        error: () => {
          // Fallback to username if profile fetch fails
          if (this.authService.usernameValue) {
            this.authService.setFullName(this.authService.usernameValue);
          }
        }
      });
    } else if (this.authService.usernameValue) {
      // For Admins, use the username as full name
      this.authService.setFullName(this.authService.usernameValue);
    }
  }
}
