import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { ElementCreateInterface, ElementResponseInterface } from '../../interfaces/element';

@Injectable({
  providedIn: 'root',
})
export class ElementService {
  private http = inject(HttpClient);

  getElementsByRestaurant(idRestaurant: number) {
    return this.http.get<ElementResponseInterface[]>(
      `${environment.apiUrl}elements/restaurant/${idRestaurant}`,
    );
  }

  getElementsByFloor(idFloor: number) {
    return this.http.get<ElementResponseInterface[]>(
      `${environment.apiUrl}elements/floor/${idFloor}`,
    );
  }

  createElement(idRestaurant: number, element: ElementCreateInterface) {
    return this.http.post<ElementResponseInterface>(
      `${environment.apiUrl}elements/${idRestaurant}`,
      element,
    );
  }

  deleteElement(idElement: number) {
    return this.http.delete(`${environment.apiUrl}elements/delete/${idElement}`, { responseType: 'text' });
  }

  updatePosition(idElement: number, posX: number, posY: number, rotation: number = 0) {
    return this.http.put(
      `${environment.apiUrl}elements/update/position/${idElement}?posX=${posX}&posY=${posY}&rotation=${rotation}`,
      {},
    );
  }

  updateDimensions(idElement: number, width: number, height: number) {
    return this.http.put<ElementResponseInterface>(
      `${environment.apiUrl}elements/update/dimensions/${idElement}`,
      { width, height },
    );
  }
}
