import { Component, inject, signal } from '@angular/core';
import { MaterialModule } from '../../shared/ui/material-modules';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { ScreenSizeService } from '../../core/services/screen-size';
import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form';
import { FormFieldInterface } from '../../interfaces/form-field';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box';
import { CreatePanelComponent } from '../../shared/components/create-panel/create-panel';
import { AdminResponseInterface } from '../../interfaces/admin';
import { NotificationService } from '../../core/services/notification.service';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table';
import { DynamicTableAction, DynamicTableColumn } from '../../interfaces/dynamic-table';
import { DetailViewComponent } from '../../shared/components/detail-view.component/detail-view.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    DynamicFormComponent,
    SearchBoxComponent,
    CreatePanelComponent,
    DynamicTableComponent,
    DetailViewComponent,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent {
  protected adminService = inject(AdminService);
  public screenSize = inject(ScreenSizeService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  admins = signal<AdminResponseInterface[]>([]);
  allAdmins: AdminResponseInterface[] = [];

  selectedAdmin = signal<AdminResponseInterface | null>(null);
  sidenavOpen = signal(false);

  showCreateForm = false;

  tableColumns: DynamicTableColumn<AdminResponseInterface>[] = [
    { key: 'username', label: 'Nombre' },
    { key: 'email', label: 'Email' },
  ];

  tableActions: DynamicTableAction<AdminResponseInterface>[] = [
    {
      id: 'view',
      icon: 'visibility',
      tooltip: 'Ver detalle',
    },
    {
      id: 'delete',
      icon: 'delete',
      tooltip: 'Eliminar administrador',
    },
  ];

  adminFields: FormFieldInterface[] = [
    { name: 'username', label: 'Nombre de usuario', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Contraseña', type: 'password', required: true },
  ];

  ngOnInit() {
    this.adminService.getAllAdmins().subscribe({
      next: (data) => {
        this.allAdmins = data;
        this.admins.set(data);
      },
      error: () => {
        this.notificationService.notify('Error cargando administradores', 'error');
      },
    });
  }

  applyFilter(filterValue: string) {
    if (!filterValue) {
      this.admins.set(this.allAdmins);
      return;
    }

    const lower = filterValue.toLowerCase();

    const filtered = this.allAdmins.filter(
      (admin) =>
        admin.username.toLowerCase().includes(lower) ||
        admin.email.toLowerCase().includes(lower),
    );

    this.admins.set(filtered);
  }

  openSidenav(admin: AdminResponseInterface) {
    this.selectedAdmin.set(admin);
    this.sidenavOpen.set(true);
  }

  closeSidenav() {
    this.selectedAdmin.set(null);
    this.sidenavOpen.set(false);
  }

  onCreateAdmin(value: any) {
    this.adminService.createAdmin(value).subscribe({
      next: () => {
        this.adminService.getAllAdmins().subscribe({
          next: (data) => {
            this.allAdmins = data;
            this.admins.set(data);
            this.notificationService.notify('¡Administrador creado con éxito!', 'success');
            this.showCreateForm = false;
          },
          error: () => {
            this.notificationService.notify('Error recargando administradores', 'error');
          },
        });
      },
      error: () => {
        this.notificationService.notify('Error: No se ha podido crear el administrador', 'error');
      },
    });
  }

  onTableAction(event: { action: string; row: AdminResponseInterface }): void {
    if (event.action === 'view') {
      this.openSidenav(event.row);
    } else if (event.action === 'delete') {
      this.deleteAdmin(event.row.idAdmin);
    }
  }

  deleteAdmin(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '350px' });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminService.deleteById(id).subscribe({
          next: () => {
            this.admins.update((list) => list.filter((a) => a.idAdmin !== id));
            this.allAdmins = this.allAdmins.filter((a) => a.idAdmin !== id);
            this.notificationService.notify('Administrador borrado correctamente');
            if (this.selectedAdmin()?.idAdmin === id) {
              this.closeSidenav();
            }
          },
          error: () => {
            this.notificationService.notify(
              'Error: No se ha podido borrar el administrador',
              'error',
            );
          },
        });
      }
    });
  }
}