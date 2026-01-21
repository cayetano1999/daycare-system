import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IonHeader, IonButton } from "@ionic/angular/standalone";
import { StandAloneModules } from '../../stand-alone-module';

interface Child {
  id: string;
  photo: string;
  fullName: string;
  birthDate: string;
  gender: string;
  schedule: string;
  address: string;
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
    paymentMethod: 'cash',
    status: 'completed',
    notes: ''
  };

  paymentMethods = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'card', label: 'Tarjeta' },
    { value: 'transfer', label: 'Transferencia' },
    { value: 'check', label: 'Cheque' }
  ];

  paymentStatuses = [
    { value: 'completed', label: 'Completado' },
    { value: 'pending', label: 'Pendiente' }
  ];

  mockChildren: Child[] = [
    {
      id: '1',
      photo: 'https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg?auto=compress&cs=tinysrgb&w=200',
      fullName: 'María José González Pérez',
      birthDate: '2018-05-15',
      gender: 'Femenino',
      schedule: 'Matutina',
      address: 'Calle Principal #123, Santo Domingo'
    },
    {
      id: '2',
      photo: 'https://images.pexels.com/photos/1620653/pexels-photo-1620653.jpeg?auto=compress&cs=tinysrgb&w=200',
      fullName: 'Juan Carlos Rodríguez López',
      birthDate: '2019-03-20',
      gender: 'Masculino',
      schedule: 'Vespertina',
      address: 'Av. Winston Churchill #456, Santiago'
    },
    {
      id: '3',
      photo: 'https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=200',
      fullName: 'Sofía Martínez Díaz',
      birthDate: '2017-11-08',
      gender: 'Femenino',
      schedule: 'Matutina',
      address: 'Calle El Sol #789, La Vega'
    },
    {
      id: '4',
      photo: 'https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&w=200',
      fullName: 'Miguel Ángel Sánchez Torres',
      birthDate: '2018-09-12',
      gender: 'Masculino',
      schedule: 'Vespertina',
      address: 'Av. 27 de Febrero #234, Santo Domingo'
    },
    {
      id: '5',
      photo: 'https://images.pexels.com/photos/1648358/pexels-photo-1648358.jpeg?auto=compress&cs=tinysrgb&w=200',
      fullName: 'Isabella Fernández García',
      birthDate: '2019-07-25',
      gender: 'Femenino',
      schedule: 'Matutina',
      address: 'Calle Las Flores #567, San Pedro de Macorís'
    }
  ];

  constructor(private modalController: ModalController) {
    // const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    // const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    // this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  ngOnInit() {}

  async searchChild() {
    if (!this.searchValue) {
      return;
    }

    this.isSearching = true;
    this.searchPerformed = true;

    setTimeout(() => {
      const value = this.searchValue.toLowerCase();

      let foundChild = null;

      if (this.searchType === 'id') {
        foundChild = this.mockChildren.find(child => child.id === this.searchValue);
      } else {
        foundChild = this.mockChildren.find(child =>
          child.fullName.toLowerCase().includes(value)
        );
      }

      this.selectedChild = foundChild || null;
      this.isSearching = false;
    }, 500);
  }

  clearSearch() {
    this.searchValue = '';
    this.selectedChild = null;
    this.searchPerformed = false;
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
      this.paymentForm.amount !== '' &&
      parseFloat(this.paymentForm.amount) > 0 &&
      this.paymentForm.paymentDate !== '' &&
      this.paymentForm.paymentMethod !== '' &&
      this.paymentForm.status !== ''
    );
  }

  async savePayment() {
    if (!this.isFormValid()) {
      return;
    }

    const payment = {
      id: Date.now().toString(),
      child_id: this.selectedChild!.id,
      child_name: this.selectedChild!.fullName,
      amount: parseFloat(this.paymentForm.amount),
      payment_date: this.paymentForm.paymentDate,
      payment_method: this.paymentForm.paymentMethod,
      status: this.paymentForm.status,
      notes: this.paymentForm.notes
    };

    await this.modalController.dismiss({
      payment
    });
  }

  getPaymentMethodLabel(value: string): string {
    const method = this.paymentMethods.find(m => m.value === value);
    return method ? method.label : value;
  }

  getPaymentStatusLabel(value: string): string {
    const status = this.paymentStatuses.find(s => s.value === value);
    return status ? status.label : value;
  }

  async dismiss() {
    await this.modalController.dismiss();
  }
}
