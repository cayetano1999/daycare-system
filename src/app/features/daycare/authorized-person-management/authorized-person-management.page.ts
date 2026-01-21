import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { AuthorizedPersonDetailModalComponent } from 'src/app/shared/daycare/authorized-person-detail-modal/authorized-person-detail-modal.component';

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
  selector: 'app-authorized-person-management',
  templateUrl: './authorized-person-management.page.html',
  styleUrls: ['./authorized-person-management.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ModalController]
})
export class AuthorizedPersonManagementPage {
  searchTerm: string = '';
  selectedPerson: AuthorizedPerson | null = null;
  isModalOpen: boolean = false;

  modalCtrl = inject(ModalController);

  mockAuthorizedPersons: AuthorizedPerson[] = [
    {
      id: '1',
      name: 'Carlos Martínez López',
      phone: '809-555-1234',
      childName: 'Ana Martínez',
      relationship: 'Tío',
      idNumber: '001-0234567-8',
      email: 'carlos.martinez@email.com',
      address: 'Calle Principal #123, Santo Domingo',
      emergencyContact: '809-555-5678',
      notes: 'Autorizado para recoger los martes y jueves'
    },
    {
      id: '2',
      name: 'María Fernández García',
      phone: '829-555-2345',
      childName: 'Luis Rodríguez',
      relationship: 'Abuela',
      idNumber: '001-0345678-9',
      email: 'maria.fernandez@email.com',
      address: 'Av. Winston Churchill #456, Santiago',
      emergencyContact: '829-555-6789',
      notes: 'Recoger solo en emergencias'
    },
    {
      id: '3',
      name: 'Pedro Sánchez Díaz',
      phone: '849-555-3456',
      childName: 'Sofía López',
      relationship: 'Hermano Mayor',
      idNumber: '001-0456789-0',
      email: 'pedro.sanchez@email.com',
      address: 'Calle El Sol #789, La Vega',
      emergencyContact: '849-555-7890',
      notes: 'Autorizado todos los días'
    },
    {
      id: '4',
      name: 'Laura Jiménez Pérez',
      phone: '809-555-4567',
      childName: 'Miguel García',
      relationship: 'Tía',
      idNumber: '001-0567890-1',
      email: 'laura.jimenez@email.com',
      address: 'Av. 27 de Febrero #234, Santo Domingo',
      emergencyContact: '809-555-8901',
      notes: 'Contactar antes de recoger'
    },
    {
      id: '5',
      name: 'Roberto Cruz Medina',
      phone: '829-555-5678',
      childName: 'Isabella Pérez',
      relationship: 'Abuelo',
      idNumber: '001-0678901-2',
      email: 'roberto.cruz@email.com',
      address: 'Calle Las Flores #567, San Pedro de Macorís',
      emergencyContact: '829-555-9012',
      notes: 'Solo los viernes'
    },
    {
      id: '6',
      name: 'Carmen Vásquez Torres',
      phone: '849-555-6789',
      childName: 'Daniel Morales',
      relationship: 'Madrina',
      idNumber: '001-0789012-3',
      email: 'carmen.vasquez@email.com',
      address: 'Av. Núñez de Cáceres #890, Santo Domingo',
      emergencyContact: '849-555-0123',
      notes: 'Verificar identificación siempre'
    },
    {
      id: '7',
      name: 'José Ramírez Guzmán',
      phone: '809-555-7890',
      childName: 'Valentina Herrera',
      relationship: 'Padrino',
      idNumber: '001-0890123-4',
      email: 'jose.ramirez@email.com',
      address: 'Calle Duarte #345, Puerto Plata',
      emergencyContact: '809-555-1234',
      notes: 'Autorizado ocasionalmente'
    },
    {
      id: '8',
      name: 'Ana Lucía Ortiz Santos',
      phone: '829-555-8901',
      childName: 'Gabriel Castillo',
      relationship: 'Vecina/Amiga de la familia',
      idNumber: '001-0901234-5',
      email: 'analucia.ortiz@email.com',
      address: 'Calle Santomé #678, La Romana',
      emergencyContact: '829-555-2345',
      notes: 'Solo en casos de emergencia'
    }
  ];

  get filteredPersons(): AuthorizedPerson[] {
    if (!this.searchTerm) {
      return this.mockAuthorizedPersons;
    }

    const term = this.searchTerm.toLowerCase();
    return this.mockAuthorizedPersons.filter(person =>
      person.name.toLowerCase().includes(term) ||
      person.phone.includes(term) ||
      person.childName.toLowerCase().includes(term)
    );
  }

  get totalAuthorized(): number {
    return this.mockAuthorizedPersons.length;
  }

  get uniqueChildren(): number {
    return new Set(this.mockAuthorizedPersons.map(p => p.childName)).size;
  }

  get activeContacts(): number {
    return this.filteredPersons.length;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  async openDetailModal(person: AuthorizedPerson) {
    this.selectedPerson = person;
    this.isModalOpen = true;

    console.log('Abrir modal para persona:', person);
    const modal = await this.modalCtrl.create({
      component: AuthorizedPersonDetailModalComponent,
      componentProps: {
        person: person,
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
    this.selectedPerson = null;
  }

  onRegisterNewPerson(): void {
    console.log('Registrar nueva persona autorizada');
  }

  onEditPerson(person: AuthorizedPerson): void {
    console.log('Editar persona:', person);
  }

  onDeletePerson(person: AuthorizedPerson): void {
    console.log('Eliminar persona:', person);
  }
}
