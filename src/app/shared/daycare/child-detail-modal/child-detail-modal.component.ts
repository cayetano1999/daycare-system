import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';

interface Child {
  id: string;
  photo: string;
  fullName: string;
  birthDate: string;
  gender: string;
  address: string;
  schedule: string;
  firstGuardian: {
    fullName: string;
    identificationType: string;
    identificationNumber: string;
    phoneNumber: string;
    workplace: string;
  };
  secondGuardian?: {
    fullName: string;
    identificationType: string;
    identificationNumber: string;
    phoneNumber: string;
    workplace: string;
  };
  medicalInfo: {
    hasMedicalCondition: boolean;
    medicalConditionDetails?: string;
    takesMedication: boolean;
    medicationDetails?: string;
    allergies: string;
    preferredMedicalCenter: string;
  };
  authorizedPerson: {
    fullName: string;
    phoneNumber: string;
    relationship: string;
  };
  authorizations: {
    allowSocialMedia: boolean;
  };
}

@Component({
  selector: 'app-child-detail-modal',
  templateUrl: './child-detail-modal.component.html',
  styleUrls: ['./child-detail-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  providers: [ModalController]
})
export class ChildDetailModalComponent {
  @Input() child: Child | null = null;
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  modalCtrl = inject(ModalController);

  calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  closeModal(): void {
    this.modalCtrl.dismiss();
  }

  onPrint(): void {
    window.print();
  }
}
