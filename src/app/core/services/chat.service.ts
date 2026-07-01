import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);

  enviarPregunta(pregunta: string): Observable<{ respuesta: string }> {
    return this.http.post<{ respuesta: string }>(
      `${environment.apiUrl}chat`,
      { pregunta }
    );
  }
}