import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Subject, takeUntil } from 'rxjs';
import { ActionSheetController, IonContent, IonIcon } from "@ionic/angular/standalone";
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { CICLOS_CURSOS_DROPDOWN } from '../inscription/inscription.page';
import { calculateAgeToString, obtenerCicloPorFecha } from 'src/app/core/constants/constants';
import { Router } from '@angular/router';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { InscriptionDetailModalComponent } from 'src/app/shared/daycare/inscription-detail-modal/inscription-detail-modal.component';
import { ModalController } from '@ionic/angular';
import * as XLSX from 'xlsx';

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

export interface Schedule {
  id: string;
  description: string;
  status: string;
}

interface Filters {
  nombre: string;
  fechaNacimiento: string;
  genero: string;
  schedule_id: string;
  ciclo: string;
}


@Component({
  selector: 'app-child-management',
  standalone: true,
  imports: [IonIcon, IonContent, CommonModule, FormsModule],
  templateUrl: './child-management.component.html',
  styleUrls: ['./child-management.component.scss'],
  providers: [ModalController]
})
export class ChildManagementComponent implements OnInit, OnDestroy {
  private supabase: SupabaseClient;
  private destroy$ = new Subject<void>();

  supabaseService = inject(SupabaseService);
  actionSheetCtrl = inject(ActionSheetController);
  router = inject(Router);
  alertCtrl = inject(AlertControllerService);
  modalCtrl = inject(ModalController);

  children: Child[] = [];
  filteredChildren: Child[] = [];
  loading = true;

  filters: Filters = {
    nombre: '',
    fechaNacimiento: '',
    genero: '',
    schedule_id: '',
    ciclo: ''
  };

  schedules: Schedule[] = [];
  ciclos: string[] = CICLOS_CURSOS_DROPDOWN.map(c => c.value);

  constructor() {
    this.supabase = this.supabaseService.getSupabase();
  }

  ngOnInit(): void {
    this.loadSchedules();
    this.loadChildren();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadSchedules(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('schedules')
        .select('*')
        .eq('status', 'ACTIVA');

      if (error) throw error;
      console.log('Schedules loaded:', data);
      this.schedules = data || [];
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  }

  async loadChildren(): Promise<void> {
    this.loading = true;
    debugger;
    try {
      const { data, error } = await this.supabase
        .from('children_with_active_registration')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;

      let newData = [];
      //  hacer un map de data para validar si el ciclo del nino es igual al que debe de tener segun su fecha de nacimiento
      console.log('Children loaded:', data);
      if (data) {
        newData = data.map(child => {
          const realCiclo = this.validateRealCicle(child.birth_date);
          child.registration = {
            created_at: child.registration_created_at,
            id: child.registration_id,
            status: child.registration_status
          };
          child.schedule = {
            id: child.schedule_id,
            description: child.schedule_description,
            status: child.schedule_status
          }
          return {
            ...child,
            cicloToValidate: realCiclo,
            isValidCiclo: child.ciclo === realCiclo ? true : false,
          };
        });
      }

      this.children = newData || [];
      this.applyFilters();
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      this.loading = false;
    }
  }

  applyFilters(): void {
    this.filteredChildren = this.children.filter(child => {
      const matchNombre = !this.filters.nombre ||
        child.full_name.toLowerCase().includes(this.filters.nombre.toLowerCase());

      const matchFecha = !this.filters.fechaNacimiento ||
        new Date(child.birth_date).toISOString().split('T')[0] === this.filters.fechaNacimiento;

      const matchGenero = !this.filters.genero ||
        child.gender === this.filters.genero;

      const matchSchedule = !this.filters.schedule_id ||
        child.schedule_id === this.filters.schedule_id;

      const matchCiclo = !this.filters.ciclo ||
        child.ciclo === this.filters.ciclo;

      return matchNombre && matchFecha && matchGenero && matchSchedule && matchCiclo;
    });
  }

  clearFilters(): void {
    this.filters = {
      nombre: '',
      fechaNacimiento: '',
      genero: '',
      schedule_id: '',
      ciclo: ''
    };
    this.applyFilters();
  }

  calculateAge(birthDate: string): string {
    return calculateAgeToString(birthDate);
  }

  getScheduleName(scheduleId: string): string {
    const schedule = this.schedules.find(s => s.id === scheduleId);
    return schedule?.description || 'Sin asignar';
  }

  get totalChildren(): number {
    return this.filteredChildren.length;
  }

  get childrenBySchedule(): { schedule: string; count: number }[] {
    const grouped = this.filteredChildren.reduce((acc, child) => {
      const scheduleName = this.getScheduleName(child.schedule_id);
      acc[scheduleName] = (acc[scheduleName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([schedule, count]) => ({ schedule, count }));
  }

  validateRealCicle(birthDate: string): string {
    const result = obtenerCicloPorFecha(new Date(birthDate));
    return result.ciclo + ' - ' + result.curso;
  }

  exportToCSV(): void {
    const headers = ['Nombre', 'Fecha Nacimiento', 'Edad', 'Género', 'Horario', 'Ciclo', 'Comentario'];
    const rows = this.filteredChildren.map(child => [
      child.full_name.replace(/,/g, '-'),
      new Date(child.birth_date).toLocaleDateString('es-ES').replace(/,/g, '-'),
      this.calculateAge(child.birth_date.toString()).replace(/,/g, '-'),
      (child.gender === 'M' ? 'Masculino' : 'Femenino').replace(/,/g, '-'),
      this.getScheduleName(child.schedule_id).replace(/,/g, '-'),
      (child.ciclo || '').replace(/,/g, '-'),
      (child.isValidCiclo ? 'Válido' : `El ciclo actual no es válido. le corresponde el ciclo: (${child?.cicloToValidate})`).replace(/,/g, '-')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `listado_ninos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async viewDetails(child: Child) {
    console.log('Ver detalles:', child);
    // Implementar navegación o modal


    //obtener el ultimo item de registrations
    if (!child?.registration) {
      this.alertCtrl.openFestivaAlert('warning', 'Sin Inscripción', 'El niño no tiene una inscripción asociada.');
      return;
    }

    try {
      // Cargar detalles completos
      this.alertCtrl.openFestivaAlert('loading', 'Cargando detalles de la inscripción...', 'por favor, espere');
      const fullDetails = await this.getRegistrationById(child.registration);
      if (fullDetails) {
        const modal = await this.modalCtrl.create({
          component: InscriptionDetailModalComponent,
          componentProps: {
            registration: fullDetails
          },
          cssClass: 'details-modal full-modal'
        });
        await modal.present();
        await this.alertCtrl.dismiss();
      }
    } catch (error) {
      console.error('Error loading registration details:', error);
      alert('Error al cargar los detalles de la inscripción');
    }
  }

  private async getRegistrationById(registrationPrm: any) {
    try {
      const { data, error } = await this.supabase
        .from('registration')
        .select(`
          *,
          child:children(id, full_name, birth_date, gender, ciclo, avatar_url, address, schedule_id),
          profile:user_profiles(id, full_name)
        `)
        .eq('id', registrationPrm.id)
        .maybeSingle();

      console.log('Error fetching registration:', error);
      if (error) throw error;
      if (!data) return null;

      const registration = data as any;
      console.log('Base registration data:', registration);

      // Cargar relaciones adicionales
      const [legalParentsResult, authorizedResult, medicalResult, termsResult] = await Promise.all([
        this.getLegalParentsByChild(registration.children_id),
        this.getAuthorizedPersonsByChild(registration.children_id),
        this.getMedicalInfoByRegistration(registration.children_id),
        this.getTermsByRegistration(registration.id)
      ]);

      return {
        ...registration,
        legal_parents: legalParentsResult,
        authorized_persons: authorizedResult,
        medical_info: medicalResult,
        terms: termsResult
      };
    } catch (error) {
      console.error('Error fetching registration details:', error);
      return null;
    }
  }

  private async getLegalParentsByChild(childId: string) {
    const { data, error } = await this.supabase
      .from('children_legal_parents')
      .select(`
        id,
        relationship,
        is_primary,
        legal_parent:legal_parents(id, full_name, phone_number)
      `)
      .eq('children_id', childId);

    if (error) {
      console.error('Error fetching legal parents:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.legal_parent.id,
      full_name: item.legal_parent.full_name,
      phone_number: item.legal_parent.phone_number,
      relationship: item.relationship,
      is_primary: item.is_primary
    }));
  }

  private async getAuthorizedPersonsByChild(childId: string) {
    const { data, error } = await this.supabase
      .from('authorized_pickup')
      .select('*')
      .eq('children_id', childId);

    if (error) {
      console.error('Error fetching authorized persons:', error);
      return [];
    }

    return data || [];
  }


  private async getMedicalInfoByRegistration(registrationId: string) {
    const { data, error } = await this.supabase
      .from('medical_info')
      .select('*')
      .eq('child_id', registrationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching medical info:', error);
      return null;
    }

    return data;
  }

  private async getTermsByRegistration(registrationId: string) {
    const { data, error } = await this.supabase
      .from('terms_condition')
      .select('*')
      .eq('registration_id', registrationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching terms:', error);
      return null;
    }

    return data;
  }

  editChild(child: Child): void {
    console.log('Editar:', child);
    // Implementar navegación o modal
  }

  async deleteChild(child: Child): Promise<void> {
    if (!confirm(`¿Está seguro de eliminar a ${child?.full_name}?`)) {
      return;
    }

    try {
      const { error } = await this.supabase
        .from('children')
        .delete()
        .eq('id', child.id);

      if (error) throw error;

      this.children = this.children.filter(c => c.id !== child.id);
      this.applyFilters();
    } catch (error) {
      console.error('Error deleting child:', error);
    }
  }

  async openActions(ev: Event, children: Child) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: `Acciones - ${children.full_name}`,
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Ver Detalles',
          icon: 'eye',
          cssClass: 'option-sheet-button',
          handler: () => {
            this.viewDetails(children);

          }
        },
        {
          text: 'Ver Documentos',
          icon: 'document-text',
          cssClass: 'option-sheet-button',
          handler: () => {
            this.router.navigate(['/daycare/documents', children.registration?.id]);
          }
        },
        {
          text: 'Editar Inscripción',
          icon: 'create',
          cssClass: 'option-sheet-button',
          handler: () => {
            // this.onEditRegistration(registration);
            this.router.navigate(['/daycare/inscription', children.registration?.id]);
          }
        },
        {
          text: 'Generar Cuota',
          icon: 'cash',
          cssClass: 'option-sheet-button',
          handler: () => {
            this.onGenerateFee(children);
          }
        },
        {
          text: 'Eliminar Niño/a',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'option-sheet-button',
          handler: () => {
            // this.onDelete(registration);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            // Acción de cancelar
          }
        }
      ]
    });

    if (children.registration?.status !== 'ACTIVE') {
      //remove the edit option
      this.alertCtrl.openFestivaAlert('warning', 'Acción no permitida', 'No se puede editar un niño/a con una inscripción inactiva.');
      return;
    }

    await actionSheet.present();
  }

  async onGenerateFee(value: any) {

    this.alertCtrl.openFestivaAlert('loading', 'Generando cuota mensual...', 'por favor, espere');
    console.log('Generating fee for registration:', value);
    const {data, error} = await this.supabaseService.getSupabase().functions.invoke('generate-monthly-quote-unique', {
      body: {
        child_id: value.id,
        registration_id: value.registration?.id,
        period_year: 2026,
        period_month: 1,
      }
    });

    if(error) {
      console.error('Error generating fee:', error);
      this.alertCtrl.openFestivaAlert('danger', 'Error', 'Ocurrió un error al generar la cuota mensual.');
      return;
    }

    await  this.alertCtrl.confirmation(()=> {
      this.alertCtrl.dismiss();
      this.router.navigate(['/daycare/payment-management']);
    }, "La cuota ha sido generada, desea ver el listado de pagos?", 'Cuota Generada', 'Si', ()=> {}, 'No');
  }
}
