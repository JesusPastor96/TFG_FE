import { Component, HostListener, inject, signal, OnInit, computed } from '@angular/core';
import { TableService } from '../../core/services/table.service';
import { TableCreateInterface, TableResponseInterface } from '../../interfaces/table';
import { NotificationService } from '../../core/services/notification.service';
import { MaterialModule } from '../../shared/ui/material-modules';
import { CreatePanelComponent } from '../../shared/components/create-panel/create-panel';
import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form';
import { RestaurantService } from '../../core/services/restaurant.service';
import { RestaurantsResponseInterface } from '../../interfaces/restaurant';
import { ScreenSizeService } from '../../core/services/screen-size';
import { CommonModule } from '@angular/common';
import { TABLE_CREATE_FORM } from '../../forms/table-create';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { ElementService } from '../../core/services/element.service';
import { ElementCreateInterface, ElementResponseInterface } from '../../interfaces/element';
import { EmployeeService } from '../../core/services/employee.service';
import { EmployeeInterface } from '../../interfaces/employee';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Floor } from '../../core/models/floor';
import { FloorService } from '../../core/services/floor.service';
import { FloorNameDialogComponent } from './floor-name-dialog';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-tables',
  imports: [
    CreatePanelComponent,
    DynamicFormComponent,
    MaterialModule,
    CommonModule,
    DragDropModule,
  ],
  standalone: true,
  templateUrl: './tables.html',
  styleUrl: './tables.scss',
})
export class TablesComponent implements OnInit {
  public screenSize = inject(ScreenSizeService);
  public tablesService = inject(TableService);
  private notificationService = inject(NotificationService);
  private restaurantService = inject(RestaurantService);
  private elementService = inject(ElementService);
  private employeeService = inject(EmployeeService);
  private floorService = inject(FloorService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  // --- PERMISSIONS (RBAC) ---
  canManageTables = signal<boolean>(false);
  canManageLayout = signal<boolean>(false);
  canMoveTables = signal<boolean>(false);
  canAssignEmployees = signal<boolean>(false);
  isEmployeeOnly = signal<boolean>(false);      // Read-only view

  tableList = signal<TableResponseInterface[]>([]);
  elementList = signal<ElementResponseInterface[]>([]);
  availableEmployees = signal<EmployeeInterface[]>([]);
  restaurants = signal<RestaurantsResponseInterface[]>([]);
  floors = signal<Floor[]>([]);
  activeFloorId = signal<number | null>(null);
  restaurantName = signal<string>('Cargando...');
  idRestaurant = signal<number>(0);

  // ZOOM & PAN STATE
  zoom = signal<number>(1.0); 
  translateX = signal<number>(0);
  translateY = signal<number>(0);

  minZoom = 0.2; 
  maxZoom = 10; 
  stepZoom = 0.1;

  private isPanning = false;
  private startX = 0;
  private startY = 0;

  private readonly floorWidth = 4000;
  private readonly floorHeight = 3000;

  // RESIZING STATE
  private isResizing = false;
  private resizeElementTarget: ElementResponseInterface | null = null;
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartWidth = 0;
  private resizeStartHeight = 0;

  showCreateForm = false;
  tableFields = TABLE_CREATE_FORM;

  ngOnInit(): void {
    this.checkPermissions();
    this.getDatosIniciales();
  }

  checkPermissions() {
    const level = this.authService.currentLevel;

    this.canManageTables.set(level >= 0);
    this.canManageLayout.set(level >= 4);
    this.canMoveTables.set(level >= 0);
    this.canAssignEmployees.set(level >= 0);
    this.isEmployeeOnly.set(false);
  }

  filteredEmployees = computed(() => {
    const all = this.availableEmployees();
    if (this.authService.currentLevel >= 1) return all;
    
    // Si es nivel 0 (Employee), solo puede verse a sí mismo para asignarse
    const myDni = (this.authService.usernameValue || '').trim().toUpperCase();
    return all.filter(e => (e.dni || '').trim().toUpperCase() === myDni);
  });

  getDatosIniciales() {
    this.loadRestaurant();
  }

  loadRestaurant() {
    this.restaurantService.getEmployeeRestaurant().subscribe({
      next: (data: RestaurantsResponseInterface) => {
        const restaurant = data;
        if (!restaurant) return;

        this.idRestaurant.set(restaurant.idRestaurant);
        this.restaurantName.set(restaurant.restaurantName);

        this.loadFloors();
        this.loadEmployees();

        setTimeout(() => this.enforceBounds(), 200);
      },
    });
  }

  loadFloors() {
    this.floorService.getFloorsByRestaurant(this.idRestaurant()).subscribe({
      next: (floors) => {
        this.floors.set(floors);
        if (floors.length > 0 && !this.activeFloorId()) {
          this.selectFloor(floors[0].idFloor);
        }
      },
      error: () => this.notificationService.notify('Error cargando las plantas', 'error'),
    });
  }

  isPrimaryFloor(floorId: number): boolean {
    const floorList = this.floors();
    return floorList.length > 0 && floorList[0].idFloor === floorId;
  }

  selectFloor(floorId: number) {
    this.activeFloorId.set(floorId);
    this.loadTables();
    this.loadElements();
  }

  addFloor() {
    if (!this.canManageLayout()) return;
    
    const dialogRef = this.dialog.open(FloorNameDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(name => {
      if (name) {
        this.floorService.createFloor(this.idRestaurant(), name).subscribe({
          next: (newFloor) => {
            this.notificationService.notify('Planta añadida', 'success');
            this.loadFloors();
            this.selectFloor(newFloor.idFloor);
          },
          error: () => this.notificationService.notify('Error añadiendo la planta', 'error'),
        });
      }
    });
  }

  deleteFloor(event: MouseEvent, floorId: number) {
    if (!this.canManageLayout()) return;
    event.stopPropagation(); // Evitar seleccionar la planta al pulsar borrar

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.floorService.deleteFloor(floorId).subscribe({
          next: () => {
            this.notificationService.notify('Planta eliminada', 'success');
            if (this.activeFloorId() === floorId) {
              this.activeFloorId.set(null);
              this.tableList.set([]);
              this.elementList.set([]);
            }
            this.loadFloors();
          },
          error: () => this.notificationService.notify('Error eliminando la planta', 'error'),
        });
      }
    });
  }

  loadTables() {
    const floorId = this.activeFloorId();
    if (!floorId) return;

    this.tablesService.getTablesByFloor(floorId).subscribe({
      next: (tables) => {
        this.tableList.set(
          tables.map((t, i) => ({
            ...t,
            posX: t.posX ?? i * 160,
            posY: t.posY ?? 50,
          })),
        );
      },
      error: () => this.notificationService.notify('Error cargando las mesas', 'error'),
    });
  }

  loadElements() {
    const floorId = this.activeFloorId();
    if (!floorId) return;

    this.elementService.getElementsByFloor(floorId).subscribe({
      next: (elements) => {
        this.elementList.set(elements);
      },
      error: () => this.notificationService.notify('Error cargando elementos', 'error'),
    });
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.availableEmployees.set(employees);
      },
      error: () => this.notificationService.notify('Error cargando empleados', 'error'),
    });
  }

  updateStatus(tableId: number, status: string) {
    this.tablesService.updateStatus(tableId, status).subscribe({
      next: () => {
        this.notificationService.notify('Estado actualizado', 'success');
        this.loadTables();
      },
      error: () => this.notificationService.notify('Error actualizando estado', 'error'),
    });
  }

  onCreateMesa(tableData: any) {
    if (!this.canManageTables()) return;

    const dataWithFloor = { ...tableData, idFloor: this.activeFloorId() };
    this.tablesService.createTable(this.idRestaurant(), dataWithFloor).subscribe({
      next: (res) => {
        this.notificationService.notify('Mesa creada con éxito', 'success');
        this.showCreateForm = false;
        this.loadTables();
      },
      error: (err) => {
        console.error('Error creando mesa', err);
        this.notificationService.notify('Error: no se ha podido crear la mesa', 'error');
      },
    });
  }

  // --- NAVEGACIÓN (ZOOM) ---

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -this.stepZoom : this.stepZoom;
    const oldZoom = this.zoom();
    const newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, oldZoom + delta));

    if (newZoom !== oldZoom) {
      this.zoom.set(newZoom);
      this.enforceBounds();
    }
  }

  startPanning(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('.table-card') || target.closest('.restaurant-element') || target.closest('button') || target.closest('.resize-handle')) return;

    this.isPanning = true;
    this.startX = event.clientX - this.translateX();
    this.startY = event.clientY - this.translateY();
  }

  deleteTable(id: number) {
    if (!this.canManageTables()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.tablesService.deleteTable(id).subscribe({
          next: () => {
            this.notificationService.notify('Mesa eliminada', 'success');
            this.loadTables();
          },
          error: () => this.notificationService.notify('Error eliminando mesa', 'error'),
        });
      }
    });
  }

  // --- ELEMENTOS DECORATIVOS ---

  addElement(type: string) {
    if (!this.canManageLayout()) return;

    let w = 40;
    let h = 40;

    if (type === 'WALL') { w = 80; h = 15; }
    else if (type === 'WINDOW') { w = 60; h = 10; }
    else if (type === 'BAR') { w = 120; h = 40; }
    else if (type === 'DOOR') { w = 50; h = 12; }
    else if (type === 'WC') { w = 50; h = 50; }
    else if (type === 'KITCHEN') { w = 140; h = 80; }
    else if (type === 'COLUMN') { w = 30; h = 30; }
    else if (type === 'SOFA') { w = 90; h = 45; }
    else if (type === 'STAIRS') { w = 100; h = 80; }

    const newElement: ElementCreateInterface = {
      type: type,
      posX: 100,
      posY: 100,
      width: w,
      height: h,
      rotation: 0,
      idFloor: this.activeFloorId() || undefined
    };

    this.elementService.createElement(this.idRestaurant(), newElement).subscribe({
      next: () => {
        this.notificationService.notify('Elemento añadido', 'success');
        this.loadElements();
      },
      error: () => this.notificationService.notify('Error añadiendo elemento', 'error'),
    });
  }

  deleteElement(id: number) {
    if (!this.canManageLayout()) return;

    this.elementService.deleteElement(id).subscribe({
      next: () => {
        this.notificationService.notify('Elemento eliminado', 'success');
        this.loadElements();
      },
    });
  }

  rotateElement(element: ElementResponseInterface) {
    if (!this.canManageLayout()) return;

    const newRotation = element.rotation === 0 ? 90 : 0;
    element.rotation = newRotation;

    const oldWidth = element.width;
    const oldHeight = element.height;

    element.width = oldHeight;
    element.height = oldWidth;

    let newX = element.posX + (oldWidth - oldHeight) / 2;
    let newY = element.posY + (oldHeight - oldWidth) / 2;

    const gridSize = 20;
    newX = Math.round(newX / gridSize) * gridSize;
    newY = Math.round(newY / gridSize) * gridSize;

    element.posX = newX;
    element.posY = newY;

    this.elementService.updatePosition(element.idElement, element.posX, element.posY, newRotation).subscribe(() => {
      this.elementService.updateDimensions(element.idElement, element.width, element.height).subscribe();
    });
  }

  onElementDragEnd(event: CdkDragEnd, element: ElementResponseInterface) {
    if (this.isResizing || !this.canManageLayout()) return;

    const pos = event.source.getFreeDragPosition();
    const currentScale = this.zoom();
    const gridSize = 20;

    const newX = Math.round((element.posX + (pos.x / currentScale)) / gridSize) * gridSize;
    const newY = Math.round((element.posY + (pos.y / currentScale)) / gridSize) * gridSize;

    element.posX = newX;
    element.posY = newY;
    event.source.reset();

    this.elementService.updatePosition(element.idElement, newX, newY, element.rotation).subscribe();
  }

  startResize(event: MouseEvent, element: ElementResponseInterface) {
    if (!this.canManageLayout()) return;
    
    event.stopPropagation();
    event.preventDefault();

    this.isResizing = true;
    this.resizeElementTarget = element;

    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeStartWidth = element.width;
    this.resizeStartHeight = element.height;
  }

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      this.translateX.set(event.clientX - this.startX);
      this.translateY.set(event.clientY - this.startY);
      this.enforceBounds();
      return;
    }

    if (this.isResizing && this.resizeElementTarget) {
      const dx = (event.clientX - this.resizeStartX) / this.zoom();
      const dy = (event.clientY - this.resizeStartY) / this.zoom();

      this.resizeElementTarget.width = Math.round(Math.max(20, this.resizeStartWidth + dx));
      this.resizeElementTarget.height = Math.round(Math.max(20, this.resizeStartHeight + dy));
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onWindowMouseUp(event: MouseEvent) {
    if (this.isPanning) {
      this.isPanning = false;
    }

    if (this.isResizing && this.resizeElementTarget) {
      this.elementService.updateDimensions(
        this.resizeElementTarget.idElement,
        this.resizeElementTarget.width,
        this.resizeElementTarget.height
      ).subscribe();

      this.isResizing = false;
      this.resizeElementTarget = null;
    }
  }

  private enforceBounds() {
    const container = document.querySelector('.floor-container');
    if (!container) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    const scaledW = this.floorWidth * this.zoom();
    const scaledH = this.floorHeight * this.zoom();

    const margin = 100;

    let tx = this.translateX();
    let ty = this.translateY();

    if (scaledW + (margin * 2) <= containerW) {
      tx = (containerW - scaledW) / 2;
    } else {
      const minX = containerW - scaledW - margin;
      const maxX = margin;
      tx = Math.max(minX, Math.min(maxX, tx));
    }

    if (scaledH + (margin * 2) <= containerH) {
      ty = (containerH - scaledH) / 2;
    } else {
      const minY = containerH - scaledH - margin;
      const maxY = margin;
      ty = Math.max(minY, Math.min(maxY, ty));
    }

    this.translateX.set(tx);
    this.translateY.set(ty);
  }

  onDragEnd(event: CdkDragEnd, table: TableResponseInterface) {
    if (!this.canMoveTables()) return;

    const pos = event.source.getFreeDragPosition();
    const currentScale = this.zoom();
    const gridSize = 20;

    const newX = Math.round((table.posX! + (pos.x / currentScale)) / gridSize) * gridSize;
    const newY = Math.round((table.posY! + (pos.y / currentScale)) / gridSize) * gridSize;

    table.posX = newX;
    table.posY = newY;
    event.source.reset();

    this.tablesService.updatePosition(table.idTable, newX, newY).subscribe();
  }

  // --- EMPLOYEE ASSIGNMENT ---

  assignEmployee(tableId: number, employeeId: number) {
    this.tablesService.assignEmployee(tableId, employeeId).subscribe({
      next: () => {
        this.notificationService.notify('Empleado asignado correctamente', 'success');
        this.loadTables();
      },
      error: () => this.notificationService.notify('Error al asignar empleado', 'error'),
    });
  }

  unassignEmployee(idAssignment: number) {
    this.tablesService.closeAssignment(idAssignment).subscribe({
      next: () => {
        this.notificationService.notify('Mesa liberada', 'success');
        this.loadTables();
      },
      error: () => this.notificationService.notify('Error al liberar mesa', 'error'),
    });
  }

  reassignEmployee(tableId: number, idAssignment: number, employeeId: number) {
    this.tablesService.closeAssignment(idAssignment).subscribe({
      next: () => {
        this.assignEmployee(tableId, employeeId);
      },
      error: () => this.notificationService.notify('Error al cambiar empleado', 'error'),
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return '??';
    const parts = name.split(' ');
    let initials = '';
    if (parts.length > 0 && parts[0]) initials += parts[0][0];
    if (parts.length > 1 && parts[1]) initials += parts[1][0];
    return initials.toUpperCase();
  }

  resetLayout() {
    if (!this.canMoveTables()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const spacingX = 180;
        const spacingY = 140;
        const startX = 20;
        const startY = 20;
        const maxColumns = 6;

        this.tableList().forEach((table, index) => {
          const col = index % maxColumns;
          const row = Math.floor(index / maxColumns);

          const posX = startX + col * spacingX;
          const posY = startY + row * spacingY;

          table.posX = posX;
          table.posY = posY;

          this.tablesService.updatePosition(table.idTable, posX, posY).subscribe();
        });
      }
    });
  }
}
