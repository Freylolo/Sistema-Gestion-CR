import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditarAlicuotasDialogoComponent } from '../editar-alicuotas-dialogo/editar-alicuotas-dialogo.component';


@Component({
  selector: 'app-alicuotas',
  templateUrl: './alicuotas.component.html',
  styleUrl: './alicuotas.component.css'
})
export class AlicuotasComponent {

  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

  alicuota: any[] = [];

  totalAdeudadoGeneral: number = 0; // Total adeudado
  idUsuario: number | null = null;
  role: string | null = null;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
      this.role = localStorage.getItem("role"); // Obtener el rol del localStorage
      if (this.role === "Residente") {
        this.loadUserId(); // Solo cargar el ID si el rol es "Residente"
      } else {
        // Manejo para cuando el rol no es "Residente"
        this.idUsuario = null;
        this.loadAlicuota();
      }
    }
  }

  loadUserId(): void {
    if (this.username !== "Invitado") {
      this.apiService.getUserIdByUsername(this.username).subscribe(
        (data: any) => {
          this.idUsuario = data.id_usuario;
          console.log("ID de Usuario en loadUserId:", this.idUsuario); // Verifica si se está estableciendo correctamente
          this.loadAlicuota(); // Llamada a cargar datos después de obtener el id_usuario
        },
        (error) => {
          console.error("Error al obtener ID de Usuario:", error);
        }
      );
    } else {
      // Manejo para cuando el usuario es "Invitado" o no tiene ID
      this.idUsuario = null;
      this.loadAlicuota();
    }
  }

  loadAlicuota(): void {
    console.log("Cargando alicuota...");
    console.log("ID de Usuario:", this.idUsuario); // Asegúrate de que el ID es correcto
    this.apiService.getAlicuotas().subscribe(
      (data: any[]) => {
        console.log("Datos recibidos:", data);
        if (this.idUsuario !== null) {
          this.alicuota = data.filter(row => {
            console.log("Residente ID:", row.residente?.id_usuario); // Verifica el ID del residente
            return row.residente && row.residente.id_usuario === this.idUsuario;
          });
        } else {
          this.alicuota = data;
        }
        this.calcularTotalAdeudadoGeneral(); // Recalcular total después de cargar alícuotas
      },
      (error) => {
        console.error("Error al obtener alicuota:", error);
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
    console.log("Exportando a Excel...");
    if (this.alicuota.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }
  
    // Combina datos de alícuotas y residentes en un nuevo array
    const exportData = this.alicuota.map(row => ({
      Solar: row.residente.solar,
      M2: row.residente.m2,
      Nombre: row.residente.nombre,
      Apellido: row.residente.apellido,
      Cedula: row.residente.cedula,
      Direccion: row.residente.direccion,
      Fecha: row.fecha,
      Mes: row.mes,
      MontoPorCobrar: row.monto_por_cobrar,
      Estado: row.pagado ? 'Pagado' : 'No Pagado',
      Total: this.getTotalAdeudado(row.residente.id_residente)
    }));
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alicuotas");
    XLSX.writeFile(wb, "Listado_Alicuotas.xlsx");
  }
  
   
  filtrar() {
    const filtroLowerCase = this.filtro.toLowerCase();
    return this.alicuota.filter(row =>
      row.residente && (
        (row.residente.nombre && row.residente.nombre.toLowerCase().includes(filtroLowerCase)) ||
        (row.residente.apellido && row.residente.apellido.toLowerCase().includes(filtroLowerCase)) ||
        (row.residente.solar && row.residente.solar.toLowerCase().includes(filtroLowerCase)) ||
        (row.residente.cedula && row.residente.cedula.toLowerCase().includes(filtroLowerCase)) ||
        (row.fecha && row.fecha.toLowerCase().includes(filtroLowerCase)) ||
        (row.mes && row.mes.toLowerCase().includes(filtroLowerCase)) ||
        (row.total && row.total.toString().toLowerCase().includes(filtroLowerCase)) ||
        (row.residente.direccion && row.residente.direccion.toLowerCase().includes(filtroLowerCase))
      )
    );
  }  

  calcularTotalAdeudadoGeneral(): void {
    this.totalAdeudadoGeneral = this.alicuota
      .filter(row => !row.pagado)
      .reduce((sum, row) => sum + row.monto_por_cobrar, 0);
  }

  getTotalAdeudado(id_residente: number | null): number {
    if (id_residente === null) {
      return 0;
    }
    
    return this.alicuota
      .filter(row => row.residente?.id_residente === id_residente && !row.pagado)
      .reduce((sum, row) => sum + row.monto_por_cobrar, 0);
  }

  marcarpago(id: number): void {
    console.log("Marcando alícuota como pagado con ID:", id);
    this.apiService.marcarpagoAlicuitas(id).subscribe(
      () => {
        console.log("Pago marcado exitosamente");
        // Volver a cargar la lista de alícuotas y recalcular el total adeudado
        this.loadAlicuota();
      },
      (error) => {
        console.error("Error al marcar el pago:", error);
      }
    );
  }

   // Métodos para editar personal
   editAlicuota(id: number): void {
    this.apiService.getAlicuota(id).subscribe(data => {
      const modalRef = this.modalService.open(EditarAlicuotasDialogoComponent, {
        size: 'md',
        backdrop: 'static',
        centered: true
      });
  
      modalRef.componentInstance.data = data;
  
      modalRef.result.then(result => {
        if (result) {
          this.apiService.updateAlicuota(id, result).subscribe(
            response => {
              console.log('Alícuota actualizada', response);
              this.loadAlicuota(); // Recargar la lista de alícuotas
            },
            error => {
              console.error('Error al actualizar alícuota:', error);
            }
          );
        }
      }, (reason) => {
        // Opcional: manejar el rechazo del modal
      });
    });
  }
  

  private formatDate(date: any): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
  }


  deleteAlicuota(id: number): void {
    const confirmDeletion = window.confirm(
      "¿Está seguro de eliminar esta alicuota?"
    );

    if (confirmDeletion) {
      console.log("Eliminando alicuota con ID:", id);
      this.apiService.deleteAlicuota(id).subscribe(
        () => {
          console.log("Alicuota eliminada con éxito");
          this.loadAlicuota(); // Volver a cargar la lista de personal después de la eliminación
        },
        (error) => {
          console.error("Error al eliminar Alicuota:", error);
        }
      );
    } else {
      console.log("Eliminación cancelada");
    }
  }

}
