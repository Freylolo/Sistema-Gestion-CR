import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Arranca el módulo raíz de la aplicación
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
