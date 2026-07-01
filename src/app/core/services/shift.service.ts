import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment';
import { ShiftInterface } from '../../interfaces/shift';

@Injectable({
  providedIn: 'root',
})
export class ShiftService {
  private http = inject(HttpClient);

  getAllShifts() {
    return this.http.get<ShiftInterface[]>(`${environment.apiUrl}shifts`);
  }

  createShift(payload: { assignShift: string }) {
    return this.http.post(`${environment.apiUrl}shifts`, payload);
  }

  updateShift(idShift: number, payload: { assignShift: string }) {
    return this.http.put(`${environment.apiUrl}shifts/update/${idShift}`, payload);
  }

  deleteShift(idShift: number) {
    return this.http.delete(`${environment.apiUrl}shifts/delete/${idShift}`, {
      responseType: 'text',
    });
  }
}
