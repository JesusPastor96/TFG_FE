import { Component, computed, inject, signal } from '@angular/core';
import { ScreenSizeService } from '../../core/services/screen-size';
import { MaterialModule } from '../../shared/ui/material-modules';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box';
import { RestaurantsResponseInterface } from '../../interfaces/restaurant';
import { RestaurantService } from '../../core/services/restaurant.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { DetailViewComponent } from '../../shared/components/detail-view.component/detail-view.component';
import { RESTAURANT_CREATE_FORM } from '../../forms/restaurant-create';
import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form';
import { CreatePanelComponent } from '../../shared/components/create-panel/create-panel';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table';
import { DynamicTableAction, DynamicTableColumn } from '../../interfaces/dynamic-table';

@Component({
  selector: 'app-restaurants',
  imports: [
    MaterialModule,
    SearchBoxComponent,
    DetailViewComponent,
    DynamicFormComponent,
    DynamicTableComponent,
    CreatePanelComponent,
  ],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.scss',
})
export class RestaurantsComponent {
  public screenSize = inject(ScreenSizeService);
  private restaurantService = inject(RestaurantService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  private sourceRestaurants: RestaurantsResponseInterface[] = [];

  restaurants = signal<RestaurantsResponseInterface[]>([]);
  role = signal('');
  showCreateForm = false;
  hasRestaurant = signal(true);

  restaurantFields = RESTAURANT_CREATE_FORM;

  selectedRestaurant = signal<RestaurantsResponseInterface | null>(null);
  sidenavOpen = signal(false);

  tableColumns = computed<DynamicTableColumn<RestaurantsResponseInterface>[]>(() =>
    this.screenSize.isMobile()
      ? [
          { key: 'cif', label: 'CIF' },
          { key: 'restaurantName', label: 'Restaurante' },
          { key: 'ownerName', label: 'Contacto' },
          { key: 'phone', label: 'Teléfono' },
        ]
      : [
          { key: 'cif', label: 'CIF' },
          { key: 'restaurantName', label: 'Restaurante' },
          { key: 'ownerName', label: 'Contacto' },
          { key: 'address', label: 'Dirección' },
          { key: 'country', label: 'País' },
          { key: 'phone', label: 'Teléfono' },
        ],
  );

  tableActions: DynamicTableAction<RestaurantsResponseInterface>[] = [
    {
      id: 'view',
      icon: 'visibility',
      tooltip: 'Ver detalle',
    },
  ];

  ngOnInit() {
    this.role.set(this.authService.getRole() || '');
    this.loadRestaurnts();
  }

  loadRestaurnts() {
    const currentRole = this.role();

    if (currentRole === 'ROLE_ADMIN') {
      this.restaurantService.getAllRestaurants().subscribe({
        next: (data: RestaurantsResponseInterface[]) => {
          this.sourceRestaurants = data || [];
          this.restaurants.set(this.sourceRestaurants);
        },
        error: () => {
          this.notificationService.notify(
            'Error no se ha podido cargar los restaurantes.',
            'error',
          );
        },
      });
    } else {
      this.restaurantService.getEmployeeRestaurant().subscribe({
        next: (data: any) => {
          if (data && !Array.isArray(data)) {
            this.sourceRestaurants = [data];
          } else if (data && Array.isArray(data)) {
            this.sourceRestaurants = data;
          } else {
            this.sourceRestaurants = [];
          }

          this.restaurants.set(this.sourceRestaurants);

          if (this.sourceRestaurants.length > 0) {
            this.showCreateForm = false;
            this.hasRestaurant.set(true);
          } else {
            this.hasRestaurant.set(false);
          }
        },
        error: (error) => {
          if (error.status !== 404) {
            this.notificationService.notify('Error al cargar tu restaurante.', 'error');
          }
          this.sourceRestaurants = [];
          this.restaurants.set([]);
          this.hasRestaurant.set(false);
        },
      });
    }
  }

  applyFilter(filterValue: string) {
    if (!filterValue) {
      this.restaurants.set(this.sourceRestaurants);
      return;
    }

    const lowerFilter = filterValue.toLowerCase();
    this.restaurants.set(
      this.sourceRestaurants.filter(
        (restaurant) =>
          restaurant.restaurantName.toLowerCase().includes(lowerFilter) ||
          restaurant.ownerName.toLowerCase().includes(lowerFilter) ||
          restaurant.cif.toLowerCase().includes(lowerFilter) ||
          restaurant.address.toLowerCase().includes(lowerFilter) ||
          restaurant.phone.toString().includes(lowerFilter),
      ),
    );
  }

  openSidenav(restaurant: RestaurantsResponseInterface) {
    this.selectedRestaurant.set(restaurant);
    this.sidenavOpen.set(true);
  }

  closeSidenav() {
    this.selectedRestaurant.set(null);
    this.sidenavOpen.set(false);
  }

  onTableAction(event: {
    action: string;
    row: RestaurantsResponseInterface;
  }): void {
    if (event.action === 'view') {
      this.openSidenav(event.row);
    }
  }

  onCreateRestaurant(restaurantData: any) {
    this.restaurantService.createRestaurant(restaurantData).subscribe({
      next: () => {
        this.notificationService.notify('¡Restaurante creado con éxito!', 'success');
        this.showCreateForm = false;
        this.loadRestaurnts();
      },
      error: (err) => {
        console.error('Error creando restaurante', err);
        this.notificationService.notify('Error: no se ha podido crear el restaurante', 'error');
      },
    });
  }
}