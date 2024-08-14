import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = ''; 
  password: string = '';
  showNotification: boolean = false;
  notificationMessage: string = '';

  constructor(private router: Router, private apiService: ApiService) {}

/**
 * Nombre de la función: 'login'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * 1. Llama al servicio de autenticación `apiService.login` con `username` y `password`.
 * 2. Si la autenticación es exitosa (`response.success` es `true`), obtiene el rol del usuario almacenado en `localStorage`.
 * 3. Redirige al usuario a diferentes rutas según su rol: 
 *    - 'Administracion' a '/gestionusuario',
 *    - 'Seguridad' a '/registro-control',
 *    - 'Residente' a '/eventos',
 *    - Si el rol no coincide, redirige a '/access-denied'.
 * 4. Si la autenticación falla, muestra un mensaje de error usando `Swal.fire` indicando que el nombre de usuario o contraseña es incorrecto.
 * 5. Maneja errores en la autenticación mostrando un mensaje de error general si ocurre un problema con el servicio.
 */

  login() {
    this.apiService.login(this.username, this.password).subscribe({
        next: (response) => {
            if (response.success) {
                const storedUsername = localStorage.getItem('username');
                const role = localStorage.getItem('role');
                // Redirigir según el rol del usuario
                if (role === 'Administracion') {
                    this.router.navigate(['/gestionusuario']);
                } else if (role === 'Seguridad') {
                    this.router.navigate(['/registro-control']);
                } else if (role === 'Residente') {
                    this.router.navigate(['/eventos']);
                } else {
                    this.router.navigate(['/access-denied']);
                }
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Nombre de usuario o contraseña incorrectos',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
        },
        error: (err) => {
            console.error('Error al autenticar', err);
            Swal.fire({
                title: 'Error',
                text: 'Error en la autenticación',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    });
} 

/**
 * Nombre de la función: 'forgotPassword'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Redirige al usuario a la página de recuperación de contraseña (ruta '/loginpassword').
 */

  forgotPassword() {
    this.router.navigate(['/loginpassword']);
  }
}
