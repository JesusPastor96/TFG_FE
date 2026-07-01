import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RestaurantsResponseInterface } from '../../interfaces/restaurant';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private http = inject(HttpClient);

  getAllRestaurants() {
    return this.http.get<RestaurantsResponseInterface[]>(`${environment.apiUrl}restaurant`);
  }

  getEmployeeRestaurant() {
    return this.http.get<any>(`${environment.apiUrl}restaurant/my`);
  }

  createRestaurant(restaurant: any) {
    return this.http.post<any>(`${environment.apiUrl}restaurant`, restaurant);
  }
}
