import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; 
import { PLATFORM_ID } from '@angular/core';
import Swal from 'sweetalert2';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-formulario-control',
  templateUrl: './formulario-control.component.html',
  styleUrl: './formulario-control.component.css'
})
export class FormularioControlComponent implements OnInit {

  username: string = ''; // Inicialmente vacío
  private loggedIn = false;

  nuevoControl: any = {
    id_usuario: '', 
    nombre: '',
    apellidos: '',
    cedula: '',
    sexo: '',
    placas: '',
    direccion: '',
    ingresante: '',
    fecha_ingreso: '',
    fecha_salida: '',
    observaciones: '',
    username: '' 
  };

  usuarios: any[] = []; 
  usuariosSeguridad: any[] = [];

  validationErrors: any = {};

  constructor(private router: Router, private apiService: ApiService, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
    }
    console.log('Iniciando carga de usuarios');
    this.cargarUsuarios();
  }

/**
 * Nombre de la función: cargarUsuarios
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función carga la lista de usuarios desde la API. Realiza una solicitud para obtener los datos de los usuarios 
 * y, una vez que la respuesta es recibida, almacena los usuarios en la propiedad `usuarios` y llama a 
 * `filtrarUsuariosSeguridad` para filtrar los usuarios con perfil de seguridad. Si ocurre un error durante la 
 * solicitud, se registra en la consola.
 * 
 * @returns void
 */

  cargarUsuarios(): void {
    this.apiService.getUsuarios().subscribe(
      (response) => {
        console.log('Usuarios obtenidos:', response);
        this.usuarios = response; // Asume que la respuesta es un array de usuarios
        this.filtrarUsuariosSeguridad();
      },
      (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    );
  }

/**
 * Nombre de la función: filtrarUsuariosSeguridad
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función filtra la lista de usuarios almacenada en `usuarios` para obtener solo aquellos usuarios 
 * que tienen el perfil y rol de 'Seguridad'. El resultado se almacena en la propiedad `usuariosSeguridad`.
 * 
 * @returns void
 */

  filtrarUsuariosSeguridad(): void {
    this.usuariosSeguridad = this.usuarios.filter(
      (usuario: any) => usuario.perfil === 'Seguridad' && usuario.rol === 'Seguridad'
    );
  }

/**
 * Nombre de la función: GuardarUsername
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función maneja el evento de selección de un usuario y actualiza el campo `username` del objeto `nuevoControl` 
 * con el nombre de usuario del usuario seleccionado. Primero convierte el valor del evento en un número entero 
 * para identificar al usuario seleccionado. Luego busca el usuario en la lista de `usuariosSeguridad` 
 * usando el ID del usuario. Si el usuario se encuentra, se asigna el `username` al objeto `nuevoControl`. 
 * En caso contrario, se asigna una cadena vacía y se muestra una advertencia en la consola.
 * 
 * @param event - El evento de selección que contiene el ID del usuario seleccionado.
 * @returns void
 */

  GuardarUsername(event: any): void {
    const selectedUserId = event.target.value;
    const selectedIdNumber = parseInt(selectedUserId, 10);
    if (isNaN(selectedIdNumber)) {
      return;
    }
    // Buscar el usuario seleccionado en la lista de usuarios de seguridad
    const selectedUser = this.usuariosSeguridad.find((usuario: any) => usuario.id_usuario === selectedIdNumber);
    if (selectedUser) {
      this.nuevoControl.username = selectedUser.username;
    } else {
      this.nuevoControl.username = '';
    }
  }

/**
 * Nombre de la función: onPlacaChange
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función maneja el evento de cambio de la placa ingresada y actualiza los campos del objeto `nuevoControl`
 * con la información asociada al residente y al usuario correspondiente. Primero, busca el residente asociado a
 * la placa ingresada. Luego, obtiene el usuario relacionado con el residente para actualizar los campos de nombre
 * y apellidos. También actualiza otros campos del residente como cédula y sexo. Adicionalmente, verifica el rol
 * del usuario para actualizar el campo 'ingresante'. Si no se encuentra el residente, el usuario o si ocurre
 * algún error durante las solicitudes, se limpian los campos correspondientes en `nuevoControl`.
 * 
 * @param event - El evento de cambio que contiene el valor de la placa ingresada.
 * @returns void
 */

  onPlacaChange(event: any): void {
    const placaSeleccionada = event.target.value;
  
    // Buscar el residente asociado a la placa
    this.apiService.getResidentePorPlaca(placaSeleccionada).subscribe(
      (residente: any) => {
        if (residente) {
          // Buscar el usuario asociado al residente para obtener nombre y apellido
          this.apiService.getUsuario(residente.id_usuario).subscribe(
            (usuario: any) => {
              if (usuario) {
                this.nuevoControl.nombre = usuario.nombre;
                this.nuevoControl.apellidos = usuario.apellido;
              } else {
                // Limpiar los campos si no se encuentra el usuario
                this.nuevoControl.nombre = '';
                this.nuevoControl.apellidos = '';
              }
            },
            (error) => {
              console.error('Error al obtener usuario por ID:', error);
              // Limpiar los campos si ocurre un error
              this.nuevoControl.nombre = '';
              this.nuevoControl.apellidos = '';
            }
          );
  
          // Actualizar otros campos del residente
          this.nuevoControl.cedula = residente.cedula;
          this.nuevoControl.sexo = residente.sexo; // Asegúrate de que esto esté siendo asignado correctamente
          
          // Verificar el rol del residente y actualizar el campo 'ingresante'
          this.apiService.getUsuario(residente.id_usuario).subscribe(
            (usuario: any) => {
              if (usuario) {
                if (usuario.rol === 'Residente') {
                  this.nuevoControl.ingresante = 'Residente';
                } else {
                  this.nuevoControl.ingresante = ''; // O cualquier valor por defecto que desees
                }
              }
            },
            (error) => {
              console.error('Error al obtener rol del usuario:', error);
              // Limpiar el campo 'ingresante' si ocurre un error
              this.nuevoControl.ingresante = '';
            }
          );
        } else {
          // Limpiar los campos si no se encuentra el residente
          this.nuevoControl.nombre = '';
          this.nuevoControl.apellidos = '';
          this.nuevoControl.cedula = '';
          this.nuevoControl.sexo = '';
          this.nuevoControl.ingresante = ''; // Limpiar también 'ingresante'
        }
      },
      (error) => {
        console.error('Error al obtener residente por placa:', error);
        // Limpiar los campos si ocurre un error
        this.nuevoControl.nombre = '';
        this.nuevoControl.apellidos = '';
        this.nuevoControl.cedula = '';
        this.nuevoControl.sexo = '';
        this.nuevoControl.ingresante = ''; // Limpiar también 'ingresante'
      }
    );
  }
  
/**
 * Nombre de la función: guardar
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función envía los datos del control de acceso (`nuevoControl`) al servidor para su almacenamiento.
 * Si la solicitud es exitosa, muestra un mensaje de éxito y redirige al usuario a la página de registro de control.
 * Si ocurre un error, se registran los detalles del error en la consola y se actualizan los mensajes de error
 * para mostrar al usuario. Los errores de validación específicos se manejan si el código de estado de la respuesta
 * es 422, mientras que otros errores se manejan con un mensaje general.
 * 
 * @returns void
 */
  
  guardar(): void {
    this.apiService.createControlAcceso(this.nuevoControl).subscribe(
      (response) => {        
        Swal.fire({
          title: 'Guardado con éxito',
          text: 'El control de acceso se ha guardado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.router.navigate(['/registro-control']);
        });
      },
      (error) => {
        console.error('Error al crear Control:', error);
        if (error.status === 422) {
          this.validationErrors = error.error.errors;
        } else {
          this.validationErrors = { general: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.' };
        }
      }
    );
  }
  
/**
 * Nombre de la función: logout
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función maneja el proceso de cierre de sesión del usuario. Establece la variable `loggedIn` en `false`,
 * elimina el nombre de usuario del almacenamiento local (`localStorage`) y redirige al usuario a la página de
 * inicio de sesión.
 * 
 * @returns void
 */

  logout(): void {
    this.loggedIn = false;
    localStorage.removeItem('username'); 
    this.router.navigate(['/login']); 
  }
}
