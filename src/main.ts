import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

/**
 * Punto de entrada principal de la aplicación Angular.
 * Utiliza la función bootstrapApplication para iniciar la aplicación con la configuración especificada.
 **/

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err)); // Manejo básico de errores durante el arranque de la aplicación.
