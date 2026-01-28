import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { CustomHeaderComponent } from 'src/app/shared/daycare/custom-header/custom-header.component';
import { PaymentModalComponent } from 'src/app/shared/daycare/paymennt-modal/payment-modal.component';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import * as XLSX from 'xlsx';

interface Payment {
  id: string;
  child_id: string;
  child_name: string;
  amount: number;
  payment_date: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  notes?: string;
  description?: string;
}

interface ChildPaymentGroup {
  child_id: string;
  child_name: string;

  total_amount: number;
  pending_amount: number;
  overdue_amount: number;
  completed_amount: number;

  has_pending: boolean;
  has_overdue: boolean;

  installments: Payment[];
}
@Component({
  selector: 'app-payment-management',
  templateUrl: './payment-management.component.html',
  styleUrls: ['./payment-management.component.scss'],
  standalone: true,
  imports: [...StandAloneModules, CustomHeaderComponent],
  providers: [ModalController]
})
export class PaymentManagementComponent implements OnInit {
  // private supabase: SupabaseClient;

  alertService = inject(AlertControllerService);
  supabaseService = inject(SupabaseService);

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
      status: 'COMPLETED'
    },
    {
      id: '2',
      child_id: '2',
      child_name: 'Juan Carlos Rodríguez López',
      amount: 5000,
      payment_date: '2024-01-20',
      status: 'COMPLETED'
    },
    {
      id: '3',
      child_id: '3',
      child_name: 'Sofía Martínez Díaz',
      amount: 5000,
      payment_date: '2024-02-10',
      status: 'PENDING'
    },
    {
      id: '4',
      child_id: '4',
      child_name: 'Miguel Ángel Sánchez Torres',
      amount: 5000,
      payment_date: '2024-01-05',
      status: 'OVERDUE'
    },
    {
      id: '5',
      child_id: '5',
      child_name: 'Isabella Fernández García',
      amount: 5000,
      payment_date: '2024-02-15',
      status: 'COMPLETED'
    },
    {
      id: '6',
      child_id: '1',
      child_name: 'María José González Pérez',
      amount: 5000,
      payment_date: '2024-02-15',
      status: 'COMPLETED'
    },
    {
      id: '7',
      child_id: '2',
      child_name: 'Juan Carlos Rodríguez López',
      amount: 5000,
      payment_date: '2024-02-20',
      status: 'PENDING'
    }
  ];
  groupedChildren!: ChildPaymentGroup[];
  totalAmountsByStatus: Record<string, number> = {};

  constructor(private modalController: ModalController) {

  }

  ngOnInit(): void {

  }

  async loadPayments() {
    const { data, error } = await this.supabaseService
      .getSupabase()
      .from('payment_installments')
      .select(`
      id,
      amount_total,
      description,
      status,
      created_at,
      child:children (
        id,
        full_name
      )
    `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading payments:', error);
      await this.alertService.openFestivaAlert(
        'danger',
        'Error',
        'No se pudieron cargar los pagos'
      );
      return;
    }

    this.payments = this.mapInstallmentsToPayments(data);
    this.applyFilters();
  }

  mapInstallmentsToPayments(data: any[]): Payment[] {
    return data.map(item => ({
      id: item.id,
      child_id: item.child?.id,
      child_name: item.child?.full_name ?? 'N/A',
      amount: item.amount_total,
      payment_date: item.created_at.split('T')[0],
      status: item.status as 'PENDING' | 'COMPLETED' | 'OVERDUE',
      description: item?.description
    }));
  }



  async ionViewWillEnter() {
    // this.payments = this.mockPayments;
    await this.loadPayments();
    this.applyFilters();
    console.log('Payments loaded:', this.payments);
    console.log('Filtered Payments:', this.filteredPayments);
    console.log('Grouped Children:', this.groupedChildren);
  }

  groupPaymentsByChild(payments: Payment[]): ChildPaymentGroup[] {
    const map = new Map<string, ChildPaymentGroup>();

    payments.forEach(payment => {
      if (!map.has(payment.child_id)) {
        map.set(payment.child_id, {
          child_id: payment.child_id,
          child_name: payment.child_name,
          total_amount: 0,
          pending_amount: 0,
          overdue_amount: 0,
          completed_amount: 0,
          has_pending: false,
          has_overdue: false,
          installments: []
        });
      }

      const group = map.get(payment.child_id)!;

      group.total_amount += payment.amount;
      group.installments.push(payment);

      switch (payment.status) {
        case 'PENDING':
          group.pending_amount += payment.amount;
          group.has_pending = true;
          break;
        case 'OVERDUE':
          group.overdue_amount += payment.amount;
          group.has_overdue = true;
          break;
        case 'COMPLETED':
          group.completed_amount += payment.amount;
          break;
      }
    });

    return Array.from(map.values());
  }


  async insertMonthlyQuotes() {
    const result = await this.alertService.openFestivaAlert('question', 'Generar Cuotas', '¿Estás seguro de que deseas generar las cuotas mensuales para todos los niños? Esta acción no se puede deshacer.', true, 'Cancelar', 'Sí, Generar');
    console.log('Alert result:', result);
    if (result?.action === 'confirm') {
      // Lógica para generar las cuotas mensuales
      this.alertService.openFestivaAlert('loading', 'Generando Cuotas', 'Por favor, espera mientras se generan las cuotas mensuales...');
      const { data, error } = await this.supabaseService.getSupabase().functions.invoke('generate-monthly-installments', {
        body: {
          period_year:  new Date().getFullYear(),
          period_month: new Date().getMonth() + 1,
        }
      });
      if (error) {
        console.error('Error generating monthly quotes:', error);
        await this.alertService.openFestivaAlert('danger', 'Error', 'Ocurrió un error al generar las cuotas mensuales. Por favor, intenta nuevamente.');
        return;
      }
      console.log('Monthly quotes generated:', data);
      await this.alertService.openFestivaAlert('success', 'Cuotas Generadas', 'Las cuotas mensuales han sido generadas exitosamente.');
      await this.ionViewWillEnter();
    }
  }

  applyFilters() {
    let filtered = [...this.payments];

    // 🔍 filtros existentes (NO los rompemos)
    if (this.searchValue) {
      const value = this.searchValue.toLowerCase();
      filtered = filtered.filter(p =>
        p.child_name.toLowerCase().includes(value)
      );
    }

    if (this.startDate) {
      filtered = filtered.filter(p => p.payment_date >= this.startDate);
    }

    if (this.endDate) {
      filtered = filtered.filter(p => p.payment_date <= this.endDate);
    }

    if (this.minAmount) {
      filtered = filtered.filter(p => p.amount >= +this.minAmount);
    }

    if (this.maxAmount) {
      filtered = filtered.filter(p => p.amount <= +this.maxAmount);
    }

    // 👇 AGRUPACIÓN FINAL
    this.filteredPayments = filtered;
    this.groupedChildren = this.groupPaymentsByChild(filtered);
    this.totalAmountsByStatus = this.getTotalAmountsByStatus();
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
      // this.payments.unshift(data.payment);
      // this.applyFilters();
    }
    await this.ionViewWillEnter();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'OVERDUE':
        return 'danger';
        case 'PARCIAL':
        return 'tertiary';
      default:
        return 'medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'Completado';
      case 'PENDING':
        return 'Pendiente';
      case 'OVERDUE':
        return 'Vencido';
        case 'PARCIAL':
        return 'Parcial';
      default:
        return status;
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'checkmark-circle';
      case 'PENDING':
        return 'time';
      case 'OVERDUE':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  }

  // getTotalAmount(): number {
  //   return this.filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  // }

  getTotalAmount(): number {
    return this.filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }


  // getStatusCount(status: string): number {
  //   return this.payments.filter(payment => payment.status === status).length;
  // }

  getStatusCount(status: string): number {
    return this.filteredPayments.filter(p => p.status === status).length;
  }

  getTotalAmountsByStatus(): Record<string, number> {
    return this.filteredPayments.reduce((acc, payment) => {
      const status = payment.status;

      if (!acc[status]) {
        acc[status] = 0;
      }

      acc[status] += payment.amount;

      return acc;
    }, {} as Record<string, number>);
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


    /* =========================
       HOJA 1: RESUMEN GENERAL
    ========================== */

    const resumenGeneral = [
      ['INFORME DE PAGOS - GUARDERÍA'],
      ['Fecha de generación', new Date().toLocaleDateString('es-DO')],
      [],
      ['Indicador', 'Cantidad', 'Monto RD$'],
      [
        'Pendientes',
        this.getStatusCount('PENDING'),
        this.totalAmountsByStatus['PENDING'] || 0
      ],
      [
        'Vencidos',
        this.getStatusCount('OVERDUE'),
        this.totalAmountsByStatus['OVERDUE'] || 0
      ],
      [
        'Completados',
        this.getStatusCount('COMPLETED'),
        this.totalAmountsByStatus['COMPLETED'] || 0
      ],
      [],
      [
        'TOTAL GENERAL',
        this.filteredPayments.length,
        this.getTotalAmount()
      ]
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenGeneral);



    /* =========================
       HOJA 2: RESUMEN POR NIÑO
    ========================== */

    const resumenPorNino = [
      [
        'Niño',
        'Total RD$',
        'Pendiente RD$',
        'Vencido RD$',
        'Pagado RD$',
        'Cantidad de Cuotas'
      ],
      ...this.groupedChildren.map(child => [
        child.child_name,
        child.total_amount,
        child.pending_amount,
        child.overdue_amount,
        child.completed_amount,
        child.installments.length
      ])
    ];

    const wsNinos = XLSX.utils.aoa_to_sheet(resumenPorNino);



    /* =========================
       HOJA 3: DETALLE DE CUOTAS
    ========================== */

    const detalleCuotas = [
      [
        'Niño',
        'Fecha',
        'Monto RD$',
        'Estado'
      ],
      ...this.filteredPayments.map(p => [
        p.child_name,
        p.payment_date,
        p.amount,
        this.getStatusLabel(p.status)
      ])
    ];

    const wsCuotas = XLSX.utils.aoa_to_sheet(detalleCuotas);



    /* =========================
       CREAR WORKBOOK
    ========================== */

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen General');
    XLSX.utils.book_append_sheet(wb, wsNinos, 'Resumen por Niño');
    XLSX.utils.book_append_sheet(wb, wsCuotas, 'Detalle de Cuotas');



    /* =========================
       EXPORTAR
    ========================== */

    XLSX.writeFile(
      wb,
      `informe_pagos_guarderia_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  }

}
