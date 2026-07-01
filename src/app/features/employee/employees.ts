import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatePanelComponent } from '../../shared/components/create-panel/create-panel';
import { ScreenSizeService } from '../../core/services/screen-size';
import { NotificationService } from '../../core/services/notification.service';
import { FormFieldInterface } from '../../interfaces/form-field';
import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/RoleEnum';
import { RoleService } from '../../core/services/role.service';
import { EmployeeService } from '../../core/services/employee.service';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box';
import { EmployeeInterface } from '../../interfaces/employee';
import { MaterialModule } from '../../shared/ui/material-modules';
import { RestaurantService } from '../../core/services/restaurant.service';
import { DetailViewComponent } from '../../shared/components/detail-view.component/detail-view.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table';
import { DynamicTableAction, DynamicTableColumn } from '../../interfaces/dynamic-table';

@Component({
  selector: 'app-employees',
  imports: [
    CreatePanelComponent,
    DynamicFormComponent,
    SearchBoxComponent,
    MaterialModule,
    DetailViewComponent,
    CommonModule,
    DynamicTableComponent,
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class EmployeesComponent {
  public roleService = inject(RoleService);
  public employeeService = inject(EmployeeService);
  public restaurantService = inject(RestaurantService);
  public screenSize = inject(ScreenSizeService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  employees = signal<EmployeeInterface[]>([]);
  filteredEmployees = signal<EmployeeInterface[]>([]);
  selectedEmployee = signal<EmployeeInterface | null>(null);
  sidenavOpen = signal(false);
  isEditingEmployee = signal(false);
  canEditSelectedEmployee = computed(() => {
    const selected = this.selectedEmployee();
    if (!selected) return false;

    const loggedInDni = (this.authService.usernameValue || '').trim().toUpperCase();
    const targetDni = (selected.dni || '').trim().toUpperCase();
    
    // Si es mi propio perfil, siempre puedo editar mis datos básicos
    if (targetDni === loggedInDni) return true;

    const loggedInLevel = this.authService.currentLevel;
    const targetRoleName = this.getRoleName(selected).trim().toUpperCase();
    const targetLevel = this.authService.roleLevels[targetRoleName] ?? 0;

    // Solo nivel 2+ puede editar a otros, y solo si son de nivel inferior
    return loggedInLevel >= 2 && loggedInLevel > targetLevel;
  });
  canDeleteSelectedEmployee = computed(() => {
    const selected = this.selectedEmployee();
    if (!selected) return false;

    const loggedInDni = (this.authService.usernameValue || '').trim().toUpperCase();
    const targetDni = (selected.dni || '').trim().toUpperCase();
    
    // No puedes borrarte a ti mismo
    if (targetDni === loggedInDni) return false;

    const loggedInLevel = this.authService.currentLevel;
    const targetRoleName = this.getRoleName(selected).trim().toUpperCase();
    const targetLevel = this.authService.roleLevels[targetRoleName] ?? 0;

    // Solo nivel 2+ puede borrar a otros, y solo si son de nivel inferior
    return loggedInLevel >= 2 && loggedInLevel > targetLevel;
  });

  canSeeSelectedSalary = computed(() => {
    const selected = this.selectedEmployee();
    if (!selected) return false;

    const loggedInDni = (this.authService.usernameValue || '').trim().toUpperCase();
    const targetDni = (selected.dni || '').trim().toUpperCase();
    if (targetDni === loggedInDni) return true;

    if (this.authService.isAdmin()) return true;

    const loggedInLevel = this.authService.currentLevel;
    const targetRoleName = this.getRoleName(selected).trim().toUpperCase();
    const targetLevel = this.authService.roleLevels[targetRoleName] ?? 0;

    return loggedInLevel > targetLevel;
  });

  canEditSelectedSalary = computed(() => {
    const selected = this.selectedEmployee();
    if (!selected) return false;

    const loggedInDni = (this.authService.usernameValue || '').trim().toUpperCase();
    const targetDni = (selected.dni || '').trim().toUpperCase();
    const isSelf = targetDni === loggedInDni;
    
    // NUNCA puedes editar tu propio salario
    if (isSelf) return false;

    if (this.authService.isAdmin()) return true;

    const loggedInLevel = this.authService.currentLevel;
    const targetRoleName = this.getRoleName(selected).trim().toUpperCase();
    const targetLevel = this.authService.roleLevels[targetRoleName] ?? 0;

    return loggedInLevel > targetLevel;
  });

  showCreateForm = false;

  employeeFields: FormFieldInterface[] = [];
  editEmployeeFields: FormFieldInterface[] = [];
  editInitialValues: Record<string, any> = {};
  restaurantName = signal<string>('Cargando...');

  tableColumns = computed<DynamicTableColumn<EmployeeInterface>[]>(() =>
    this.screenSize.isMobile()
      ? [
          { key: 'firstName', label: 'Nombre' },
          { key: 'lastName', label: 'Apellidos' },
          {
            key: 'role',
            label: 'Rol',
            type: 'badge',
            valueFn: (employee) => this.getRoleName(employee),
            badgeClassFn: (employee) => this.getRoleName(employee).toLowerCase(),
          },
        ]
      : [
          { key: 'firstName', label: 'Nombre' },
          { key: 'lastName', label: 'Apellidos' },
          { key: 'dni', label: 'DNI' },
          { key: 'email', label: 'Email' },
          {
            key: 'role',
            label: 'Rol',
            type: 'badge',
            valueFn: (employee) => this.getRoleName(employee),
            badgeClassFn: (employee) => this.getRoleName(employee).toLowerCase(),
          },
        ],
  );

  tableActions: DynamicTableAction<EmployeeInterface>[] = [
    {
      id: 'view',
      icon: 'chevron_right',
      tooltip: 'Ver detalles/Editar',
    },
  ];

  ngOnInit(): void {
    this.employeeFields = [
      { name: 'firstName', label: 'Nombre', type: 'text', required: true },
      { name: 'lastName', label: 'Apellidos', type: 'text', required: true },
      { name: 'dni', label: 'DNI', type: 'text', required: true, minLength: 9, maxLength: 9 },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Contraseña', type: 'password', required: true },
      { name: 'hourlyWage', label: 'Salario por hora', type: 'number', required: true },
      {
        name: 'role',
        label: 'Rol',
        type: 'select',
        options: this.buildRoleOptions(),
      },
    ];

    this.editEmployeeFields = [
      { name: 'firstName', label: 'Nombre', type: 'text', required: true },
      { name: 'lastName', label: 'Apellidos', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'hourlyWage', label: 'Salario por hora', type: 'number', required: true },
      {
        name: 'role',
        label: 'Rol',
        type: 'select',
        options: this.buildRoleOptions(),
        required: true,
      },
    ];

    this.getRestaurantName();
    this.getDatosIniciales();
  }

  getDatosIniciales() {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.filteredEmployees.set(data);
      },
      error: () => {
        this.notificationService.notify('Error cargando empleados', 'error');
      },
    });
  }

  private buildRoleOptions(): { value: string; label: string }[] {
    const currentRole = this.authService.roleValue;
    if (!currentRole) return [];

    const allowedRoles = this.roleService.getAssignableRoles(currentRole);

    return allowedRoles.map((role) => ({
      value: role,
      label: this.formatRole(role),
    }));
  }

  private formatRole(role: Role): string {
    return role
      .replace('ROLE_', '')
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  onCreateEmployee(value: any) {
    const payload = {
      ...value,
      hourlyWage:
        value.hourlyWage !== undefined &&
        value.hourlyWage !== null &&
        value.hourlyWage !== ''
          ? Number(value.hourlyWage)
          : 0,
    };

    this.employeeService.createEmployees(payload).subscribe({
      next: (newEmployee: any) => {
        const current = this.employees();
        this.employees.set([...current, newEmployee]);
        this.filteredEmployees.set([...current, newEmployee]);

        this.notificationService.notify('Empleado creado con éxito!', 'success');
        this.showCreateForm = false;
        this.getDatosIniciales();
      },
      error: () => {
        this.notificationService.notify('No se ha podido crear al empleado', 'error');
      },
    });
  }

  openEmployeeDetail(employee: EmployeeInterface) {
    this.selectedEmployee.set(employee);
    this.isEditingEmployee.set(false);
    this.sidenavOpen.set(true);

    const isOwnerSelected = this.getRoleName(employee).trim().toUpperCase() === 'ROLE_OWNER';

    if (isOwnerSelected) {
      this.editEmployeeFields = [
        { name: 'firstName', label: 'Nombre', type: 'text', required: true },
        { name: 'lastName', label: 'Apellidos', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
      ];
    } else {
      const loggedInDni = (this.authService.usernameValue || '').trim().toUpperCase();
      const targetDni = (employee.dni || '').trim().toUpperCase();
      const isSelf = targetDni === loggedInDni;
      const loggedInLevel = this.authService.currentLevel;
      const targetRoleName = this.getRoleName(employee).trim().toUpperCase();
      const targetLevel = this.authService.roleLevels[targetRoleName] ?? 0;

      const canChangeRole = !isSelf && loggedInLevel >= 2 && loggedInLevel > targetLevel;

      this.editEmployeeFields = [
        { name: 'firstName', label: 'Nombre', type: 'text', required: true },
        { name: 'lastName', label: 'Apellidos', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
      ];

      if (this.canEditSelectedSalary()) {
        this.editEmployeeFields.push({
          name: 'hourlyWage',
          label: 'Salario por hora',
          type: 'number',
          required: true,
        });
      }

      if (canChangeRole) {
        this.editEmployeeFields.push({
          name: 'role',
          label: 'Rol',
          type: 'select',
          options: this.buildRoleOptions(),
          required: true,
        });
      }

    }

    this.editInitialValues = {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      hourlyWage: employee.hourlyWage,
      role: this.getRoleName(employee),
    };
  }

  closeSidenav() {
    this.sidenavOpen.set(false);
    this.selectedEmployee.set(null);
    this.isEditingEmployee.set(false);
  }

  toggleEdit() {
    this.isEditingEmployee.set(!this.isEditingEmployee());
  }

  onUpdateEmployee(value: any) {
    const employee = this.selectedEmployee();
    if (!employee) return;

    const id = this.getEmployeeId(employee);
    this.employeeService.updateEmployee(id, value).subscribe({
      next: () => {
        this.notificationService.notify('Empleado actualizado con éxito', 'success');
        this.getDatosIniciales();
        this.closeSidenav();
      },
      error: () => this.notificationService.notify('Error al actualizar empleado', 'error'),
    });
  }

  deleteEmployee(id: any, confirmNeeded = true) {
    const performDelete = () => {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          const current = this.employees().filter((e) => this.getEmployeeId(e) !== id);
          this.employees.set(current);
          this.filteredEmployees.set(current);
          this.notificationService.notify('Empleado eliminado con éxito', 'success');
          this.closeSidenav();
        },
        error: (err) => {
          console.error('Delete error:', err);
          const msg = err.error?.message || 'Error al eliminar empleado';
          this.notificationService.notify(msg, 'error');
        },
      });
    };

    if (confirmNeeded) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent);
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          performDelete();
        }
      });
    } else {
      performDelete();
    }
  }

  applyFilter(value: string) {
    const filterValue = value.toLowerCase().trim();
    if (!filterValue) {
      this.filteredEmployees.set(this.employees());
      return;
    }

    const filtered = this.employees().filter(
      (node) =>
        node.firstName.toLowerCase().includes(filterValue) ||
        node.lastName.toLowerCase().includes(filterValue) ||
        node.email.toLowerCase().includes(filterValue) ||
        node.dni.toLowerCase().includes(filterValue),
    );
    this.filteredEmployees.set(filtered);
  }

  onTableAction(event: { action: string; row: EmployeeInterface }): void {
    if (event.action === 'view') {
      this.openEmployeeDetail(event.row);
    }
  }

  getEmployeeId(employee: any): number {
    return employee?.idEmployee || employee?.idemployee || employee?.id || 0;
  }

  getRoleName(employee: any): string {
    const role = employee?.role;
    if (!role) return 'N/A';
    return role.roleName || role.name || (typeof role === 'string' ? role : 'N/A');
  }

  private getRestaurantName() {
    this.restaurantService.getEmployeeRestaurant().subscribe({
      next: (restaurant) => {
        this.restaurantName.set(restaurant.restaurantName);
      },
      error: () => {
        this.restaurantName.set('Restaurante');
        this.notificationService.notify('Error cargando restaurante', 'error');
      },
    });
  }
}