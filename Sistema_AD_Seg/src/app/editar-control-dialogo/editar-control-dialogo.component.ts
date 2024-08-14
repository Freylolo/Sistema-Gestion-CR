import { Component, OnInit, Inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-control-dialogo',
  templateUrl: './editar-control-dialogo.component.html',
  styleUrl: './editar-control-dialogo.component.css'
})
export class EditarControlDialogoComponent implements OnInit {
  form!: FormGroup; 
  data: any;  // Propiedad para recibir datos

  usuariosSeguridad: any[] = [];
  usuarios: any[] = [];

  constructor(
    public modalRef: NgbActiveModal,
    private fb: FormBuilder, 
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    // Inicializar el formulario
    this.form = this.fb.group({
      id_usuario: [this.data.id_usuario, Validators.required],
      placas: [this.data.placas, Validators.required],
      fecha_ingreso: [this.data.fecha_ingreso, Validators.required],
      fecha_salida: [this.data.fecha_salida],
      nombre: [this.data.nombre, Validators.required],
      apellidos: [this.data.apellidos, Validators.required],
      sexo: [this.data.sexo, Validators.required],
      cedula: [this.data.cedula, Validators.required],
      ingresante: [this.data.ingresante, Validators.required],
      direccion: [this.data.direccion, Validators.required],
      username: [this.data.username],
      observaciones: [this.data.observaciones]
    });
    // Cargar los usuarios al inicializar el componente
    this.cargarUsuarios();
  }

/**
 * Nombre de la función: cargarUsuarios
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función carga la lista de usuarios llamando a la API. 
 * Una vez que se obtienen los usuarios, se guarda la respuesta en la propiedad `usuarios` 
 * y se llama a la función `filtrarUsuariosSeguridad` para realizar cualquier procesamiento adicional.
 * 
 * @returns void
 */

  cargarUsuarios(): void {
    this.apiService.getUsuarios().subscribe(
      (response) => {
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
 * Esta función filtra la lista de usuarios para obtener únicamente aquellos que tienen el perfil y rol de "Seguridad".
 * Los usuarios filtrados se almacenan en la propiedad `usuariosSeguridad`.
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
 * Esta función maneja el evento de selección de un nombre de usuario. Busca el usuario seleccionado en la lista 
 * de usuarios de seguridad y actualiza el valor del campo `username` en el formulario con el nombre de usuario 
 * encontrado. Si el usuario no se encuentra, el campo `username` se limpia. 
 * 
 * @param event - El evento que contiene el valor del nombre de usuario seleccionado.
 * @returns void
 */

  GuardarUsername(event: any): void {
    const selectedUsername = event.target.value;  
    // Buscar el usuario seleccionado en la lista de usuarios de seguridad
    const selectedUser = this.usuariosSeguridad.find((usuario: any) => usuario.username === selectedUsername);
    if (selectedUser) {
      this.form.patchValue({ username: selectedUser.username });
      console.log('Usuario encontrado:', selectedUser);
      console.log('Username asignado:', this.form.get('username')?.value);
    } else {
      this.form.patchValue({ username: '' });
      console.warn('Usuario no encontrado para el username:', selectedUsername);
    }
  }

/**
 * Nombre de la función: save
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función guarda los datos del formulario y muestra una alerta de éxito usando SweetAlert. 
 * Los valores de las fechas se formatean usando la función `formatDate`. 
 * Si la operación es exitosa, el modal se cierra con los datos guardados. 
 * En caso de error al mostrar la alerta, se muestra un mensaje de error.
 * 
 * @returns void
 */

  save(): void {
    const formData = { ...this.form.value };
    formData.fecha_ingreso = this.formatDate(formData.fecha_ingreso);
    formData.fecha_salida = formData.fecha_salida ? this.formatDate(formData.fecha_salida) : null;
    // Mostrar alerta de éxito antes de cerrar el modal
    Swal.fire({
        title: 'Éxito',
        text: 'Datos guardados correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    }).then(() => {
        this.modalRef.close(formData);
    }).catch((error) => {
        console.error('Error al mostrar alerta:', error);
        Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al guardar los datos. Por favor, inténtelo de nuevo más tarde.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    });
}
  
/**
 * Nombre de la función: formatDate
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función formatea una fecha en una cadena con el formato "YYYY-MM-DD HH:MM:SS". 
 * Convierte el valor de entrada a un objeto `Date` y luego construye una cadena 
 * que incluye el año, mes, día, hora, minutos y segundos en el formato especificado.
 * 
 * @param date - La fecha a formatear, puede ser una cadena, número o un objeto `Date`.
 * @returns string - La fecha formateada en el formato "YYYY-MM-DD HH:MM:SS".
 */

  private formatDate(date: any): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)} ${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}`;
  }
}
