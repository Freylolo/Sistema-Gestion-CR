import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.css'
})
export class EventosComponent {

  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

 
  eventos: any[] = [];


  constructor(
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
    }
    this.loadEventos();
  }

  loadEventos(): void {
    console.log("Cargando Eventos...");
    this.apiService.getEventos().subscribe(
      (data: any[]) => {
        console.log("Datos recibidos:", data);
        this.eventos = data;
      },
      (error) => {
        console.error("Error al obtener eventos:", error);
      }
    );
  }

  logout(): void {
    this.loggedIn = false;
    localStorage.removeItem("username"); // Limpiar nombre de usuario del localStorage
    this.router.navigate(["/login"]); // Redirige a la página de inicio de sesión
  }

  exportarExcel(): void {
    console.log("Exportando a Excel...");
    if (this.eventos.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.eventos);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Eventos");
    XLSX.writeFile(wb, "Listado_Eventos.xlsx");
  }

  filtrar(): any[] {
    const filtroLower = this.filtro.toLowerCase();
    return this.eventos.filter(row =>
      row.nombre.toLowerCase().includes(filtroLower) ||
      row.apellidos.toLowerCase().includes(filtroLower) ||
      row.cedula.toLowerCase().includes(filtroLower) ||
      row.nombre_evento.toLowerCase().includes(filtroLower) ||
      row.direccion_evento.toLowerCase().includes(filtroLower) ||
      row.tipo_evento.toLowerCase().includes(filtroLower) ||
      row.observaciones?.toLowerCase().includes(filtroLower) || 
      row.invitados?.toLowerCase().includes(filtroLower) 
    );
  }

  // Métodos para editar y eliminar eventos
  editEventos(id: number): void {
    console.log("Editando Evento con ID:", id);
    this.router.navigate(["/formulario-evento", id]);
  }

  deleteEventos(id: number): void {
    const confirmDeletion = window.confirm("¿Está seguro de eliminar este evento?");
    if (confirmDeletion) {
      console.log("Eliminando evento con ID:", id);
      this.apiService.deleteEvento(id).subscribe(
        () => {
          console.log("Evento eliminado con éxito");
          this.loadEventos(); // Volver a cargar la lista de eventos después de la eliminación
        },
        (error) => {
          console.error("Error al eliminar evento:", error);
        }
      );
    } else {
      console.log("Eliminación cancelada");
    }
  }

  getFileUrl(filename: string): string {
    return this.apiService.getFileUrl(filename);
  }

}
