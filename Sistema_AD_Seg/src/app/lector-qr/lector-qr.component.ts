import { AfterViewInit, Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { NgxScannerQrcodeComponent, ScannerQRCodeResult, ScannerQRCodeDevice } from 'ngx-scanner-qrcode';
import { ApiService } from "../api.service";

@Component({
  selector: 'app-lector-qr',
  templateUrl: './lector-qr.component.html',
  styleUrl: './lector-qr.component.css'
})
export class LectorQrComponent implements AfterViewInit {

  @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent;
  qrData: string = '';
  parsedData: any = {};
  username: string = ''; // Inicialmente vacío
  idUsuario: number | null = null;
  private loggedIn = false;
  cameras: ScannerQRCodeDevice[] = [];
  currentCameraIndex = 0;


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private apiService: ApiService) {}
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
      // Obtener el id_usuario asociado al username
      if (this.username !== 'Invitado') {
        this.apiService.getUserIdByUsername(this.username).subscribe(
          user => {
            this.idUsuario = user.id_usuario;
          },
          error => {
            console.error('Error al obtener el id_usuario:', error);
          }
        );
      }
    } 
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scanner.start();
      this.scanner.devices.subscribe((devices: ScannerQRCodeDevice[]) => {
        this.cameras = devices;
      });
      this.scanner.data.subscribe((results: ScannerQRCodeResult[]) => {
        if (results.length > 0) {
          this.qrData = results[0].value;
          console.log('QR Data:', this.qrData); // Verificar el valor del QR escaneado
          this.parseQRData();
        }
      });
    }
  }

/**
 * Nombre de la función: 'rotateCamera'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * 1. Rotea entre las cámaras disponibles en el array `this.cameras`.
 * 2. Incrementa el índice actual (`this.currentCameraIndex`) para seleccionar la siguiente cámara.
 * 3. Utiliza el operador módulo (%) para volver al inicio del array cuando se llega al final.
 * 4. Reproduce el dispositivo de la cámara seleccionada utilizando `this.scanner.playDevice`.
 * 5. Solo se ejecuta si hay más de una cámara en el array.
 */

  rotateCamera() {
    if (this.cameras.length > 1) {
      this.currentCameraIndex = (this.currentCameraIndex + 1) % this.cameras.length;
      this.scanner.playDevice(this.cameras[this.currentCameraIndex].deviceId);
    }
  }

/**
 * Nombre de la función: 'parseQRData'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * 1. Intenta dividir los datos del QR (`this.qrData`) por saltos de línea (`\n`).
 * 2. Si el número de partes resultantes no es 8, intenta dividir los datos por el delimitador `;`.
 * 3. Si el número de partes es exactamente 8, asigna cada parte a una propiedad en `this.parsedData`, asegurando que los datos sean recortados (eliminando espacios innecesarios).
 * 4. Si no se obtienen 8 partes, registra un error en la consola indicando que el número de partes no es el esperado.
 */

  parseQRData(): void {
    let dataParts: string[];
    // Intentar dividir los datos por saltos de línea
    dataParts = this.qrData.split('\n').filter(Boolean);
    // Si no hay 8 partes, intentar dividir por `;`
    if (dataParts.length !== 8) {
      dataParts = this.qrData.split(';').filter(Boolean);
    }  
    if (dataParts.length === 8) { 
      this.parsedData = {
        nombre: dataParts[0] ? dataParts[0].trim() : '',
        apellido: dataParts[1] ? dataParts[1].trim() : '',
        cedula: dataParts[2] ? dataParts[2].trim() : '',
        direccion: dataParts[3] ? dataParts[3].trim() : '',
        fecha: dataParts[4] ? dataParts[4].trim() : '',
        hora: dataParts[5] ? dataParts[5].trim() : '',
        placa: dataParts[6] ? dataParts[6].trim() : '',
        observaciones: dataParts[7] ? dataParts[7].trim() : '' 
      };
    } else {
      console.error('Error: El número de partes no es el esperado.');
    }
  }

/**
 * Nombre de la función: 'logout'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * 1. Establece la variable `loggedIn` en `false`, indicando que el usuario ha cerrado sesión.
 * 2. Elimina los elementos 'username' y 'role' del almacenamiento local (localStorage).
 * 3. Redirige al usuario a la página de inicio de sesión (`/login`).
 */

  logout() {
    this.loggedIn = false;
    localStorage.removeItem('username'); 
    localStorage.removeItem('role'); 
    this.router.navigate(['/login']); 
  }
  
/**
 * Nombre de la función: 'guardarDatosEnTabla'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * 1. Verifica que todos los campos requeridos en `parsedData` estén presentes; si alguno falta, la función no hace nada.
 * 2. Ajusta el valor de `sexo` y `ingresante` a valores válidos, usando valores predeterminados si es necesario.
 * 3. Prepara un objeto `controlAccesoData` con los datos necesarios para el registro.
 * 4. Envía `controlAccesoData` a la API mediante `apiService.guardarControlAcceso`.
 * 5. Si la operación es exitosa, redirige al usuario a la página `/registro-control`.
 * 6. En caso de error, muestra un mensaje en la consola; si es un error de validación (código 422), también lo reporta.
 */

  guardarDatosEnTabla() {
    if (!this.parsedData.nombre || !this.parsedData.apellido || !this.parsedData.cedula || !this.parsedData.direccion || !this.parsedData.fecha || !this.parsedData.hora || !this.parsedData.placa) {
      return;
    }
    // Verifica y ajusta el valor de `sexo`
    const sexo = ['M', 'F'].includes(this.parsedData.sexo) ? this.parsedData.sexo : 'Indefinido'; // Valor por defecto 'Indefinido'
    // Verifica y ajusta el valor de `ingresante`
    const ingresante = ['Residente', 'Visitante', 'Delivery'].includes(this.parsedData.ingresante) ? this.parsedData.ingresante : 'Visitante'; // Valor por defecto 'Visitante'
    // Prepara los datos para enviar
    const controlAccesoData = {
      nombre: this.parsedData.nombre,
      apellidos: this.parsedData.apellido,
      cedula: this.parsedData.cedula,
      direccion: this.parsedData.direccion,
      fecha_ingreso: `${this.parsedData.fecha} ${this.parsedData.hora}`,
      fecha_salida: '', // Puedes dejar esto vacío si no se requiere
      id_usuario: this.idUsuario, // Usa el id_usuario obtenido de la API
      ingresante: ingresante,
      observaciones: this.parsedData.observaciones || '', // Opcional, por defecto vacío
      placas: this.parsedData.placa,
      sexo: sexo,
      username: this.username
    };
    this.apiService.guardarControlAcceso(controlAccesoData).subscribe(
      response => {
        console.log('Datos guardados exitosamente:', response);
        this.router.navigate(['/registro-control']); // Redirigir a otra página si es necesario
      },
      error => {
        console.error('Error al guardar datos:', error);
        if (error.status === 422) {
          console.error('Error de validación:', error.error.errors);
        }
      }
    );
  }
}
