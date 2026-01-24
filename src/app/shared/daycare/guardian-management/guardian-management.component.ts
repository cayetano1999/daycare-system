import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ModalController,
  AlertController
} from '@ionic/angular/standalone';

import { GuardianDetailModalComponent } from '../guardian-detail-modal/guardian-detail-modal.component';
import { IonicModule } from '@ionic/angular';

interface GuardianWithChildren {
  id: string;
  full_name: string;
  identification_type: string;
  identification_number: string;
  phone_number: string;
  workplace: string;
  email: string;
  children_count: number;
}
interface Guardian {
  id: string;
  full_name: string;
  identification_type: string;
  identification_number: string;
  phone_number: string;
  workplace: string;
  email: string;
  children_count: number;
}
const MOCK_GUARDIANS: Guardian[] = [
  {
    id: '1',
    full_name: 'María García Pérez',
    identification_type: 'Cédula',
    identification_number: '001-1234567-8',
    phone_number: '809-123-4567',
    workplace: 'Hospital General',
    email: 'maria.garcia@email.com',
    children_count: 2
  },
  {
    id: '2',
    full_name: 'Juan Rodríguez López',
    identification_type: 'Cédula',
    identification_number: '001-2345678-9',
    phone_number: '809-234-5678',
    workplace: 'Banco Popular',
    email: 'juan.rodriguez@email.com',
    children_count: 2
  },
  {
    id: '3',
    full_name: 'Ana Martínez Santos',
    identification_type: 'Cédula',
    identification_number: '001-3456789-0',
    phone_number: '809-345-6789',
    workplace: 'Ministerio de Educación',
    email: 'ana.martinez@email.com',
    children_count: 1
  },
  {
    id: '4',
    full_name: 'Carlos Fernández Cruz',
    identification_type: 'Cédula',
    identification_number: '001-4567890-1',
    phone_number: '809-456-7890',
    workplace: 'Universidad PUCMM',
    email: 'carlos.fernandez@email.com',
    children_count: 1
  },
  {
    id: '5',
    full_name: 'Laura Díaz Mejía',
    identification_type: 'Pasaporte',
    identification_number: 'AB123456',
    phone_number: '809-567-8901',
    workplace: 'Empresa Consultora',
    email: 'laura.diaz@email.com',
    children_count: 1
  }
];


@Component({
  selector: 'app-guardian-management',
  templateUrl: './guardian-management.component.html',
  styleUrls: ['./guardian-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
   IonicModule,
    GuardianDetailModalComponent
  ],
  providers: [ModalController, AlertController]
})

export class GuardianManagementComponent implements OnInit {
  guardians: GuardianWithChildren[] = [];
  filteredGuardians: GuardianWithChildren[] = [
    {
      id: '1',
      full_name: 'María García Pérez',
      identification_type: 'Cédula',
      identification_number: '001-1234567-8',
      phone_number: '809-123-4567',
      workplace: 'Hospital General',
      email: 'maria.garcia@email.com',
      children_count: 2
    },
    {
      id: '2',
      full_name: 'Juan Rodríguez López',
      identification_type: 'Cédula',
      identification_number: '001-2345678-9',
      phone_number: '809-234-5678',
      workplace: 'Banco Popular',
      email: 'juan.rodriguez@email.com',
      children_count: 2
    },
    {
      id: '3',
      full_name: 'Ana Martínez Santos',
      identification_type: 'Cédula',
      identification_number: '001-3456789-0',
      phone_number: '809-345-6789',
      workplace: 'Ministerio de Educación',
      email: 'ana.martinez@email.com',
      children_count: 1
    },
    {
      id: '4',
      full_name: 'Carlos Fernández Cruz',
      identification_type: 'Cédula',
      identification_number: '001-4567890-1',
      phone_number: '809-456-7890',
      workplace: 'Universidad PUCMM',
      email: 'carlos.fernandez@email.com',
      children_count: 1
    },
    {
      id: '5',
      full_name: 'Laura Díaz Mejía',
      identification_type: 'Pasaporte',
      identification_number: 'AB123456',
      phone_number: '809-567-8901',
      workplace: 'Empresa Consultora',
      email: 'laura.diaz@email.com',
      children_count: 1
    }
  ];
  searchTerm = '';
  loading = true;
  activeMenuId: string | null = null;




  // private supabase = createClient(
  //   import.meta.env.VITE_SUPABASE_URL,
  //   import.meta.env.VITE_SUPABASE_ANON_KEY
  // );

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {
  
  }

  ngOnInit() {
    debugger;
    // this.filteredGuardians = this.guardians;
  }

  handleSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm = value;
    const term = value.toLowerCase();

    if (!term) {
      this.filteredGuardians = this.guardians;
      return;
    }

    this.filteredGuardians = this.guardians.filter(guardian =>
      guardian.full_name.toLowerCase().includes(term) ||
      guardian.identification_number.toLowerCase().includes(term) ||
      guardian.phone_number.toLowerCase().includes(term) ||
      guardian.workplace.toLowerCase().includes(term)
    );
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredGuardians = this.guardians;
  }

  toggleMenu(guardianId: string) {
    this.activeMenuId = this.activeMenuId === guardianId ? null : guardianId;
  }

  closeMenu() {
    this.activeMenuId = null;
  }

  async viewDetails(guardianId: string) {
    this.closeMenu();

    const modal = await this.modalCtrl.create({
      component: GuardianDetailModalComponent,
      componentProps: {
        guardianId: guardianId
      },
      cssClass: 'full-modal'
    });

    await modal.present();
  }

  async updateGuardian(guardian: Guardian) {
    this.closeMenu();

    const alert = await this.alertCtrl.create({
      header: 'En Desarrollo',
      message: `Función de actualizar en desarrollo para: ${guardian.full_name}`,
      buttons: ['OK']
    });
    await alert.present();
  }

  async deleteGuardian(guardian: Guardian) {
    this.closeMenu();

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro que desea eliminar a ${guardian.full_name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.performDelete(guardian);
          }
        }
      ]
    });

    await alert.present();
  }

  async performDelete(guardian: Guardian) {
    const alert = await this.alertCtrl.create({
      header: 'Éxito',
      message: 'Tutor eliminado correctamente',
      buttons: ['OK']
    });
    await alert.present();
  }

  async addGuardian() {
    const alert = await this.alertCtrl.create({
      header: 'En Desarrollo',
      message: 'Función de agregar tutor en desarrollo',
      buttons: ['OK']
    });
    await alert.present();
  }

}
