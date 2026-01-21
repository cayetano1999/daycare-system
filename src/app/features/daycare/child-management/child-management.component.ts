import { Component, inject } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { IonContent } from "@ionic/angular/standalone";
import { ChildDetailModalComponent } from 'src/app/shared/daycare/child-detail-modal/child-detail-modal.component';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

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
  selector: 'app-child-management',
  templateUrl: './child-management.component.html',
  styleUrls: ['./child-management.component.scss'],
  standalone: true,
  imports: [...StandAloneModules, IonicModule],
  providers: [ModalController]
})
export class ChildManagementComponent {

  modalCtrl = inject(ModalController);

  searchType: string = 'name';
  searchValue: string = '';
  selectedChild: Child | null = null;
  isModalOpen: boolean = false;

  searchTypes = [
    { value: 'name', label: 'Nombre' },
    { value: 'gender', label: 'Género' },
    { value: 'schedule', label: 'Tanda' },
    { value: 'address', label: 'Dirección' }
  ];

  mockChildren: Child[] = [
    {
      id: '1',
      photo: 'https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg?auto=compress&cs=tinysrgb&w=200',
      fullName: 'María José González Pérez',
      birthDate: '2025-11-15',
      gender: 'Femenino',
      address: 'Calle Principal #123, Santo Domingo',
      schedule: 'Matutina',
      firstGuardian: {
        fullName: 'Carlos González',
        identificationType: 'Cédula',
        identificationNumber: '001-0234567-8',
        phoneNumber: '809-555-1234',
        workplace: 'Empresa ABC'
      },
      medicalInfo: {
        hasMedicalCondition: false,
        takesMedication: false,
        allergies: 'Ninguna',
        preferredMedicalCenter: 'Hospital General'
      },
      authorizedPerson: {
        fullName: 'Ana Pérez',
        phoneNumber: '809-555-5678',
        relationship: 'Tía'
      },
      authorizations: {
        allowSocialMedia: true
      }
    },
    {
      id: '2',
      photo: 'https://images.pexels.com/photos/1620653/pexels-photo-1620653.jpeg?auto=compress&cs=tinysrgb&w=200',
      fullName: 'Juan Carlos Rodríguez López',
      birthDate: '2019-03-20',
      gender: 'Masculino',
      address: 'Av. Winston Churchill #456, Santiago',
      schedule: 'Vespertina',
      firstGuardian: {
        fullName: 'María López',
        identificationType: 'Cédula',
        identificationNumber: '001-0345678-9',
        phoneNumber: '829-555-2345',
        workplace: 'Clínica XYZ'
      },
      medicalInfo: {
        hasMedicalCondition: true,
        medicalConditionDetails: 'Asma leve',
        takesMedication: true,
        medicationDetails: 'Inhalador según necesidad',
        allergies: 'Polen',
        preferredMedicalCenter: 'Clínica Pediatra'
      },
      authorizedPerson: {
        fullName: 'Pedro Rodríguez',
        phoneNumber: '829-555-6789',
        relationship: 'Abuelo'
      },
      authorizations: {
        allowSocialMedia: false
      }
    },
    {
      id: '3',
      photo: 'https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=200',
      fullName: 'Sofía Martínez Díaz',
      birthDate: '2017-11-08',
      gender: 'Femenino',
      address: 'Calle El Sol #789, La Vega',
      schedule: 'Matutina',
      firstGuardian: {
        fullName: 'Laura Díaz',
        identificationType: 'Cédula',
        identificationNumber: '001-0456789-0',
        phoneNumber: '849-555-3456',
        workplace: 'Banco Nacional'
      },
      medicalInfo: {
        hasMedicalCondition: false,
        takesMedication: false,
        allergies: 'Mariscos',
        preferredMedicalCenter: 'Hospital Infantil'
      },
      authorizedPerson: {
        fullName: 'Carmen Martínez',
        phoneNumber: '849-555-7890',
        relationship: 'Abuela'
      },
      authorizations: {
        allowSocialMedia: true
      }
    },
    {
      id: '4',
      photo: 'https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&w=200',
      fullName: 'Miguel Ángel Sánchez Torres',
      birthDate: '2018-09-12',
      gender: 'Masculino',
      address: 'Av. 27 de Febrero #234, Santo Domingo',
      schedule: 'Vespertina',
      firstGuardian: {
        fullName: 'Roberto Sánchez',
        identificationType: 'Cédula',
        identificationNumber: '001-0567890-1',
        phoneNumber: '809-555-4567',
        workplace: 'Supermercado Nacional'
      },
      medicalInfo: {
        hasMedicalCondition: false,
        takesMedication: false,
        allergies: 'Ninguna',
        preferredMedicalCenter: 'Centro Médico Dominicano'
      },
      authorizedPerson: {
        fullName: 'Isabel Torres',
        phoneNumber: '809-555-8901',
        relationship: 'Madre'
      },
      authorizations: {
        allowSocialMedia: true
      }
    },
    {
      id: '5',
      photo: 'https://images.pexels.com/photos/1648358/pexels-photo-1648358.jpeg?auto=compress&cs=tinysrgb&w=200',
      fullName: 'Isabella Fernández García',
      birthDate: '2019-07-25',
      gender: 'Femenino',
      address: 'Calle Las Flores #567, San Pedro de Macorís',
      schedule: 'Matutina',
      firstGuardian: {
        fullName: 'José Fernández',
        identificationType: 'Cédula',
        identificationNumber: '001-0678901-2',
        phoneNumber: '829-555-5678',
        workplace: 'Ministerio de Salud'
      },
      medicalInfo: {
        hasMedicalCondition: false,
        takesMedication: false,
        allergies: 'Frutos secos',
        preferredMedicalCenter: 'Hospital Regional'
      },
      authorizedPerson: {
        fullName: 'María García',
        phoneNumber: '829-555-9012',
        relationship: 'Madre'
      },
      authorizations: {
        allowSocialMedia: false
      }
    }
  ];

  get filteredChildren(): Child[] {
    if (!this.searchValue) {
      return this.mockChildren;
    }

    const value = this.searchValue.toLowerCase();
    return this.mockChildren.filter(child => {
      switch (this.searchType) {
        case 'name':
          return child.fullName.toLowerCase().includes(value);
        case 'gender':
          return child.gender.toLowerCase().includes(value);
        case 'schedule':
          return child.schedule.toLowerCase().includes(value);
        case 'address':
          return child.address.toLowerCase().includes(value);
        default:
          return true;
      }
    });
  }

  calculateAge(birthDate: string): string {
    const today = new Date();
    const birth = new Date(birthDate);

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      // Get days in previous month
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate weeks and remaining days
    let weeks = Math.floor(days / 7);
    let remainingDays = days % 7;

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} año${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mes${months > 1 ? 'es' : ''}`);
    if (weeks > 0) parts.push(`${weeks} semana${weeks > 1 ? 's' : ''}`);
    if (remainingDays > 0) parts.push(`${remainingDays} día${remainingDays > 1 ? 's' : ''}`);

    // If all are zero (newborn), show "0 días"
    if (parts.length === 0) {
      parts.push('0 días');
    }

    return parts[0];
  }

  getScheduleCount(schedule: string): number {
    return this.mockChildren.filter(child => child.schedule === schedule).length;
  }

  async openDetailModal(child: Child): Promise<void> {
    this.selectedChild = child;
    this.isModalOpen = true;
    console.log('Abrir modal para niño:', child);

    const modal = await this.modalCtrl.create({
      component: ChildDetailModalComponent,
      componentProps: {
        child: child,
        isOpen: true
      },
      cssClass: 'full-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    console.log('Modal cerrado con datos:', data);

  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedChild = null;
  }

  onEditChild(child: Child): void {
    console.log('Editar niño:', child);
  }

  onDeleteChild(child: Child): void {
    console.log('Eliminar niño:', child);
  }

  onExport(): void {
    console.log('Exportar listado de niños');
  }
}
