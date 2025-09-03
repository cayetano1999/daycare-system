import { Component, inject, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { AddGuestModalComponent } from './components/add-guests-modal/add-guests-modal.component';
import { Router } from '@angular/router';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { Profile } from 'src/app/core/interface/profile.interface';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';

export interface Guest {
  id: string;
  created_at: string;
  event_id: string;
  invited_by: string;
  group_id?: string;
  companions_number?: number;
  name: string;
  phone_number?: string;
  status: string;
  added_from_contact: boolean;
  table_id?: string;
  request_status: 'PENDING' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'SENT';
  group?: {
    id: string;
    name: string;
    color_exa: string;
  };
  table?: {
    id: string;
    name: string;
  };
  invited_by_user?: {
    id: string;
    full_name: string;
  };
  observation: string;
}

interface Group {
  id: string;
  name: string;
  color_exa: string;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
}

@Component({
  selector: 'app-event-guests',
  templateUrl: './event-guests.page.html',
  styleUrls: ['./event-guests.page.scss'],
  imports: [...StandAloneModules]
})
export class EventGuestsPage implements OnInit {
  guests: Guest[] = [];
  filteredGuests: Guest[] = [];
  groups: Group[] = [];
  tables: Table[] = [];

  eventId: string = ''; // TODO: Get from route params
  eventName: string = 'de María y José'; // TODO: Get from event data
  isLoading: boolean = true;

  // Filters
  searchName: string = '';
  selectedGroupId: string = '';

  // Delete confirmation
  showDeleteConfirm: boolean = false;
  guestToDelete: string | null = null;
  event: FestivaEvent | null = null;
  user: Profile | null = null;

  private readonly router = inject(Router);
  private storageHelper = inject(StorageHelper);
  private navCtrl = inject(NavController);


  constructor(
    private supabaseService: SupabaseService,
    private modalController: ModalController
  ) {

  }

  ngOnInit() {
    // this.loadData();
  }

  async ionViewWillEnter() {
    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.event = state.event;

    if (this.event) {
      this.eventId = this.event.id || '';
    }
    this.user = await this.storageHelper.getStorageKey(StorageKeys.USER_DATA);
    await this.loadData();
  }

  async loadData() {
    this.isLoading = true;

    try {
      // Load all data in parallel
      await Promise.all([
        this.loadGuests(),
        this.loadGroups(),
        this.loadTables()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      this.showToast('Error al cargar los datos', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async loadGuests() {
    try {
      const { data, error } = await this.supabaseService.getRecords<Guest>(
        'guests',
        [
          '*',
          'groups(id, name, color_exa)',
          'event_tables(id, name)',
          'user_profiles(id, full_name)'
        ],
        'event_id',
        this.eventId,
        'created_at'
      );

      if (error) {
        console.error('Error loading guests:', error);
        this.showToast('Error al cargar los invitados', 'error');
        return;
      }

      // Transform data to match our interface
      this.guests = (data || []).map((guest: any) => ({
        ...guest,
        group: guest.groups,
        table: guest.event_tables,
        invited_by_user: guest.user_profiles
      }));

      this.filterGuests();

    } catch (error) {
      console.error('Error loading guests:', error);
      this.showToast('Error al cargar los invitados', 'error');
    }
  }

  async loadGroups() {
    try {
      const { data, error } = await this.supabaseService.getRecords<Group>(
        'groups',
        ['*'],
        'user_id',
        this.user?.id || '', // TODO: Get current user ID
        'created_at'
      );

      if (error) {
        console.error('Error loading groups:', error);
        return;
      }

      this.groups = data as any[] || [];

    } catch (error) {
      console.error('Error loading groups:', error);
    }
  }

  async loadTables() {
    try {
      const { data, error } = await this.supabaseService.getRecords<Table>(
        'event_tables',
        ['*'],
        'event_id',
        this.eventId,
        'created_at'
      );

      if (error) {
        console.error('Error loading tables:', error);
        return;
      }

      this.tables = data as any[] || [];

    } catch (error) {
      console.error('Error loading tables:', error);
    }
  }

  filterGuests() {
    let filtered = [...this.guests];

    // Filter by name
    if (this.searchName.trim()) {
      const searchTerm = this.searchName.toLowerCase().trim();
      filtered = filtered.filter(guest =>
        guest.name.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by group
    if (this.selectedGroupId) {
      filtered = filtered.filter(guest => guest.group_id === this.selectedGroupId);
    }

    this.filteredGuests = filtered;
  }

  clearFilters() {
    this.searchName = '';
    this.selectedGroupId = '';
    this.filterGuests();
  }

  // Stats calculations
  getTotalGuests(): number {
    return this.filteredGuests.length;
  }

  getTotalCompanions(): number {
    return this.filteredGuests.reduce((total, guest) =>
      total + (guest.companions_number || 0), 0
    );
  }

  getAcceptedGuests(): number {
    return this.filteredGuests.filter(guest =>
      guest.request_status === 'ACCEPTED'
    ).length;
  }

  getSentInvitations(): number {
    return this.filteredGuests.filter(guest =>
      guest.request_status === 'SENT'
    ).length;
  }

  // Status helpers
  getStatusClasses(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'VIEWED':
        return 'bg-blue-100 text-blue-700';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'SENT':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'VIEWED':
        return 'Visto';
      case 'ACCEPTED':
        return 'Aceptado';
      case 'REJECTED':
        return 'Rechazado';
      case 'SENT':
        return 'Enviado';
      default:
        return 'Desconocido';
    }
  }

  // Modal actions
  async openAddGuestModal() {
    const modal = await this.modalController.create({
      component: AddGuestModalComponent,
      componentProps: {
        mode: 'create',
        groups: this.groups,
        tables: this.tables,
        user: this.user,
        event: this.event
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.success) {
        this.loadGuests();
        this.showToast('Invitado agregado exitosamente', 'success');
      }
    });

    return await modal.present();
  }

  async openEditGuestModal(guest: Guest) {
    const modal = await this.modalController.create({
      component: AddGuestModalComponent,
      componentProps: {
        mode: 'edit',
        eventId: this.eventId,
        guest: guest,
        groups: this.groups,
        tables: this.tables
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.success) {
        this.loadGuests();
        this.showToast('Invitado actualizado exitosamente', 'success');
      }
    });

    return await modal.present();
  }

  // Delete actions
  confirmDelete(guestId: string) {
    this.guestToDelete = guestId;
    this.showDeleteConfirm = true;
  }

  async handleDelete() {
    if (!this.guestToDelete) return;

    try {
      const { error } = await this.supabaseService.deleteRecord('guests', this.guestToDelete);

      if (error) {
        console.error('Error deleting guest:', error);
        this.showToast('Error al eliminar el invitado', 'error');
        return;
      }

      this.showToast('Invitado eliminado exitosamente', 'success');
      this.loadGuests();

    } catch (error) {
      console.error('Error deleting guest:', error);
      this.showToast('Error al eliminar el invitado', 'error');
    } finally {
      this.showDeleteConfirm = false;
      this.guestToDelete = null;
    }
  }

  // Export action
  exportGuests() {
    console.log('Export guests functionality - to be implemented');
    this.showToast('Función de exportar en desarrollo', 'warning');
  }

  // Navigation
  goBack() {
    // TODO: Implement navigation back
    this.router.navigate(['/events/management'], { state: { event: this.event }, replaceUrl: true });

  }

  // Toast helper
  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    // TODO: Implement toast notification
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  shareGuest(guest: Guest) {
    // TODO: Implement share guest functionality
    console.log('Share guest:', guest);
  }

  sendReminder(guest: Guest) {
    // TODO: Implement send reminder functionality
    console.log('Send reminder to guest:', guest);
  }


}