import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import {EditarUsuariosDialogoComponent} from '../editar-usuarios-dialogo/editar-usuarios-dialogo.component';


@Component({
  selector: "app-gestionusuario",
  templateUrl: "./gestionusuario.component.html",
  styleUrl: "./gestionusuario.component.css",
})
export class GestionusuarioComponent implements OnInit {
  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

  usuarios: any[] = [];

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
    }
    this.loadUsuarios();
  }

/**
 * Nombre de la función: 'loadUsuarios'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * 1. Obtiene la lista de usuarios desde el servidor utilizando el servicio `apiService.getUsuarios()`.
 * 2. Enmascara las contraseñas en los datos obtenidos antes de asignarlos a la propiedad `usuarios`.
 *    - La contraseña se reemplaza por "*****" para mantener la seguridad de los datos.
 * 3. Maneja los errores de la solicitud mostrando un mensaje de error en la consola.
 */

  loadUsuarios(): void {
    this.apiService.getUsuarios().subscribe(
      (data: any[]) => {
        // Enmascarar las contraseñas antes de asignar los datos a this.usuarios
        this.usuarios = data.map((usuario) => ({
          ...usuario,
          contrasena: "*****", // Enmascarar la contraseña
        }));
      },
      (error) => {
        console.error("Error al obtener usuarios:", error);
      }
    );
  }

/**
 * Nombre de la función: 'logout'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * 1. Marca al usuario como no autenticado estableciendo `loggedIn` a `false`.
 * 2. Elimina los datos de usuario (nombre y rol) almacenados en `localStorage`.
 * 3. Redirige al usuario a la página de inicio de sesión (`/login`).
 */

  logout() {
  this.loggedIn = false;
  localStorage.removeItem('username'); 
  localStorage.removeItem('role'); 
  this.router.navigate(['/login']); 
  }

/**
 * Nombre de la función: 'exportarExcel'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * 1. Verifica si hay datos en `this.usuarios` para exportar. Si no hay datos, muestra una advertencia en la consola.
 * 2. Crea una hoja de cálculo (`ws`) a partir de los datos de `this.usuarios` utilizando la biblioteca XLSX.
 * 3. Crea un nuevo libro de trabajo (`wb`) y agrega la hoja de cálculo al libro con el nombre "Usuarios".
 * 4. Exporta el libro de trabajo a un archivo Excel llamado "Informacion_Usuarios.xlsx".
 */

  exportarExcel(): void {
    console.log("Exportando a Excel...");
    if (this.usuarios.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.usuarios);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
    XLSX.writeFile(wb, "Informacion_Usuarios.xlsx");
  }

/**
 * Nombre de la función: 'editUsuario'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * 1. Solicita los datos del usuario con el `id` proporcionado a través de la API.
 * 2. Abre un diálogo modal (`EditarUsuariosDialogoComponent`) para editar los datos del usuario, pasando los datos obtenidos al componente del diálogo.
 * 3. Si el usuario confirma los cambios en el diálogo, actualiza el usuario con el `id` proporcionado en la API con los nuevos datos.
 * 4. Recarga la lista de usuarios después de una actualización exitosa.
 * 5. Maneja errores durante la solicitud de actualización y la solicitud inicial de datos del usuario.
 */

  editUsuario(id: number): void {
    this.apiService.getUsuario(id).subscribe(data => {
      const modalRef = this.modalService.open(EditarUsuariosDialogoComponent, {
        size: 'md',
        backdrop: 'static',
        centered: true,
      });
      modalRef.componentInstance.data = data;
      modalRef.result.then(result => {
        if (result) {
          this.apiService.updateUsuario(id, result).subscribe(
            response => {
              this.loadUsuarios(); // Recargar la lista de usuarios
            },
            error => {
              console.error('Error al actualizar el usuario:', error);
            }
          );
        }
      }, (reason) => {
      });
    });
  }
  
/**
 * Nombre de la función: 'deleteUsuario'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * 1. Muestra una alerta de confirmación usando SweetAlert2 para confirmar la eliminación del usuario.
 * 2. Si el usuario confirma la acción, realiza una solicitud a la API para eliminar el usuario con el `id` proporcionado.
 * 3. Recarga la lista de usuarios después de una eliminación exitosa.
 * 4. Maneja errores durante la solicitud de eliminación.
 * 5. Muestra un mensaje en la consola si la eliminación es cancelada.
 */

  deleteUsuario(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: "¡Esta acción eliminará el usuario de forma permanente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteUsuario(id).subscribe(
          () => {
            this.loadUsuarios(); // Volver a cargar la lista de usuarios después de la eliminación
          },
          (error) => {
            console.error("Error al eliminar usuario:", error);
          }
        );
      } else {
        console.log("Eliminación cancelada");
      }
    });
  }
  
/**
 * Nombre de la función: 'filtrar'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * 1. Filtra la lista de usuarios (`this.usuarios`) en función de un término de búsqueda (`this.filtro`).
 * 2. El filtro es aplicado a los campos `nombre`, `apellido`, `perfil`, `username` y `correo_electronico`.
 * 3. Todos los campos se comparan en minúsculas para asegurar la búsqueda no sensible a mayúsculas.
 * 4. Devuelve una lista de usuarios que coinciden con el término de búsqueda en al menos uno de los campos.
 */

  filtrar() {
    return this.usuarios.filter(
      (row) =>
        row.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
        row.apellido.toLowerCase().includes(this.filtro.toLowerCase()) ||
        row.perfil.toLowerCase().includes(this.filtro.toLowerCase()) ||
        row.username.toLowerCase().includes(this.filtro.toLowerCase()) ||
        row.correo_electronico.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }
}
