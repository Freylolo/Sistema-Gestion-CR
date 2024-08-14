import { Component, HostListener, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Sistema_AD_Seg';

  private idleTimeout: any;
  private readonly idleLimit = 1800000; // 30 minutos en milisegundos

  constructor(
    private router: Router,
    private apiService: ApiService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.setupIdleTimer();
  }

  // Configura el temporizador de inactividad
  private setupIdleTimer() {
    if (isPlatformBrowser(this.platformId)) {
      this.resetTimer();
      this.setupListeners();
    }
  }

  // Resetea el temporizador al realizar una acción
  private resetTimer() {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        clearTimeout(this.idleTimeout);
        this.idleTimeout = setTimeout(() => this.logout(), this.idleLimit);
      });
    }
  }

  // Configura los listeners para eventos de actividad del usuario
  private setupListeners() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('mousemove', () => this.resetTimer());
      window.addEventListener('keydown', () => this.resetTimer());
      window.addEventListener('scroll', () => this.resetTimer());
    }
  }

  // Maneja el cierre de sesión por inactividad
  private logout() {
    this.apiService.logout().subscribe(() => {
      console.log('Logged out due to inactivity');
      this.router.navigate(['/login']);
    });
  }

  // Maneja el cierre de sesión al cerrar la pestaña
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (isPlatformBrowser(this.platformId)) {
      this.apiService.logout().subscribe(() => {
        console.log('Logged out on tab close');
      });
    }
  }
  
  // Método para redirigir al login
  redirectToLogin() {
    this.router.navigate(['/login']);
  }
}
