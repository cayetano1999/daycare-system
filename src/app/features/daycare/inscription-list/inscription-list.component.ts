import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SupabaseClient } from '@supabase/supabase-js';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { calculateAgeToString } from 'src/app/core/constants/constants';
import { Router } from '@angular/router';

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
  imports: [...StandAloneModules]
})
export class InscriptionListComponent implements OnInit {

  supabaseService = inject(SupabaseService);
  router = inject(Router);

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


  ngOnInit() {
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
  }

  redirectToNewInscription() {
    this.router.navigate(['/daycare/inscription-new']);
  }

  onViewDetails(registration: RegistrationWithDetails) {
    this.viewDetails.emit(registration);
    this.openMenuId = null;
  }

  onViewDocuments(registration: RegistrationWithDetails) {
    this.viewDocuments.emit(registration);
    this.openMenuId = null;
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
}
