import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; 
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-registro-usuario',
  templateUrl: './registro-usuario.component.html',
  styleUrl: './registro-usuario.component.css'
})
export class RegistroUsuarioComponent {

  username: string = ''; // Inicialmente vacío
  private loggedIn = false;
    nuevoUsuario: any = {
    correo_electronico: '',
    contrasena: '',
    nombre: '',
    apellido: '',
    username: '',
    perfil: '',
    rol:''
  };

  validationErrors: any = {};
  correoExists: boolean = false;

  constructor(private router: Router, private apiService: ApiService ,@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
    };
  }

  // Verificar la disponibilidad del correo electrónico
  checkCorreoUsuarios() {
    if (!this.nuevoUsuario.correo_electronico) {
      this.validationErrors.correo_electronico = ['El correo electrónico es obligatorio.'];
      return;
    }

    this.apiService.checkCorreoUsuarios(this.nuevoUsuario.correo_electronico).subscribe(
      (response) => {
        this.correoExists = response.exists;
        if (this.correoExists) {
          this.validationErrors.correo_electronico = ['El correo electrónico ya está registrado.'];
        } else {
          this.validationErrors.correo_electronico = [];
        }
      },
      (error) => {
        console.error('Error al verificar correo electrónico:', error);
        this.validationErrors.correo_electronico = ['Error al verificar el correo electrónico.'];
      }
    );
  }

  // Actualiza el rol basado en el perfil seleccionado
  updateRol() {
    const perfil = this.nuevoUsuario.perfil;
    if (perfil === 'Residente' || perfil === 'Propietario') {
      this.nuevoUsuario.rol = 'Residente';
    } else if (perfil === 'Administracion') {
      this.nuevoUsuario.rol = 'Administracion';
    } else if (perfil === 'Seguridad') {
      this.nuevoUsuario.rol = 'Seguridad';
    } else {
      this.nuevoUsuario.rol = '';  
    }
  }

  // Método para manejar el envío del formulario
  Guardar() {
    // Validar longitud de la contraseña en el frontend
    if (this.nuevoUsuario.contrasena.length < 8) {
      this.validationErrors.contrasena = ['La contraseña debe tener al menos 8 caracteres.'];
      return;
    }

    this.apiService.createUsuario(this.nuevoUsuario).subscribe(
      (response) => {
        console.log('Usuario creado:', response);
        // Redirige a la página de gestión de usuarios o muestra un mensaje de éxito
        this.router.navigate(['/gestionusuario']);
      },
      error => {
        console.error('Error al crear usuario:', error);
        if (error.status === 422) {
          this.validationErrors = error.error.errors;
        } else {
          this.validationErrors = { general: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.' };
        }
      }
    );
  }

  logout() {
    this.loggedIn = false;
    localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
    localStorage.removeItem('role'); // Limpiar rol del localStorage
    this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
  }
  

}
