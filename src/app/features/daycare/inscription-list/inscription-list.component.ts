import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActionSheetController, IonicModule } from '@ionic/angular';
import { SupabaseClient } from '@supabase/supabase-js';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { calculateAgeToString } from 'src/app/core/constants/constants';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
import { InscriptionDetailModalComponent } from 'src/app/shared/daycare/inscription-detail-modal/inscription-detail-modal.component';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';

interface RegistrationWithDetails {
  id: string;
  children_id: string;
  profile_id: string | null;
  start_date: string;
  status: string;
  created_at: string;
  child?: {
    id: string;
    full_name: string;
    birth_date: string;
    gender: string;
    ciclo: string | null;
    avatar_url: string | null;
  };
  profile?: {
    id: string;
    full_name: string;
  } | null;
}

@Component({
  selector: 'app-inscription-list',
  templateUrl: './inscription-list.component.html',
  styleUrls: ['./inscription-list.component.scss'],
  standalone: true,
  imports: [...StandAloneModules],
  providers: [ModalController]

})
export class InscriptionListComponent   {

  supabaseService = inject(SupabaseService);
  router = inject(Router);
  modalController = inject(ModalController);
  alertController = inject(AlertControllerService);
  actionSheerCtrl = inject(ActionSheetController);

  @Output() editRegistration = new EventEmitter<RegistrationWithDetails>();
  @Output() viewDetails = new EventEmitter<RegistrationWithDetails>();
  @Output() viewDocuments = new EventEmitter<RegistrationWithDetails>();
  @Output() deleteRegistration = new EventEmitter<RegistrationWithDetails>();

  registrations: RegistrationWithDetails[] = [];
  filteredRegistrations: RegistrationWithDetails[] = [];
  loading = true;
  searchTerm = '';
  statusFilter = 'ALL';
  dateFilterStart = '';
  dateFilterEnd = '';
  openMenuId: string | null = null;
  private supabase!: SupabaseClient;




  ionViewWillEnter() {
    this.initSupabase();
    this.loadRegistrations();
  }

  private initSupabase() {
    this.supabase = this.supabaseService.getSupabase();
  }

  async loadRegistrations() {
    try {
      this.loading = true;
      const { data, error } = await this.supabase
        .from('registration')
        .select(`
          *,
          child:children(id, full_name, birth_date, gender, ciclo, avatar_url),
          profile:user_profiles(id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.registrations = data as RegistrationWithDetails[];
      this.filteredRegistrations = [...this.registrations];
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      this.loading = false;
    }
  }

  filterRegistrations() {
    let filtered = [...this.registrations];

    if (this.searchTerm) {
      filtered = filtered.filter(reg =>
        reg.child?.full_name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(reg => reg.status === this.statusFilter);
    }

    if (this.dateFilterStart) {
      filtered = filtered.filter(reg => reg.start_date >= this.dateFilterStart);
    }

    if (this.dateFilterEnd) {
      filtered = filtered.filter(reg => reg.start_date <= this.dateFilterEnd);
    }

    this.filteredRegistrations = filtered;
  }

  onSearchChange() {
    this.filterRegistrations();
  }

  onStatusFilterChange() {
    this.filterRegistrations();
  }

  onDateFilterChange() {
    this.filterRegistrations();
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.dateFilterStart = '';
    this.dateFilterEnd = '';
    this.filteredRegistrations = [...this.registrations];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  calculateAge(birthDate: string): string {
    return calculateAgeToString(birthDate);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'INACTIVE':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'PENDING':
        return 'Pendiente';
      case 'INACTIVE':
        return 'Inactivo';
      default:
        return status;
    }
  }

  toggleMenu(registrationId: string, event: Event) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === registrationId ? null : registrationId;
  }

  async onEditRegistration(registration: RegistrationWithDetails) {
    console.log('Edit registration:', registration);
    this.router.navigate(['/daycare/inscription', registration.id]);
    this.openMenuId = null;
  }

  redirectToNewInscription() {
    this.openMenuId = null;
    this.router.navigate(['/daycare/inscription-new']);
  }

  async onViewDetails(registration: RegistrationWithDetails) {
    this.openMenuId = null;

    try {
      // Cargar detalles completos
      this.alertController.openFestivaAlert('loading', 'Cargando detalles de la inscripción...', 'por favor, espere');
      const fullDetails = await this.getRegistrationById(registration);
      if (fullDetails) {
        const modal = await this.modalController.create({
          component: InscriptionDetailModalComponent,
          componentProps: {
            registration: fullDetails
          },
          cssClass: 'details-modal full-modal'
        });
        await modal.present();
        await this.alertController.dismiss();
      }
    } catch (error) {
      console.error('Error loading registration details:', error);
      alert('Error al cargar los detalles de la inscripción');
    }
  }

  async openActions(ev: Event, registration: any) {
    const actionSheet = await this.actionSheerCtrl.create({
      header: 'Acciones',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Ver Detalles',
          icon: 'eye',
          cssClass: 'option-sheet-button',
          handler: () => {
            this.onViewDetails(registration);
          }
        },
        {
          text: 'Ver Documentos',
          icon: 'document-text',
          cssClass: 'option-sheet-button',
          handler: () => {
            this.onViewDocuments(registration);
          }
        },
        {
          text: 'Editar Inscripción',
          icon: 'create',
          cssClass: 'option-sheet-button',
          handler: () => {
            this.onEditRegistration(registration);
          }
        },
        {
          text: 'Eliminar Inscripción',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'option-sheet-button',
          handler: () => {
            this.onDelete(registration);
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

    if(registration?.status !== 'ACTIVE'){
      //remove the edit option
      actionSheet.buttons = actionSheet.buttons?.filter(
        button => button['text' as keyof typeof button] !== 'Editar Inscripción' && button['text' as keyof typeof button] !== 'Eliminar Inscripción'
      );
    }

    await actionSheet.present();
  }

  async onViewDocuments(registration: RegistrationWithDetails) {
    this.openMenuId = null;
    console.log('View documents:', registration);
    this.router.navigate(['/daycare/documents', registration.id]);
  }

  async onDelete(registration: RegistrationWithDetails) {
    this.openMenuId = null;

    const confirmed = window.confirm(`¿Está seguro de eliminar la inscripción de ${registration.child?.full_name}?`);
    if (!confirmed) return;

    try {
      const { error } = await this.supabase
        .from('registration')
        .delete()
        .eq('id', registration.id);

      if (error) throw error;

      this.deleteRegistration.emit(registration);
      await this.loadRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Error al eliminar la inscripción');
    }
  }

  getAvatarInitial(name?: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  private async getRegistrationById(registrationPrm: any): Promise<RegistrationWithDetails | null> {
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
}
