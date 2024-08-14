import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {EditarPersonalDialogoComponent} from '../editar-personal-dialogo/editar-personal-dialogo.component';

@Component({
  selector: "app-registro-personal",
  templateUrl: "./registro-personal.component.html",
  styleUrl: "./registro-personal.component.css",
})
export class RegistroPersonalComponent implements OnInit {
  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

  personal: any[] = [];

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
    this.loadPersonal();
  } 

/**
 * Nombre de la función: `loadPersonal`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función carga los datos del personal llamando al servicio `getPersonales` de la API. 
 * Los datos obtenidos se asignan a la propiedad `personal` del componente. 
 * Si ocurre un error durante la solicitud, se registra en la consola.
 */

  loadPersonal(): void {
    this.apiService.getPersonales().subscribe(
      (data: any[]) => {
        this.personal = data;
      },
      (error) => {
        console.error("Error al obtener personal:", error);
      }
    );
  }

logout() {
  this.loggedIn = false;
  localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
  localStorage.removeItem('role'); // Limpiar rol del localStorage
  this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
}

  exportarExcel(): void {
    if (this.personal.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.personal);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Personal");
    XLSX.writeFile(wb, "Listado_Personal.xlsx");
  }

/**
 * Nombre de la función: `exportarExcel`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función exporta los datos del personal a un archivo Excel. 
 * Si la propiedad `personal` está vacía, se muestra una advertencia en la consola y se detiene la ejecución.
 * Si hay datos, se convierte el array de objetos `personal` en una hoja de cálculo, 
 * se crea un nuevo libro de trabajo, se añade la hoja al libro y se guarda el archivo como "Listado_Personal.xlsx".
 */

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    const filtrados = this.personal.filter(
      (row) =>
        (row.usuario.nombre && row.usuario.nombre.toLowerCase().includes(filtroLower)) ||
        (row.usuario.apellido && row.usuario.apellido.toLowerCase().includes(filtroLower)) ||
        (row.sexo.toLowerCase().includes(this.filtro.toLowerCase()) )||
        (row.cedula.toLowerCase().includes(this.filtro.toLowerCase())) ||
        (row.perfil.toLowerCase().includes(this.filtro.toLowerCase()) )||
        (row.observaciones.toLowerCase().includes(this.filtro.toLowerCase()))
    );
    return filtrados;
  }

/**
 * Nombre de la función: `editPersonal`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función abre un modal para editar los datos de un personal específico.
 * Primero, obtiene los datos del personal mediante el ID proporcionado.
 * Luego, abre un modal (EditarPersonalDialogoComponent) y pasa los datos del personal al modal.
 * Cuando el modal se cierra con una confirmación, se actualizan los datos del personal usando la API.
 * Después de la actualización, se recarga la lista de personales para reflejar los cambios.
 * Si ocurre un error durante la actualización o al cerrar el modal, se muestra un mensaje en la consola.
 */

  editPersonal(id: number): void {
    this.apiService.getPersonal(id).subscribe(data => {
      const modalRef = this.modalService.open(EditarPersonalDialogoComponent, {
        size: 'md',
        backdrop: 'static',
        centered: true
      });
      modalRef.componentInstance.personal = data;
      
      modalRef.result.then(result => {
        if (result) {
          this.apiService.updatePersonal(id, result).subscribe(
            response => {
              this.loadPersonal(); // Recargar la lista de personales
            },
            error => {
              console.error('Error al actualizar personal:', error);
            }
          );
        }
      }, (reason) => {
        console.log('Modal cerrado con rechazo:', reason);
      });
    });
  }
  
/**
 * Nombre de la función: `deletePersonal`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función solicita confirmación al usuario antes de eliminar un registro de personal.
 * Utiliza una ventana emergente (Swal.fire) para mostrar una alerta de confirmación con opciones para eliminar o cancelar.
 * Si el usuario confirma la eliminación, se realiza una llamada a la API para eliminar el registro del personal.
 * Después de la eliminación, se recarga la lista de personal para reflejar los cambios.
 * Si ocurre un error durante la eliminación, se muestra un mensaje en la consola.
 * Si el usuario cancela la eliminación, se registra un mensaje en la consola indicando que la acción fue cancelada.
 */

  deletePersonal(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: "¡Esta acción eliminará el registro de personal de forma permanente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deletePersonal(id).subscribe(
          () => {
            this.loadPersonal(); // Volver a cargar la lista de personal después de la eliminación
          },
          (error) => {
            console.error("Error al eliminar personal:", error);
          }
        );
      } else {
        console.log("Eliminación cancelada");
      }
    });
  }
}
