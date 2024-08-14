import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-alicuotas-dialogo',
  templateUrl: './editar-alicuotas-dialogo.component.html',
  styleUrl: './editar-alicuotas-dialogo.component.css'
})
export class EditarAlicuotasDialogoComponent implements OnInit {
  form!: FormGroup;
  data: any;  // Propiedad para recibir datos

  constructor(
    public modalRef: NgbActiveModal,
    private fb: FormBuilder,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    // Inicializar el formulario
    this.form = this.fb.group({
      id_alicuota: [this.data.id_alicuota],  // No editable
      fecha: [this.data.fecha, Validators.required],
      mes: [this.data.mes, Validators.required],
      monto_por_cobrar: [this.data.monto_por_cobrar, Validators.required],
      pagado: [this.data.pagado]
    });
  }
  
/**
 * Nombre de la función: save
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función guarda los datos del formulario si el formulario es válido.
 * Si el formulario contiene errores, muestra una advertencia al usuario.
 * Convierte el valor del campo `pagado` a un número antes de enviar los datos a la API para actualizar la alícuota.
 * Muestra notificaciones de éxito o error según el resultado de la operación de actualización.
 */

  save(): void {
    if (this.form.invalid) {
        Swal.fire({
            title: 'Formulario Inválido',
            text: 'Por favor, corrija los errores en el formulario antes de guardar.',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        });
        return;
    }
    // Convertir el valor de 'pagado' a número (0 o 1)
    const formData = { 
        ...this.form.value, 
        pagado: Number(this.form.value.pagado)
    };    
    this.apiService.updateAlicuota(this.data.id_alicuota, formData).subscribe(
        (response) => {
            Swal.fire({
                title: 'Éxito',
                text: 'La alícuota ha sido actualizada con éxito.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                this.modalRef.close(response);
            });
        },
        (error) => {
            console.error('Error al actualizar la alícuota:', error);
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al actualizar la alícuota. Por favor, inténtelo de nuevo más tarde.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    );
}

}
