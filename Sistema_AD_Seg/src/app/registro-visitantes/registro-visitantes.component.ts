import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-visitantes',
  templateUrl: './registro-visitantes.component.html',
  styleUrl: './registro-visitantes.component.css'
})
export class RegistroVisitantesComponent implements AfterViewInit {

  username: string = ""; // Inicialmente vacío
  private loggedIn = false;

  public qrdata: string = '';
  public nombre: string = '';
  public apellido: string = '';
  public identificacion: string = '';
  public direccion: string = '';
  public nombreEvento: string='';
  public fecha: string='';
  public hora: string='';
  public placas: string='';
  public Observaciones: string='';

  public validationErrors: any = {};


  @ViewChild('qrcElement', { static: false }) qrcElement!: ElementRef;
  @ViewChild('qrContainer') qrContainer!: ElementRef;


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {
    console.log('AppComponent running');
    this.qrdata = '...';
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
    } 
    this.cdr.detectChanges();
    }
    
/**
 * Nombre de la función: `generarQR`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función genera un código QR a partir de los datos proporcionados. Primero, verifica que todos los campos requeridos (nombre, apellido, identificación, dirección, fecha, hora, placas y observaciones) estén completos.
 * Si falta algún campo, muestra una advertencia al usuario indicando que debe completar todos los campos antes de generar el QR.
 * Si todos los campos están completos, construye una cadena de texto con los datos separados por punto y coma y la asigna a `this.qrdata`, que se utiliza para generar el código QR.
 */

    generarQR() {
      // Verifica que todos los campos requeridos estén completos
      if (!this.nombre || !this.apellido || !this.identificacion || !this.direccion || !this.fecha || !this.hora || !this.placas || !this.Observaciones) {
        Swal.fire({
          icon: 'warning',
          title: 'Datos incompletos',
          text: 'Por favor, llene todos los campos requeridos antes de generar el QR.',
          confirmButtonText: 'OK'
        });
        return;
      }
      // Si todos los campos están completos, genera el QR
      const datosQR = `${this.nombre};${this.apellido};${this.identificacion};${this.direccion};${this.fecha};${this.hora};${this.placas};${this.Observaciones}`;
      this.qrdata = datosQR;
    }

/**
 * Nombre de la función: `descargarQR`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función descarga el código QR generado como una imagen PNG. Utiliza `html2canvas` para capturar el contenido del contenedor del QR (`qrContainer`) como un lienzo (canvas). Luego, convierte el lienzo en una URL de datos en formato PNG y crea un enlace de descarga dinámicamente. 
 * Finalmente, simula un clic en el enlace para iniciar la descarga del archivo con el nombre 'codigo-qr.png'.
 * 
 * Nota: La función se retrasa 500 milisegundos antes de ejecutar para asegurar que el contenedor del QR esté completamente renderizado.
 */

  descargarQR(): void {
    setTimeout(() => {
      if (this.qrContainer && this.qrContainer.nativeElement) {
        html2canvas(this.qrContainer.nativeElement).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imgData;
          link.download = 'codigo-qr.png';
          link.click();
        }).catch(error => {
          console.error('Error al generar la imagen:', error);
        });
      } else {
        console.error('Contenedor QR no encontrado');
      }
    }, 500); 
  }

/**
 * Nombre de la función: `descargarPDF`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función descarga el código QR generado como un archivo PDF. Utiliza `html2canvas` para capturar el contenido del contenedor del QR (`qrContainer`) como un lienzo (canvas). Luego, convierte el lienzo en una URL de datos en formato PNG. A continuación, crea un nuevo PDF utilizando `jsPDF` y agrega la imagen del QR al PDF. Finalmente, guarda el PDF con el nombre 'codigo-qr.pdf'.
 * 
 * Nota: La función se retrasa 500 milisegundos antes de ejecutar para asegurar que el contenedor del QR esté completamente renderizado.
 */

  descargarPDF(): void {
    setTimeout(() => {
      if (this.qrContainer && this.qrContainer.nativeElement) {
        html2canvas(this.qrContainer.nativeElement).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgWidth = 190;
          const imgHeight = canvas.height * imgWidth / canvas.width;
          pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
          pdf.save('codigo-qr.pdf');
        }).catch(error => {
          console.error('Error al generar el PDF:', error);
        });
      } else {
        console.error('Contenedor QR no encontrado');
      }
    }, 500);
  }


  logout() {
    this.loggedIn = false;
    localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
    localStorage.removeItem('role'); // Limpiar rol del localStorage
    this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
  }
  
/**
 * Nombre de la función: `validateCedula`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función valida una cédula ecuatoriana siguiendo el algoritmo de validación establecido. La función realiza las siguientes comprobaciones:
 * 
 * 1. Verifica que la cédula tenga exactamente 10 dígitos.
 * 2. Verifica que el código de la región (los primeros dos dígitos) esté en el rango válido (1 a 24).
 * 3. Calcula el dígito verificador utilizando el algoritmo específico para cédulas ecuatorianas.
 * 4. Compara el dígito verificador calculado con el último dígito de la cédula proporcionada.
 * 5. Muestra un mensaje de error si la cédula es inválida o si el dígito verificador no coincide. De lo contrario, indica que la cédula es correcta.
 * 
 * Nota: La función utiliza validaciones específicas para la estructura y el cálculo del dígito verificador de la cédula ecuatoriana.
 */

  validateCedula() {
    const cedula = this.identificacion;

    if (cedula.length !== 10) {
      this.validationErrors.cedula = ["La cédula debe tener 10 dígitos."];
      return;
    }

    const digitoRegion = parseInt(cedula.substring(0, 2), 10);
    if (digitoRegion < 1 || digitoRegion > 24) {
      this.validationErrors.cedula = ["Esta cédula no pertenece a ninguna región."];
      return;
    }

    const ultimoDigito = parseInt(cedula.substring(9, 10), 10);
    const pares = parseInt(cedula.substring(1, 2), 10) + parseInt(cedula.substring(3, 4), 10) +
                  parseInt(cedula.substring(5, 6), 10) + parseInt(cedula.substring(7, 8), 10);

    const numeroImpar = (num: string) => {
      let n = parseInt(num, 10) * 2;
      return n > 9 ? n - 9 : n;
    };

    const impares = numeroImpar(cedula[0]) + numeroImpar(cedula[2]) + numeroImpar(cedula[4]) +
                    numeroImpar(cedula[6]) + numeroImpar(cedula[8]);

    const sumaTotal = pares + impares;
    const primerDigitoSuma = parseInt(sumaTotal.toString().substring(0, 1), 10);
    const decena = (primerDigitoSuma + 1) * 10;
    let digitoValidador = decena - sumaTotal;

    if (digitoValidador === 10) {
      digitoValidador = 0;
    }

    if (digitoValidador !== ultimoDigito) {
      this.validationErrors.cedula = ["La cédula es incorrecta."];
    } else {
      this.validationErrors.cedula = [];
      console.log('La cédula es correcta');
    }
  }
}
