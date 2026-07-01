import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../shared/ui/material-modules';
import { DetailViewComponent } from '../../shared/components/detail-view.component/detail-view.component';
import { RestaurantService } from '../../core/services/restaurant.service';
import { RestaurantsResponseInterface } from '../../interfaces/restaurant';
import { EmployeeService } from '../../core/services/employee.service';
import { EmployeeInterface } from '../../interfaces/employee';
import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form';
import { FormFieldInterface } from '../../interfaces/form-field';
import { ScreenSizeService } from '../../core/services/screen-size';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box';
import { CreatePanelComponent } from '../../shared/components/create-panel/create-panel';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';
import { NotificationService } from '../../core/services/notification.service';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table';
import { DynamicTableAction, DynamicTableColumn } from '../../interfaces/dynamic-table';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    MaterialModule,
    DetailViewComponent,
    DynamicFormComponent,
    SearchBoxComponent,
    CreatePanelComponent,
    DynamicTableComponent,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class UsersComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  public screenSize = inject(ScreenSizeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);
  private restaurantService = inject(RestaurantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  sourceEmployees = signal<EmployeeInterface[]>([]);
  searchText = signal('');
  selectedRole = signal<string | null>(null);

  employees = computed(() => {
    const text = this.searchText().toLowerCase();
    const role = this.selectedRole();
    return this.sourceEmployees().filter((emp) => {
      const matchesText =
        !text ||
        emp.firstName.toLowerCase().includes(text) ||
        emp.lastName.toLowerCase().includes(text) ||
        emp.email.toLowerCase().includes(text);

      const empRole = typeof emp.role === 'string' ? emp.role : (emp.role as any)?.roleName;
      const matchesRole = !role || empRole === role;

      return matchesText && matchesRole;
    });
  });

  restaurants = signal<RestaurantsResponseInterface[]>([]);
  role = signal(this.authService.getRole());

  showCreateForm = false;
  initialOwnerData: Record<string, any> = {};

  selectedEmployee = signal<EmployeeInterface | null>(null);
  sidenavOpen = signal(false);

  tableColumns = computed<DynamicTableColumn<EmployeeInterface>[]>(() =>
    this.screenSize.isMobile()
      ? [
          {
            key: 'fullName',
            label: 'Nombre Completo',
            valueFn: (employee) => `${employee.firstName} ${employee.lastName}`,
          },
        ]
      : [
          {
            key: 'fullName',
            label: 'Nombre Completo',
            valueFn: (employee) => `${employee.firstName} ${employee.lastName}`,
          },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Rol' },
          {
            key: 'restaurant',
            label: 'Restaurante',
            valueFn: (employee) => this.getRestaurantName(employee),
          },
        ],
  );

  tableActions: DynamicTableAction<EmployeeInterface>[] = [
    {
      id: 'view',
      icon: 'visibility',
      tooltip: 'Ver detalle',
    },
  ];

  employeeFields: FormFieldInterface[] = [
    { name: 'firstName', label: 'Nombre', type: 'text', required: true },
    { name: 'lastName', label: 'Apellidos', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Contraseña', type: 'password', required: true },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      required: true,
      maxLength: 9,
      minLength: 9,
      pattern: '^[0-9]{8}[A-Z]$',
    },
    { name: 'hireDate', label: 'Fecha de contratación', type: 'date', required: true },
    { name: 'hourlyWage', label: 'Salario por hora', type: 'number', required: true },
  ];

  ownerFields: FormFieldInterface[] = [
    { name: 'firstName', label: 'Nombre', type: 'text', required: true },
    { name: 'lastName', label: 'Apellidos', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Contraseña', type: 'password', required: true },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      required: true,
      maxLength: 9,
      minLength: 9,
      pattern: '^[0-9]{8}[A-Z]$',
    },
  ];

  ngOnInit() {
    this.loadEmployees();
    this.loadRestaurants();

    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'createOwner') {
        this.initialOwnerData = {
          firstName: params['firstName'] || '',
          lastName: params['lastName'] || '',
          email: params['email'] || '',
          dni: params['dni'] || '',
        };
        this.showCreateForm = true;
      }
    });
  }

  loadRestaurants() {
    this.restaurantService.getAllRestaurants().subscribe({
      next: (data) => this.restaurants.set(data),
      error: (err) => console.error('Error fetching restaurants', err),
    });
  }

  loadEmployees() {
    this.employeeService.getEmployeesForAdmin().subscribe({
      next: (data: EmployeeInterface[]) => {
        this.sourceEmployees.set(data);
      },
      error: (err) => {
        console.error('Error fetching employees', err);
        this.notificationService.notify('No se pudo cargar la lista de trabajadores', 'error');
      },
    });
  }

  applyFilter(filterValue: string) {
    this.searchText.set(filterValue);
  }

  onRoleFilterChange(role: string) {
    this.selectedRole.set(role === 'ALL' ? null : role);
  }

  onCreateOwner(value: any) {
    this.adminService.createOwner(value).subscribe({
      next: () => {
        this.notificationService.notify('¡Dueño creado con éxito!', 'success');
        this.showCreateForm = false;
        this.initialOwnerData = {};

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { action: null, firstName: null, lastName: null, email: null, dni: null },
          queryParamsHandling: 'merge',
        });

        this.loadEmployees();
      },
      error: (error) => {
        this.notificationService.notify('Error: no se ha podido crear el dueño', 'error');
        console.error('Error al crear owner', error);
      },
    });
  }

  onCreateEmployee(value: any) {
    try {
      // this.employeeService.createEmployee(value);
      // this.employees.set(this.employeeService.getEmployees());
      // this.notificationService.notify('¡Empleado creado con exito!', 'success');
      // this.showCreateForm = false;
    } catch (error) {
      this.notificationService.notify('Error: no se ha podido crear', 'error');
      console.error('Error al crear empleado', error);
    }
  }

  openSidenav(employee: EmployeeInterface) {
    this.selectedEmployee.set(employee);
    this.sidenavOpen.set(true);
  }

  closeSidenav() {
    this.selectedEmployee.set(null);
    this.sidenavOpen.set(false);
  }

  onTableAction(event: { action: string; row: EmployeeInterface }): void {
    if (event.action === 'view') {
      this.openSidenav(event.row);
    }
  }

  getRestaurantName(employee: EmployeeInterface): string {
    if (employee.restaurant && (employee.restaurant as any).name) {
      return (employee.restaurant as any).name;
    }

    if (typeof employee.restaurant === 'string') {
      return employee.restaurant;
    }

    const found = this.restaurants().find((r) => r.idOwner == (employee as any).id);

    const isOwner =
      typeof employee.role === 'string'
        ? employee.role === 'ROLE_OWNER'
        : (employee.role as any)?.roleName === 'ROLE_OWNER';

    if (!found && isOwner) {
      console.warn(
        `No restaurant found for OWNER ID: ${employee.id}. Available restaurants:`,
        this.restaurants(),
      );
    }

    return found ? found.restaurantName : 'No asignado';
  }
}