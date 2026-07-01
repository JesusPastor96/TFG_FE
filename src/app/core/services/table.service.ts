import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TableCreateInterface, TableResponseInterface } from '../../interfaces/table';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private tablesList: TableResponseInterface[] = [];

  getTables(idRestaurant: number) {
    return this.http.get<TableResponseInterface[]>(
      `${environment.apiUrl}tables/restaurant/${idRestaurant}`,
    );
  }

  getTablesByFloor(idFloor: number) {
    return this.http.get<TableResponseInterface[]>(
      `${environment.apiUrl}tables/floor/${idFloor}`,
    );
  }

  createTable(idRestaurant: number, table: TableCreateInterface) {
    return this.http.post<TableResponseInterface>(
      `${environment.apiUrl}tables/${idRestaurant}`,
      table,
    );
  }

  updateStatus(id: number, status: string) {
    return this.http.put(`${environment.apiUrl}tables/update/status/${id}?status=${status}`, {});
  }

  updatePosition(id: number, posX: number, posY: number) {
    return this.http.put(
      `${environment.apiUrl}tables/update/position/${id}?posX=${posX}&posY=${posY}`,
      {},
    );
  }

  deleteTable(id: number) {
    return this.http.delete(`${environment.apiUrl}tables/delete/${id}`, { responseType: 'text' });
  }

  assignEmployee(tableId: number, employeeId: number) {
    const startTime = new Date().toISOString();
    return this.http.post(`${environment.apiUrl}table-assignment`, {
      idTable: tableId,
      idEmployee: employeeId,
      startTime: startTime
    });
  }

  closeAssignment(idAssignment: number) {
    return this.http.put(`${environment.apiUrl}table-assignment/close/${idAssignment}`, {});
  }
}
