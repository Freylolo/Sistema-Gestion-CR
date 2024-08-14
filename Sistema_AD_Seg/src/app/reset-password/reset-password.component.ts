import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {

  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  loading: boolean = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.message = 'Token no proporcionado.';
      return;
    }
  }
  
/**
 * Nombre de la función: `onSubmit`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función maneja el evento de envío del formulario de restablecimiento de contraseña. Realiza las siguientes acciones:
 * 
 * 1. Verifica que la nueva contraseña y la confirmación de la contraseña coincidan. Si no coinciden, establece un mensaje de error y termina la ejecución.
 * 2. Si las contraseñas coinciden, establece el estado de carga en `true` para indicar que el proceso está en curso.
 * 3. Llama al servicio API para restablecer la contraseña utilizando el token proporcionado y las nuevas contraseñas.
 * 4. Si el restablecimiento es exitoso, muestra un mensaje de éxito y redirige al usuario a la página de inicio de sesión.
 * 5. Si ocurre un error durante el proceso, muestra un mensaje de error y establece el estado de carga en `false`.
 * 
 * Nota: La función utiliza la propiedad `loading` para mostrar un indicador de carga mientras se realiza la solicitud al servidor.
 */

  onSubmit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Las contraseñas no coinciden.';
      return;
    }
    this.loading = true;
    this.apiService.resetPassword(this.token, this.newPassword, this.confirmPassword).subscribe(
      () => {
        this.message = 'Contraseña restablecida exitosamente.';
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error al restablecer la contraseña:', error);
        this.message = 'Error al restablecer la contraseña.';
        this.loading = false;
      }
    );
  }  
}
