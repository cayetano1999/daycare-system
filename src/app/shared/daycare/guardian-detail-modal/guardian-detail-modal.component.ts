import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';

interface Guardian {
  id: string;
  full_name: string;
  identification_type: string;
  identification_number: string;
  phone_number: string;
  workplace: string;
  email: string;
}

interface Child {
  id: string;
  full_name: string;
  birth_date: string;
  gender: string;
  address: string;
  schedule: string;
  avatar_url?: string;
}

interface Payment {
  id: string;
  child_name: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  concept: string;
  status: string;
  notes?: string;
}

const MOCK_GUARDIANS: { [key: string]: Guardian } = {
  '1': {
    id: '1',
    full_name: 'María García Pérez',
    identification_type: 'Cédula',
    identification_number: '001-1234567-8',
    phone_number: '809-123-4567',
    workplace: 'Hospital General',
    email: 'maria.garcia@email.com'
  },
  '2': {
    id: '2',
    full_name: 'Juan Rodríguez López',
    identification_type: 'Cédula',
    identification_number: '001-2345678-9',
    phone_number: '809-234-5678',
    workplace: 'Banco Popular',
    email: 'juan.rodriguez@email.com'
  },
  '3': {
    id: '3',
    full_name: 'Ana Martínez Santos',
    identification_type: 'Cédula',
    identification_number: '001-3456789-0',
    phone_number: '809-345-6789',
    workplace: 'Ministerio de Educación',
    email: 'ana.martinez@email.com'
  },
  '4': {
    id: '4',
    full_name: 'Carlos Fernández Cruz',
    identification_type: 'Cédula',
    identification_number: '001-4567890-1',
    phone_number: '809-456-7890',
    workplace: 'Universidad PUCMM',
    email: 'carlos.fernandez@email.com'
  },
  '5': {
    id: '5',
    full_name: 'Laura Díaz Mejía',
    identification_type: 'Pasaporte',
    identification_number: 'AB123456',
    phone_number: '809-567-8901',
    workplace: 'Empresa Consultora',
    email: 'laura.diaz@email.com'
  }
};

const MOCK_CHILDREN: { [key: string]: Child[] } = {
  '1': [
    {
      id: '1',
      full_name: 'Sofía García Rodríguez',
      birth_date: '2020-05-15',
      gender: 'Femenino',
      address: 'Calle Principal #123, Santo Domingo',
      schedule: 'Matutina'
    },
    {
      id: '2',
      full_name: 'Miguel García Rodríguez',
      birth_date: '2021-08-22',
      gender: 'Masculino',
      address: 'Calle Principal #123, Santo Domingo',
      schedule: 'Matutina'
    }
  ],
  '2': [
    {
      id: '3',
      full_name: 'Miguel Rodríguez García',
      birth_date: '2019-08-20',
      gender: 'Masculino',
      address: 'Calle Principal #123, Santo Domingo',
      schedule: 'Matutina'
    },
    {
      id: '4',
      full_name: 'Lucía Rodríguez García',
      birth_date: '2021-03-15',
      gender: 'Femenino',
      address: 'Calle Principal #123, Santo Domingo',
      schedule: 'Vespertina'
    }
  ],
  '3': [
    {
      id: '5',
      full_name: 'Isabella Martínez López',
      birth_date: '2021-03-10',
      gender: 'Femenino',
      address: 'Av. Winston Churchill #456, Santo Domingo',
      schedule: 'Vespertina'
    }
  ],
  '4': [
    {
      id: '6',
      full_name: 'Daniel Fernández Pérez',
      birth_date: '2020-11-25',
      gender: 'Masculino',
      address: 'Calle Proyecto #789, Santiago',
      schedule: 'Matutina'
    }
  ],
  '5': [
    {
      id: '7',
      full_name: 'Valentina Díaz Santos',
      birth_date: '2021-07-08',
      gender: 'Femenino',
      address: 'Calle El Conde #321, Santo Domingo',
      schedule: 'Todo el día'
    }
  ]
};

const MOCK_PAYMENTS: { [key: string]: Payment[] } = {
  '1': [
    {
      id: '1',
      child_name: 'Sofía García Rodríguez',
      amount: 8500.00,
      payment_date: '2025-12-01',
      payment_method: 'Transferencia',
      concept: 'Mensualidad',
      status: 'Pagado'
    },
    {
      id: '2',
      child_name: 'Sofía García Rodríguez',
      amount: 8500.00,
      payment_date: '2025-11-01',
      payment_method: 'Transferencia',
      concept: 'Mensualidad',
      status: 'Pagado'
    },
    {
      id: '3',
      child_name: 'Miguel García Rodríguez',
      amount: 8500.00,
      payment_date: '2025-12-01',
      payment_method: 'Transferencia',
      concept: 'Mensualidad',
      status: 'Pagado'
    }
  ],
  '2': [
    {
      id: '4',
      child_name: 'Miguel Rodríguez García',
      amount: 8500.00,
      payment_date: '2025-11-01',
      payment_method: 'Efectivo',
      concept: 'Mensualidad',
      status: 'Pagado'
    },
    {
      id: '5',
      child_name: 'Lucía Rodríguez García',
      amount: 8500.00,
      payment_date: '2025-12-01',
      payment_method: 'Efectivo',
      concept: 'Mensualidad',
      status: 'Pendiente'
    }
  ],
  '3': [
    {
      id: '6',
      child_name: 'Isabella Martínez López',
      amount: 12000.00,
      payment_date: '2025-09-01',
      payment_method: 'Transferencia',
      concept: 'Inscripción',
      status: 'Pagado'
    },
    {
      id: '7',
      child_name: 'Isabella Martínez López',
      amount: 9500.00,
      payment_date: '2025-10-01',
      payment_method: 'Cheque',
      concept: 'Mensualidad',
      status: 'Pagado'
    },
    {
      id: '8',
      child_name: 'Isabella Martínez López',
      amount: 9500.00,
      payment_date: '2025-11-01',
      payment_method: 'Transferencia',
      concept: 'Mensualidad',
      status: 'Pagado'
    }
  ],
  '4': [
    {
      id: '9',
      child_name: 'Daniel Fernández Pérez',
      amount: 8500.00,
      payment_date: '2025-12-01',
      payment_method: 'Transferencia',
      concept: 'Mensualidad',
      status: 'Pagado'
    }
  ],
  '5': [
    {
      id: '10',
      child_name: 'Valentina Díaz Santos',
      amount: 10000.00,
      payment_date: '2025-12-01',
      payment_method: 'Transferencia',
      concept: 'Mensualidad',
      status: 'Pagado'
    }
  ]
};

@Component({
  selector: 'app-guardian-detail-modal',
  templateUrl: './guardian-detail-modal.component.html',
  styleUrls: ['./guardian-detail-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule
  ]
})
export class GuardianDetailModalComponent implements OnInit {
  @Input() guardianId!: string;

  guardian: Guardian | null = null;
  children: Child[] = [];
  payments: Payment[] = [];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.loadGuardianDetails();
  }

  loadGuardianDetails() {
    this.guardian = MOCK_GUARDIANS[this.guardianId];
    this.children = MOCK_CHILDREN[this.guardianId] || [];
    this.payments = MOCK_PAYMENTS[this.guardianId] || [];

    document.body.style.overflow = 'hidden';
  }

  dismiss() {
    document.body.style.overflow = 'unset';
    this.modalCtrl.dismiss();
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pagado':
        return 'bg-green-100 text-green-700';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-700';
      case 'vencido':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

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

  getTotalPayments(): number {
    return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }
}
