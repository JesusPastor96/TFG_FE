import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';
import { Floor } from '../models/floor';

@Injectable({
  providedIn: 'root'
})
export class FloorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}floors`;

  getFloorsByRestaurant(idRestaurant: number): Observable<Floor[]> {
    return this.http.get<Floor[]>(`${this.apiUrl}/restaurant/${idRestaurant}`);
  }

  createFloor(idRestaurant: number, name: string): Observable<Floor> {
    return this.http.post<Floor>(`${this.apiUrl}/${idRestaurant}`, null, {
      params: { name: name }
    });
  }

  updateFloor(idFloor: number, name: string): Observable<Floor> {
    return this.http.put<Floor>(`${this.apiUrl}/${idFloor}`, null, {
      params: { name: name }
    });
  }

  deleteFloor(idFloor: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idFloor}`);
  }
}
