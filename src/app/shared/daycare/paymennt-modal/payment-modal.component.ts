import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { StandAloneModules } from '../../stand-alone-module';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { Schedule } from 'src/app/features/daycare/child-management/child-management.component';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type PaymentType = 'ABONO' | 'PAGO_TOTAL';

interface ReceiptItem {
  installment_id: string;
  period_year: number;
  period_month: number;
  pending_before: number;
  amount: number;
  pending_after: number;
  payment_type: PaymentType;
}

interface ReceiptData {
  receipt_no: string;
  transaction_id: string; // ej: id respuesta edge
  payment_date: string;
  method_label: string;
  child_name: string;
  notes?: string;
  items: ReceiptItem[];
  total_paid: number;
  total_pending_after: number;
}
interface Child {
  id: string;
  full_name: string;
  avatar_url: string;
  birth_date: Date | any;
  gender: string;
  address: string;
  schedule_id: string;
  ciclo: string;
  created_at: string;
  schedule?: Schedule;
  cicloToValidate?: string;
  isValidCiclo?: boolean;
  registration?: any;
}

interface Installment {
  id: string;
  period_year: number;
  period_month: number;
  amount_total: number;
  amount_paid: number;
  amount_pending: number;
  status: 'PENDING' | 'OVERDUE';
}


@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
  standalone: true,
  imports: [...StandAloneModules, IonicModule]
})
export class PaymentModalComponent implements OnInit {
  // private supabase: SupabaseClient;

  searchType: string = 'name';
  searchValue: string = '';
  selectedChild: Child | null = null;
  isSearching: boolean = false;
  searchPerformed: boolean = false;

  paymentForm = {
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'EFECTIVO',
    status: 'COMPLETED',
    notes: ''
  };

  paymentMethods = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'TARJETA', label: 'Tarjeta' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'CHEQUE', label: 'Cheque' }
  ];

  paymentStatuses = [
    { value: 'COMPLETED', label: 'Completado' },
    { value: 'PENDING', label: 'Pendiente' }
  ];

  // mockChildren: Child[] = [
  //   {
  //     id: '1',
  //     photo: 'https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg?auto=compress&cs=tinysrgb&w=200',
  //     fullName: 'María José González Pérez',
  //     birthDate: '2018-05-15',
  //     gender: 'Femenino',
  //     schedule: 'Matutina',
  //     address: 'Calle Principal #123, Santo Domingo'
  //   },
  //   {
  //     id: '2',
  //     photo: 'https://images.pexels.com/photos/1620653/pexels-photo-1620653.jpeg?auto=compress&cs=tinysrgb&w=200',
  //     fullName: 'Juan Carlos Rodríguez López',
  //     birthDate: '2019-03-20',
  //     gender: 'Masculino',
  //     schedule: 'Vespertina',
  //     address: 'Av. Winston Churchill #456, Santiago'
  //   },
  //   {
  //     id: '3',
  //     photo: 'https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=200',
  //     fullName: 'Sofía Martínez Díaz',
  //     birthDate: '2017-11-08',
  //     gender: 'Femenino',
  //     schedule: 'Matutina',
  //     address: 'Calle El Sol #789, La Vega'
  //   },
  //   {
  //     id: '4',
  //     photo: 'https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&w=200',
  //     fullName: 'Miguel Ángel Sánchez Torres',
  //     birthDate: '2018-09-12',
  //     gender: 'Masculino',
  //     schedule: 'Vespertina',
  //     address: 'Av. 27 de Febrero #234, Santo Domingo'
  //   },
  //   {
  //     id: '5',
  //     photo: 'https://images.pexels.com/photos/1648358/pexels-photo-1648358.jpeg?auto=compress&cs=tinysrgb&w=200',
  //     fullName: 'Isabella Fernández García',
  //     birthDate: '2019-07-25',
  //     gender: 'Femenino',
  //     schedule: 'Matutina',
  //     address: 'Calle Las Flores #567, San Pedro de Macorís'
  //   }
  // ];

  supabaseService = inject(SupabaseService);
  alertCtrl = inject(AlertControllerService);
  childrenResults: Child[] = [];
  installments: Installment[] = [];
  selectedInstallments: Map<string, number> = new Map(); // id → monto a pagar
  showReceipt: boolean = false;


  // Header del recibo
  daycareName = 'Baby House';
  daycareAddress = 'Tu dirección aquí, Santo Domingo';
  daycarePhone = '(829) 000-0000';
  daycareLogoUrl = 'assets/img/baby-house.png'; // pon tu logo

  receiptData: ReceiptData = {
    receipt_no: '',
    transaction_id: '',
    payment_date: '',
    method_label: '',
    child_name: '',
    notes: '',
    items: [],
    total_paid: 0,
    total_pending_after: 0,
  };

  constructor(private modalController: ModalController) {
    // const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    // const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    // this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  ngOnInit() { }

  async searchChild() {
    if (!this.searchValue) return;

    this.isSearching = true;
    this.searchPerformed = true;

    const { data, error } = await this.supabaseService
      .getSupabase()
      .from('children')
      .select('id, full_name, birth_date, gender, address')
      .ilike('full_name', `%${this.searchValue}%`)
      .limit(10);

    this.isSearching = false;

    if (error) {
      console.error(error);
      this.childrenResults = [];
      return;
    }

    this.childrenResults = data as any || [];
  }

  selectChild(child: Child) {
    this.selectedChild = child;
    this.childrenResults = [];
    this.loadPendingInstallments();
  }

  async loadPendingInstallments() {
    if (!this.selectedChild) return;

    const { data, error } = await this.supabaseService
      .getSupabase()
      .from('payment_installments')
      .select(`
      id,
      period_year,
      period_month,
      amount_total,
      amount_paid,
      amount_pending,
      status
    `)
      .eq('child_id', this.selectedChild.id)
      .in('status', ['PENDING', 'OVERDUE', 'PARCIAL'])
      .order('period_year', { ascending: true })
      .order('period_month', { ascending: true });

    if (error) {
      console.error(error);
      this.installments = [];
      return;
    }

    this.installments = data || [];
  }

  toggleInstallment(inst: Installment, checked: boolean) {
    if (!checked) {
      this.selectedInstallments.delete(inst.id);
      return;
    }

    this.selectedInstallments.set(inst.id, inst.amount_pending);
  }



  updateInstallmentAmount(inst: Installment, value: any) {
    const amount = Number(value);

    if (
      isNaN(amount) ||
      amount <= 0 ||
      amount > inst.amount_pending
    ) {
      // si es inválido, vuelve al monto pendiente
      this.selectedInstallments.set(inst.id, inst.amount_pending);
      return;
    }

    this.selectedInstallments.set(inst.id, amount);
  }

  getTotalToPay(): number {
    return Array.from(this.selectedInstallments.values())
      .reduce((sum, v) => sum + v, 0);
  }






  clearSearch() {
    this.searchValue = '';
    this.selectedChild = null;
    this.childrenResults = [];
    this.installments = [];
    this.selectedInstallments.clear();
    this.showReceipt = false;
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

  isFormValid(): boolean {
    return (
      this.selectedChild !== null &&
      this.selectedInstallments.size > 0 &&
      this.paymentForm.paymentDate !== '' &&
      this.paymentForm.paymentMethod !== ''
    );
  }


  async savePayment() {
    if (!this.isFormValid()) {
      return;
    }

    this.alertCtrl.openFestivaAlert('loading', 'Registrando pago...', 'Por favor, espere.');

    debugger;
    // Consultar el id de la incscripcion del nino seleccionado
    let registration_id = '';
    const register = await this.supabaseService.getSupabase()
      .from('registration')
      .select('id')
      .eq('children_id', this.selectedChild!.id)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (register.data) {
      registration_id = register.data.id;
    }

    const { data, error } = await this.supabaseService.getSupabase().functions.invoke(
      'register-payment',
      {
        body: {
          child_id: this.selectedChild!.id,
          registration_id: registration_id,
          payment_date: this.paymentForm.paymentDate,
          method: this.paymentForm.paymentMethod,
          notes: this.paymentForm.notes,
          installments: Array.from(this.selectedInstallments.entries()).map(
            ([installment_id, amount]) => ({
              installment_id,
              amount
            })
          )
        }
      }
    );

    if (error) {
      console.error('Error registering payment:', error);
      await this.alertCtrl.openFestivaAlert(
        'danger',
        'Error',
        'No se pudo registrar el pago. Intente nuevamente.'
      );
      return;
    }

    // const payment = {
    //   id: Date.now().toString(),
    //   child_id: this.selectedChild!.id,
    //   child_name: this.selectedChild!.full_name,
    //   amount: parseFloat(this.paymentForm.amount),
    //   payment_date: this.paymentForm.paymentDate,
    //   payment_method: this.paymentForm.paymentMethod,
    //   status: this.paymentForm.status,
    //   notes: this.paymentForm.notes
    // };

    await this.alertCtrl.openFestivaAlert('success', 'Éxito', 'Pago registrado correctamente.');
    this.buildReceiptAfterPayment(data);
    // await this.modalController.dismiss({
    //   data
    // });
  }

  getPaymentMethodLabel(value: string): string {
    const method = this.paymentMethods.find(m => m.value === value);
    return method ? method.label : value;
  }

  getPaymentStatusLabel(value: string): string {
    const status = this.paymentStatuses.find(s => s.value === value);
    return status ? status.label : value;
  }

  private getMethodLabel(method: string): string {
    const map: any = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', check: 'Cheque' };
    return map[method] || method;
  }

  private formatDateYYYYMMDD(dateStr: string): string {
    return dateStr; // ya lo tienes en YYYY-MM-DD, si no, transforma aquí
  }

  private buildReceiptAfterPayment(edgeResponse: any) {
    const childName = this.selectedChild?.full_name || 'N/A';
    const paymentDate = this.formatDateYYYYMMDD(this.paymentForm.paymentDate);
    const methodLabel = this.getMethodLabel(this.paymentForm.paymentMethod);

    // Construir items desde selectedInstallments + installments (UI)
    const items: ReceiptItem[] = this.installments
      .filter(i => this.selectedInstallments.has(i.id))
      .map(i => {
        const amount = Number(this.selectedInstallments.get(i.id) || 0);
        const pendingBefore = Number(i.amount_pending);
        const pendingAfter = Math.max(0, pendingBefore - amount);

        const paymentType: PaymentType = pendingAfter === 0 ? 'PAGO_TOTAL' : 'ABONO';

        return {
          installment_id: i.id,
          period_year: i.period_year,
          period_month: i.period_month,
          pending_before: pendingBefore,
          amount,
          pending_after: pendingAfter,
          payment_type: paymentType
        };
      });

    const totalPaid = items.reduce((s, x) => s + x.amount, 0);
    const totalPendingAfter = items.reduce((s, x) => s + x.pending_after, 0);

    // Si edgeResponse retorna un id, úsalo, si no, genera uno local
    const transactionId = edgeResponse?.transaction_id || edgeResponse?.id || `${Date.now()}`;

    this.receiptData = {
      receipt_no: `BH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      transaction_id: transactionId,
      payment_date: paymentDate,
      method_label: methodLabel,
      child_name: childName,
      notes: this.paymentForm.notes || '',
      items,
      total_paid: totalPaid,
      total_pending_after: totalPendingAfter,
    };

    this.showReceipt = true;

    // Scroll hacia el recibo (opcional)
    setTimeout(() => {
      document.getElementById('receipt')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }

  async downloadReceiptPng() {
    const el = document.getElementById('receipt');
    if (!el) return;

    // Asegura que el logo ya cargó
    await this.waitForImages(el);

    const canvas = await html2canvas(el, {
      backgroundColor: '#ffffff',
      scale: 2, // mejor calidad
      useCORS: true,
    });

    const dataUrl = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `recibo_${this.receiptData.receipt_no}.png`;
    link.click();
  }


  async downloadReceiptThermalPdf() {
    const el = document.getElementById('receipt');
    if (!el) return;

    await this.waitForImages(el);

    const canvas = await html2canvas(el, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');

    // PDF térmico 80mm: ancho fijo
    const pdfWidthMm = 80;

    // Calcular altura proporcional
    const pxToMm = (px: number) => px * 0.264583; // 1px ~ 0.264583mm (aprox a 96dpi)
    const imgWidthMm = pdfWidthMm;
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [pdfWidthMm, imgHeightMm],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMm, imgHeightMm);
    pdf.save(`recibo_termico_${this.receiptData.receipt_no}.pdf`);
  }

  private async waitForImages(container: HTMLElement) {
    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      imgs.map(img => {
        if (img.complete) return Promise.resolve(true);
        return new Promise(resolve => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true);
        });
      })
    );
  }





  async dismiss() {
    await this.modalController.dismiss();
  }
}
