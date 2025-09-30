import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestService } from './services/test';

/**
 * Componente raíz de la aplicación Angular.
 * Utiliza el servicio TestService para probar la conexión con el backend de Spring Boot.
 **/

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  backendMessage = "Esperando respuesta del backend...";

  constructor(private TestService: TestService) {} // Inyecta el servicio en el constructor.

  ngOnInit(): void {
    this.TestService.getMessage().subscribe({
      next: (data) => {
        this.backendMessage = data; // Respuesta exitosa del backend.
      },
      error: (err) => {
        console.error('Error al conectar con el backend:', err); // Log del error.
        this.backendMessage = "Error al conectar con el backend..."; // Manejo de error.
      }
    });
  }
}
