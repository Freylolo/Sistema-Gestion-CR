import * as process from 'process';

// Define `window.process` para que esté disponible en el navegador
(window as any).process = process;

// Importa el polyfill de zone.js, que ya está incluido por defecto en Angular
import 'zone.js';  // Included with Angular CLI