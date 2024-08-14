import { Component, Input, OnInit } from '@angular/core';
import * as mammoth from 'mammoth';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-invitados-modal',
  templateUrl: './invitados-modal.component.html',
  styleUrl: './invitados-modal.component.css'
})
export class InvitadosModalComponent  implements OnInit {
  @Input() data: any[] = []; 

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    if (this.data && this.data.length > 0) {
      console.log('Datos recibidos en el modal:', this.data);
    } else {
      console.warn('No se han recibido datos en el modal');
    }
  }

  closeModal() {
    this.activeModal.dismiss();
  }
}
