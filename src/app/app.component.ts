import { Component, signal, OnInit, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';

// --- INTERFACES & TIPOS ---

interface AuthResponse {
  token: string;
  role: string;
}

type Page = 'login' | 'dashboard';

// --- SERVICIO DE AUTENTICACIÓN (Simula auth.service.ts) ---

class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080'; // URL del backend Spring Boot
  private tokenKey = 'jwt_token';
  private roleKey = 'user_role';

  constructor() {
    console.log(`AuthService inicializado. Backend en: ${this.apiUrl}`);
  }

  // Carga el token desde el almacenamiento local
  public token = signal<string | null>(localStorage.getItem(this.tokenKey));
  public role = signal<string | null>(localStorage.getItem(this.roleKey));

  // Booleano computado que funciona como AuthGuard
  public isAuthenticated = computed(() => !!this.token());

  /**
   * Intenta autenticar al usuario y guarda el token si es exitoso.
   * @param username Nombre de usuario.
   * @param password Contraseña.
   * @returns Observable de la respuesta de autenticación.
   */
  login(username: string, password: string) {
    // 12. Crear servicio de autenticación
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { username, password });
  }

  /**
   * Guarda el token y el rol en localStorage y en los signals.
   */
  setSession(token: string, role: string) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);
    this.token.set(token);
    this.role.set(role);
  }

  /**
   * Cierra la sesión, eliminando el token y el rol.
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    this.token.set(null);
    this.role.set(null);
  }
}

// --- COMPONENTE PRINCIPAL (AppComponent) ---

@Component({
  selector: 'app-root',
  standalone: true,
  // Importaciones necesarias: CommonModule para directivas, FormsModule para formularios, HttpClientModule para el servicio
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col">
      <!-- Barra de Navegación Simple -->
      <header class="bg-indigo-600 p-4 shadow-md flex justify-between items-center">
        <h1 class="text-white text-2xl font-semibold">Gestión de Partos</h1>
        <div class="flex items-center space-x-4">
          @if (authService.isAuthenticated()) {
            <span class="text-indigo-200">Rol: {{ authService.role() }}</span>
            <button 
              (click)="logoutAndNavigate()"
              class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md transition duration-200 shadow-lg"
            >
              Cerrar Sesión
            </button>
          } @else {
            <span class="text-indigo-200">No autenticado</span>
          }
        </div>
      </header>

      <!-- Contenido Principal (Routing manual) -->
      <main class="flex-grow flex items-center justify-center p-4">
        @switch (currentPage()) {
          @case ('login') {
            <!-- 13. Componente Login -->
            <div class="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
              <h2 class="text-3xl font-extrabold text-gray-900 mb-6 text-center">Iniciar Sesión</h2>
              
              <form (ngSubmit)="onLogin()">
                <!-- Campo Nombre de Usuario -->
                <div class="mb-4">
                  <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                  <input 
                    id="username" 
                    name="username" 
                    type="text" 
                    required 
                    [(ngModel)]="loginData.username"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    placeholder="Escribe tu usuario"
                  >
                </div>
                
                <!-- Campo Contraseña -->
                <div class="mb-6">
                  <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    [(ngModel)]="loginData.password"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    placeholder="Escribe tu contraseña"
                  >
                </div>

                <!-- Mensaje de Error -->
                @if (errorMsg()) {
                  <p class="text-sm text-red-600 mb-4 p-2 bg-red-50 rounded-lg border border-red-200">{{ errorMsg() }}</p>
                }

                <!-- Botón de Login -->
                <button 
                  type="submit"
                  [disabled]="isSubmitting()"
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50"
                >
                  @if (isSubmitting()) {
                    Cargando...
                  } @else {
                    Ingresar
                  }
                </button>
              </form>
            </div>
          }
          @case ('dashboard') {
            <!-- 13. Componente Dashboard (Protegido) -->
            <div class="w-full max-w-2xl bg-white p-10 rounded-xl shadow-2xl text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mx-auto text-green-500 mb-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>

              <h2 class="text-4xl font-extrabold text-indigo-700 mb-3">¡Bienvenido al Dashboard!</h2>
              <p class="text-xl text-gray-600 mb-6">Esta es la página principal de gestión de partos.</p>
              
              <div class="p-4 bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700 rounded-lg">
                <p class="font-semibold">Información de la Sesión:</p>
                <p>Tu Token JWT está almacenado de forma segura en el navegador.</p>
                <p>Tu Rol asignado es: <span class="font-bold">{{ authService.role() }}</span></p>
              </div>

              <p class="mt-8 text-gray-500">Aquí se agregarán las tablas clínicas en el Sprint 1.</p>
            </div>
          }
        }
      </main>
    </div>
  `,
  styles: `
    /* Estilos base con Tailwind (se asume su disponibilidad) */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    /* Estilos específicos para asegurar que el AppComponent ocupe la pantalla completa */
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
    }
    
    /* Fuente Inter para mejor estética */
    body {
      font-family: 'Inter', sans-serif;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AuthService] // Proveedor del servicio a nivel de componente
})
export class App implements OnInit {
  // 14. Uso de un servicio de autenticación global
  public authService = inject(AuthService);
  
  // 13. Estado del formulario de login
  loginData = {
    username: 'admin', // Valor por defecto para pruebas
    password: 'admin123' // Valor por defecto para pruebas
  };
  
  // Estado para el routing manual (simula el router)
  currentPage = signal<Page>('login');
  
  errorMsg = signal<string | null>(null);
  isSubmitting = signal(false);

  ngOnInit() {
    // 14. Guard inicial: Navega a dashboard si ya hay un token al cargar la app
    this.navigate(this.authService.isAuthenticated() ? 'dashboard' : 'login');
  }
  
  /**
   * Navegación controlada que simula un AuthGuard.
   * Si la página es 'dashboard' y no está autenticado, redirige a 'login'.
   * @param page La página de destino.
   */
  navigate(page: Page) {
    this.errorMsg.set(null); // Limpiar mensajes de error al navegar
    
    // AuthGuard (simulado)
    if (page === 'dashboard' && !this.authService.isAuthenticated()) {
      this.currentPage.set('login');
      console.warn("Acceso denegado. Redirigiendo a login.");
      return;
    }
    this.currentPage.set(page);
    console.log(`Navegando a: ${page}`);
  }

  /**
   * Maneja el envío del formulario de login.
   */
  onLogin() {
    this.errorMsg.set(null);
    this.isSubmitting.set(true);

    this.authService.login(this.loginData.username, this.loginData.password)
      .subscribe({
        next: (response: AuthResponse) => {
          this.authService.setSession(response.token, response.role);
          this.navigate('dashboard'); // Redirigir al dashboard
          this.isSubmitting.set(false);
        },
        error: (err) => {
          // El backend responde 401 UNAUTHORIZED si las credenciales son incorrectas
          this.errorMsg.set('Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.');
          this.isSubmitting.set(false);
          this.authService.logout(); // Asegurar que no quede sesión residual
        }
      });
  }

  /**
   * Cierra la sesión y redirige a la página de login.
   */
  logoutAndNavigate() {
    this.authService.logout();
    this.navigate('login');
  }
}