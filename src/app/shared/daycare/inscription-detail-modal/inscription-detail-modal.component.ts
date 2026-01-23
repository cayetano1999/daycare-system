import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { StandAloneModules } from '../../stand-alone-module';
import { calculateAgeToString } from 'src/app/core/constants/constants';

interface RegistrationWithDetails {
  id: string;
  children_id: string;
  profile_id: string | null;
  start_date: string;
  status: string;
  created_at: string;
  child?: {
    id: string;
    full_name: string;
    birth_date: string;
    gender: string;
    ciclo: string | null;
    avatar_url: string | null;
    address?: string;
    schedule?: string;
  };
  profile?: {
    id: string;
    full_name: string;
  } | null;
  legal_parents?: Array<{
    id: string;
    full_name: string;
    phone_number: string;
    relationship: string;
    is_primary: boolean;
  }>;
  authorized_persons?: Array<{
    id: string;
    full_name: string;
    phone_number: string;
    children_relationship: string;
  }>;
  medical_info?: {
    id: string;
    has_medical_condition: boolean;
    medical_condition_details: string | null;
    takes_medication: boolean;
    medication_details: string | null;
    allergies: string | null;
    preferred_medical_center: string;
  } | null;
  terms?: {
    id: string;
    post_pictures_social_media: boolean;
    accepted_at: string;
  } | null;
}

@Component({
  selector: 'app-inscription-detail-modal',
  templateUrl: './inscription-detail-modal.component.html',
  styleUrls: ['./inscription-detail-modal.component.scss'],
  standalone: true,
  imports: [...StandAloneModules]
})
export class InscriptionDetailModalComponent {
  @Input() registration!: RegistrationWithDetails;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calculateAge(birthDate: string): string {
    return calculateAgeToString(birthDate);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'INACTIVE':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'PENDING':
        return 'Pendiente';
      case 'INACTIVE':
        return 'Inactivo';
      default:
        return status;
    }
  }
}
