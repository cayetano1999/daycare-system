import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { IonModal } from "@ionic/angular/standalone";

interface AuthorizedPerson {
  id: string;
  name: string;
  phone: string;
  childName: string;
  relationship: string;
  idNumber: string;
  email: string;
  address: string;
  emergencyContact: string;
  notes: string;
}

@Component({
  selector: 'app-authorized-person-detail-modal',
  templateUrl: './authorized-person-detail-modal.component.html',
  styleUrls: ['./authorized-person-detail-modal.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class AuthorizedPersonDetailModalComponent {
  @Input() person: AuthorizedPerson | null = null;
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  closeModal(): void {
    this.close.emit();
  }

  onContact(): void {
    console.log('Contact person:', this.person);
  }

  onPrint(): void {
    console.log('Print person details:', this.person);
  }
}
