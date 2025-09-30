import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Servicio para probar la conexión con el backend de Spring Boot.
 **/

@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible globalmente.
})
export class TestService {
  // URL del endpoint de prueba en el backend de Spring Boot.
  private apiUrl = 'http://localhost:8080/api/test';

  // Inyección del modulo HttpClient para realizar peticiones HTTP.
  constructor(private http: HttpClient) {}

  /**
   * Realiza una petición GET al backend para obtener el mensaje de estado.
   * @returns Un Observable con la respuesta del backend como texto.
   **/

  getMessage(): Observable<string> {
    // responseType: 'text' es crucial porque el backend devuelve un String plano, no un objeto JSON.
    return this.http.get(this.apiUrl, { responseType: 'text'});
  }
}
