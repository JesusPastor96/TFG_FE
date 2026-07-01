import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/ui/material-modules';
import { RoleService } from '../../core/services/role.service';
import { ScreenSizeService } from '../../core/services/screen-size';
import { FormFieldInterface } from '../../interfaces/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RoleResponseInterface } from '../../interfaces/role';
import { NotificationService } from '../../core/services/notification.service';
import { DynamicTableColumn } from '../../interfaces/dynamic-table';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, MaterialModule, DynamicTableComponent],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class RolesComponent {
  protected roleService = inject(RoleService);
  public screenSize = inject(ScreenSizeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private notificationService = inject(NotificationService);

  roles = signal<RoleResponseInterface[]>([]);
  showCreateForm = false;
  selectedCategory = signal<string>('ALL');

  roleFields: FormFieldInterface[] = [
    { name: 'roleName', label: 'Nombre del Rol (ej: ADMIN)', type: 'text', required: true },
  ];

  tableColumns: DynamicTableColumn<RoleResponseInterface>[] = [
    {
      key: 'roleName',
      label: 'Identificador',
    },
  ];

  ngOnInit() {
    this.roleService.getRoles().subscribe({
      next: (roles) => this.roles.set(roles),
      error: (err) => console.error(err),
    });
  }

  onCreateRole(value: any) {
    this.roleService.createRole(value).subscribe({
      next: (role) => {
        this.roles.update((list) => [...list, role]);
        this.notificationService.notify('¡Rol creado correctamente!');
        this.showCreateForm = false;
      },
      error: () => {
        this.notificationService.notify('Error: No se ha podido crear el rol', 'error');
      },
    });
  }

  trackById(index: number, item: any) {
    return item.idRole;
  }
}