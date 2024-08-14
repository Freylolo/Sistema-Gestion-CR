import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EditarControlDialogoComponent } from "../editar-control-dialogo/editar-control-dialogo.component";


@Component({
  selector: 'app-registro-control',
  templateUrl: './registro-control.component.html',
  styleUrl: './registro-control.component.css'
})
export class RegistroControlComponent {

  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";
  control_acceso: any[] = [];

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Verificar si estamos en el navegador antes de acceder al localStorage
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado"; 
    }
    this.loadControlAcceso();
  }

/**
 * Nombre de la función: `loadControlAcceso`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función se encarga de cargar la lista de control de acceso desde el servicio API y 
 * asignar los datos recibidos a la variable `control_acceso`. En caso de error, muestra un mensaje de error en la consola.
 * 
 */

  loadControlAcceso(): void {
    this.apiService.getControlAcceso().subscribe(
      (data: any[]) => {
        this.control_acceso = data;
      },
      (error) => {
        console.error("Error al obtener control de acceso:", error);
      }
    );
  }  

  logout() {
   this.loggedIn = false;
   localStorage.removeItem('username'); 
   localStorage.removeItem('role'); 
   this.router.navigate(['/login']); 
  }

/**
 * Nombre de la función: `exportarExcel`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función se encarga de exportar los datos de control de acceso a un archivo Excel.
 * Verifica si hay datos disponibles antes de proceder con la exportación. Si hay datos, los formatea
 * y crea un archivo Excel con los datos exportados.
 * 
 */

  exportarExcel(): void {
    if (this.control_acceso.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }
    const exportData = this.control_acceso.map(row => ({
      Placas:row.placas,
      Fecha_de_ingreso:row.fecha_ingreso,
      Fecha_de_salida:row.fecha_salida,
      Nombres: row.nombre,
      Apellidos: row.apellidos,
      Sexo: row.sexo,
      Cédula: row.cedula,
      Tipo_de_ingreso: row.ingresante,
      Dirección:row.direccion,
      Personal_de_turno: row.username,
      Observaciones: row.observaciones,
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alicuotas");
    XLSX.writeFile(wb, "Listado_Accesos.xlsx");
  }

/**
 * Nombre de la función: `filtrar`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función filtra los datos de control de acceso en base a un término de búsqueda.
 * El término de búsqueda se compara con varios campos de los datos y se realiza una búsqueda 
 * insensible a mayúsculas/minúsculas.
 */

  filtrar() {
    const filtroLowerCase = this.filtro.toLowerCase();
    return this.control_acceso.filter(row => {
      return (row.placas?.toLowerCase().includes(filtroLowerCase) ||
              row.fecha_ingreso?.toLowerCase().includes(filtroLowerCase) ||
              row.fecha_salida?.toLowerCase().includes(filtroLowerCase) ||
              row.nombre?.toLowerCase().includes(filtroLowerCase) ||
              row.apellidos?.toLowerCase().includes(filtroLowerCase) ||
              row.sexo?.toLowerCase().includes(filtroLowerCase) ||
              row.cedula?.toLowerCase().includes(filtroLowerCase) ||
              row.ingresante?.toLowerCase().includes(filtroLowerCase) ||
              row.direccion?.toLowerCase().includes(filtroLowerCase) ||
              row.turno?.toLowerCase().includes(filtroLowerCase) ||
              row.observaciones?.toLowerCase().includes(filtroLowerCase));
    });
  }  

/**
 * Nombre de la función: `editControl`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función maneja la edición de un registro de control de acceso específico. Abre un modal para 
 * permitir al usuario editar los detalles del control de acceso y luego actualiza el registro en la 
 * base de datos con los nuevos datos proporcionados.
 */

  editControl(id: number): void {
    this.apiService.getControlAccesoById(id).subscribe(data => {
      const modalRef = this.modalService.open(EditarControlDialogoComponent, {
        size: 'md', // Tamaño del modal
        backdrop: 'static', // Opcional: evitar que el modal se cierre al hacer clic fuera
        centered: true, // Opcional: centrar el modal
      });
      // Pasar datos al modal
      modalRef.componentInstance.data = data;
      modalRef.result.then(result => {
        if (result) {
          // Verificar y ajustar el formato de los datos si es necesario
          const updatedData = {
            ...result,
            fecha_ingreso: this.formatDate(result.fecha_ingreso),
            fecha_salida: result.fecha_salida ? this.formatDate(result.fecha_salida) : null
          };  
          this.apiService.updateControlAcceso(id, updatedData).subscribe(
            response => {
              this.loadControlAcceso(); // Recargar datos
            },
            error => {
              console.error('Error al actualizar control de acceso:', error);
            }
          );
        }
      }, (reason) => {
      });
    });
  }

/**
 * Nombre de la función: `formatDate`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función toma una fecha en formato de entrada (puede ser una cadena o un objeto de fecha) y la 
 * convierte a una cadena con el formato `YYYY-MM-DD HH:MM:SS`. Esto asegura que la fecha se presente 
 * en un formato estándar y consistente para su almacenamiento o visualización.
 * 
 * Parámetros:
 * - `date: any`: La fecha que se va a formatear, puede ser una cadena o un objeto `Date`.
 * 
 * Valor de retorno:
 * - `string`: La fecha formateada en el formato `YYYY-MM-DD HH:MM:SS`.
 */

  private formatDate(date: any): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)} ${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}`;
  }

/**
 * Nombre de la función: `deleteControl`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función solicita la confirmación del usuario para eliminar un registro de control de acceso. 
 * Si el usuario confirma, realiza una solicitud para eliminar el registro y actualiza la lista de 
 * controles de acceso. Si se cancela, no se realiza ninguna acción.
 * 
 * Parámetros:
 * - `id: number`: El identificador del registro de control de acceso que se desea eliminar.
 */

  deleteControl(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: "¡Esta acción eliminará el registro de control de acceso de forma permanente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteControlAcceso(id).subscribe(
          () => {
            this.loadControlAcceso(); // Volver a cargar la lista de control de acceso después de la eliminación
          },
          (error) => {
            console.error("Error al eliminar control de acceso:", error);
          }
        );
      } else {
        console.log("Eliminación cancelada");
      }
    });
  }
}