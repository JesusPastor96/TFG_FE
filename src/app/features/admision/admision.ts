import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/ui/material-modules';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { DetailViewComponent } from '../../shared/components/detail-view.component/detail-view.component';
import { AdminService } from '../../core/services/admin.service';
import { ScreenSizeService } from '../../core/services/screen-size';
import { NotificationService } from '../../core/services/notification.service';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box';

export interface AdmissionRequest {
    idRequest: number;
    firstName: string;
    lastName: string;
    email: string;
    dni: string;
    phone?: string;
    restaurantName?: string;
    address?: string;
    message?: string;
    status?: string;
    createdAt?: string;
}

export class CustomDateAdapter extends NativeDateAdapter {
    override parse(value: any): Date | null {
        if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
            const str = value.split('/');
            const year = Number(str[2]);
            const month = Number(str[1]) - 1;
            const date = Number(str[0]);
            return new Date(year, month, date);
        }
        const timestamp = typeof value === 'number' ? value : Date.parse(value);
        return isNaN(timestamp) ? null : new Date(timestamp);
    }

    override format(date: Date, displayFormat: Object): string {
        date = new Date(Date.UTC(
            date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(),
            date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
        displayFormat = Object.assign({}, displayFormat, { timeZone: 'utc' });

        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();

        // Force DD/MM/YYYY
        return (d < 10 ? '0' : '') + d + '/' + (m < 10 ? '0' : '') + m + '/' + y;
    }
}

export const CUSTOM_DATE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-admision',
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule,
        MatDatepickerModule,
        MatNativeDateModule,
        DetailViewComponent,
        SearchBoxComponent,
    ],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
    ],
    templateUrl: './admision.html',
    styleUrl: './admision.scss',
})
export class AdmisionComponent implements OnInit {
    private adminService = inject(AdminService);
    public screenSize = inject(ScreenSizeService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    private sourceRequests: AdmissionRequest[] = [];
    requests = signal<AdmissionRequest[]>([]);

    selectedRequest = signal<AdmissionRequest | null>(null);
    sidenavOpen = signal(false);

    // Filter states
    statusFilter = signal<string>('PENDING');
    textFilter = signal<string>('');
    startDate = signal<Date | null>(null);
    endDate = signal<Date | null>(null);

    displayedColumns = computed(() =>
        this.screenSize.isMobile()
            ? ['fullName', 'status', 'actions']
            : ['fullName', 'email', 'dni', 'status', 'actions'],
    );

    ngOnInit() {
        this.loadRequests();
    }

    loadRequests() {
        this.adminService.getPendingAdmissions().subscribe({
            next: (data: AdmissionRequest[]) => {
                this.sourceRequests = data || [];
                this.applyAllFilters();
            },
            error: (err) => {
                console.error('Error fetching admissions', err);
                this.notificationService.notify('No se pudieron cargar las solicitudes pendientes', 'error');
            }
        });
    }

    applyTextFilter(filterValue: string) {
        this.textFilter.set(filterValue.toLowerCase());
        this.applyAllFilters();
    }

    applyStatusFilter(status: string) {
        this.statusFilter.set(status);
        this.applyAllFilters();
    }

    onStartDateChange(event: any) {
        this.startDate.set(event.value);
        this.applyAllFilters();
    }

    onEndDateChange(event: any) {
        this.endDate.set(event.value);
        this.applyAllFilters();
    }

    private applyAllFilters() {
        let filtered = [...this.sourceRequests];

        // 1. Status Filter
        const currentStatus = this.statusFilter();
        if (currentStatus !== 'ALL') {
            filtered = filtered.filter(req => (req.status || '').toUpperCase() === currentStatus);
        }

        // 2. Text Filter
        const text = this.textFilter();
        if (text) {
            filtered = filtered.filter(req =>
                (req.firstName || '').toLowerCase().includes(text) ||
                (req.lastName || '').toLowerCase().includes(text) ||
                (req.email || '').toLowerCase().includes(text)
            );
        }

        // 3. Date Filter
        const start = this.startDate();
        const end = this.endDate();

        if (start || end) {
            filtered = filtered.filter(req => {
                if (!req.createdAt) return false;
                const reqDate = new Date(req.createdAt);

                if (start && reqDate < start) return false;
                if (end) {
                    const endOfDay = new Date(end);
                    endOfDay.setHours(23, 59, 59, 999);
                    if (reqDate > endOfDay) return false;
                }
                return true;
            });
        }

        // 4. Sorting: PENDING first, then by createdAt desc, REJECTED at the bottom
        filtered.sort((a, b) => {
            const statusA = (a.status || '').toUpperCase();
            const statusB = (b.status || '').toUpperCase();

            // Status Priority: PENDING (1) > APPROVED (2) > REJECTED (3)
            const getPriority = (status: string) => {
                if (status === 'PENDING') return 1;
                if (status === 'APPROVED') return 2;
                if (status === 'REJECTED') return 3;
                return 4;
            };

            const prioA = getPriority(statusA);
            const prioB = getPriority(statusB);

            if (prioA !== prioB) {
                return prioA - prioB;
            }

            // If same status, sort by date (newest first)
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        this.requests.set(filtered);
    }

    openSidenav(request: AdmissionRequest) {
        this.selectedRequest.set(request);
        this.sidenavOpen.set(true);
    }

    closeSidenav() {
        this.selectedRequest.set(null);
        this.sidenavOpen.set(false);
    }

    onProcess(approved: boolean) {
        const request = this.selectedRequest();
        if (!request) return;

        this.adminService.processAdmission(request.idRequest, approved).subscribe({
            next: () => {
                this.notificationService.notify(
                    approved ? 'Solicitud aprobada con éxito' : 'Solicitud rechazada',
                    'success'
                );
                this.closeSidenav();
                this.loadRequests();

                if (approved) {
                    this.router.navigate(['../users'], {
                        relativeTo: this.route,
                        queryParams: {
                            action: 'createOwner',
                            firstName: request.firstName,
                            lastName: request.lastName,
                            email: request.email,
                            dni: request.dni
                        }
                    });
                }
            },
            error: (err) => {
                console.error('Error processing admission', err);
                this.notificationService.notify('Error al procesar la solicitud', 'error');
            }
        });
    }
}
