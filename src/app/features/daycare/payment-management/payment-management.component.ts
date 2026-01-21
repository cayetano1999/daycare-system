import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PaymentModalComponent } from 'src/app/shared/daycare/paymennt-modal/payment-modal.component';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

interface Payment {
  id: string;
  child_id: string;
  child_name: string;
  amount: number;
  payment_date: string;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
}

@Component({
  selector: 'app-payment-management',
  templateUrl: './payment-management.component.html',
  styleUrls: ['./payment-management.component.scss'],
  standalone: true,
  imports: [...StandAloneModules, IonicModule],
  providers: [ModalController]
})
export class PaymentManagementComponent implements OnInit {
  // private supabase: SupabaseClient;

  payments: Payment[] = [];
  filteredPayments: Payment[] = [];

  searchType: string = 'child_name';
  searchValue: string = '';
  startDate: string = '';
  endDate: string = '';
  minAmount: string = '';
  maxAmount: string = '';

  searchTypes = [
    { value: 'child_name', label: 'Nombre del Niño' },
    { value: 'amount', label: 'Monto' },
    { value: 'status', label: 'Estado' }
  ];

  mockPayments: Payment[] = [
    {
      id: '1',
      child_id: '1',
      child_name: 'María José González Pérez',
      amount: 5000,
      payment_date: '2024-01-15',
      status: 'completed'
    },
    {
      id: '2',
      child_id: '2',
      child_name: 'Juan Carlos Rodríguez López',
      amount: 5000,
      payment_date: '2024-01-20',
      status: 'completed'
    },
    {
      id: '3',
      child_id: '3',
      child_name: 'Sofía Martínez Díaz',
      amount: 5000,
      payment_date: '2024-02-10',
      status: 'pending'
    },
    {
      id: '4',
      child_id: '4',
      child_name: 'Miguel Ángel Sánchez Torres',
      amount: 5000,
      payment_date: '2024-01-05',
      status: 'overdue'
    },
    {
      id: '5',
      child_id: '5',
      child_name: 'Isabella Fernández García',
      amount: 5000,
      payment_date: '2024-02-15',
      status: 'completed'
    },
    {
      id: '6',
      child_id: '1',
      child_name: 'María José González Pérez',
      amount: 5000,
      payment_date: '2024-02-15',
      status: 'completed'
    },
    {
      id: '7',
      child_id: '2',
      child_name: 'Juan Carlos Rodríguez López',
      amount: 5000,
      payment_date: '2024-02-20',
      status: 'pending'
    }
  ];

  constructor(private modalController: ModalController) {
    // const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    // const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    // this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  ngOnInit() {
    this.payments = this.mockPayments;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.payments];

    if (this.searchValue) {
      const value = this.searchValue.toLowerCase();
      filtered = filtered.filter(payment => {
        switch (this.searchType) {
          case 'child_name':
            return payment.child_name.toLowerCase().includes(value);
          case 'amount':
            return payment.amount.toString().includes(value);
          case 'status':
            return payment.status.toLowerCase().includes(value);
          default:
            return true;
        }
      });
    }

    if (this.startDate) {
      filtered = filtered.filter(payment => payment.payment_date >= this.startDate);
    }

    if (this.endDate) {
      filtered = filtered.filter(payment => payment.payment_date <= this.endDate);
    }

    if (this.minAmount) {
      filtered = filtered.filter(payment => payment.amount >= parseFloat(this.minAmount));
    }

    if (this.maxAmount) {
      filtered = filtered.filter(payment => payment.amount <= parseFloat(this.maxAmount));
    }

    this.filteredPayments = filtered;
  }

  clearFilters() {
    this.searchValue = '';
    this.startDate = '';
    this.endDate = '';
    this.minAmount = '';
    this.maxAmount = '';
    this.applyFilters();
  }

  async openPaymentModal() {

    const modal = await this.modalController.create({
      component: PaymentModalComponent,
      cssClass: 'full-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data && data.payment) {
      this.payments.unshift(data.payment);
      this.applyFilters();
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencido';
      default:
        return status;
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'overdue':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  }

  getTotalAmount(): number {
    return this.filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  getStatusCount(status: string): number {
    return this.payments.filter(payment => payment.status === status).length;
  }

  onViewDetails(payment: Payment) {
    console.log('Ver detalles del pago:', payment);
  }

  onEditPayment(payment: Payment) {
    console.log('Editar pago:', payment);
  }

  onDeletePayment(payment: Payment) {
    console.log('Eliminar pago:', payment);
  }

  onExport() {
    console.log('Exportar pagos');
  }
}
