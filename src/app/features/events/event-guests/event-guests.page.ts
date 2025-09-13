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
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { RoleAccessDirective } from 'src/app/shared/directives/role-access.directive';
import { Share } from '@capacitor/share';
import { EventTicket } from '../event-ticket/event-ticket.page';
import { SegmentSelectorComponent } from './components/segment-selector/segment-selector.component';
import { Capacitor } from '@capacitor/core';
import { ImportGuestsModalComponent } from './components/import-guests-modal/import-guests-modal.component';

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
  request_status: 'PENDING' | 'VIEWED' | 'CONFIRMED' | 'REJECTED' | 'SENT';
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
  imports: [...StandAloneModules, RoleAccessDirective, SegmentSelectorComponent]
})
export class EventGuestsPage implements OnInit {
  guests: Guest[] = [];
  filteredGuests: Guest[] = [];
  groups: Group[] = [];
  tables: Table[] = [];
  segments = [
    { label: '📋 Todos' },
    { label: '✅ Confirmados' },
    { label: '👁️ Vistas' },
    { label: '✉️ Sin enviar' },
    { label: '📤 Enviadas' }
  ]

  eventId: string = ''; // TODO: Get from route params
  eventName: string = 'de María y José'; // TODO: Get from event data
  isLoading: boolean = true;

  // Filters
  searchName: string = '';
  selectedGroupId: string = '';
  selectedTableId: string = '';
  showFilterSection: boolean = false;

  // Delete confirmation
  showDeleteConfirm: boolean = false;
  guestToDelete: string | null = null;
  event: FestivaEvent | null = null;
  user: Profile | null = null;
  ticket: EventTicket | null = null;
  segmentSelected: string = '📋 Todos';
  isIos = Capacitor.getPlatform() === 'ios';

  private readonly router = inject(Router);
  private storageHelper = inject(StorageHelper);
  private navCtrl = inject(NavController);
  private alertController = inject(AlertControllerService);


  constructor(
    private supabaseService: SupabaseService,
    private modalController: ModalController
  ) {

  }

  ngOnInit() {
    // this.loadData();
  }

  changeToogle() {
    this.showFilterSection = !this.showFilterSection;
  }

  onSegmentChanged(event: any) {
    this.segmentSelected = event;
    console.log('Segment changed to', event);
    switch (event) {
      case '📋 Todos':
        this.filteredGuests = this.guests;
        break;
      case '✅ Confirmados':
        this.filteredGuests = this.guests.filter(guest => guest.request_status === 'CONFIRMED');
        break;
      case '👁️ Vistas':
        this.filteredGuests = this.guests.filter(guest => guest.request_status === 'VIEWED');
        break;
      case '✉️ Sin enviar':
        this.filteredGuests = this.guests.filter(guest => guest.request_status === 'PENDING');
        break;
      case '📤 Enviadas':
        this.filteredGuests = this.guests.filter(guest => guest.request_status === 'SENT');
        break;
      default:
        this.filteredGuests = this.guests;
        break;
    }
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
        this.loadTicket(),
        this.loadGuests(),
        this.loadGroups(),
        this.loadTables(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      this.showToast('Error al cargar los datos', 'error');
    } finally {
      this.isLoading = false;
    }
  }

    async loadTicket() {
    this.isLoading = true;

    try {
      const { data, error } = await this.supabaseService.getRecord(
        'event_ticket',
        ['*'],
        'event_id',
        this.event?.id || ''
      ) as any;

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading ticket:', error);
        this.showToast('Error al cargar el ticket', 'error');
        return;
      }

      this.ticket = data || null;

    } catch (error) {
      console.error('Error loading ticket:', error);
      this.showToast('Error al cargar el ticket', 'error');
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
      })).sort((a, b) => a.name.localeCompare(b.name)); //

      //ordenar los invitados por nombre de la A a la Z

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
        'event_id',
        this.event?.id || '', // TODO: Get current user ID
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
     
    // Filter by table
    if (this.selectedTableId) {
      filtered = filtered.filter(guest => guest.table_id === this.selectedTableId);
    }

    this.filteredGuests = filtered;
  }

  clearFilters() {
    this.searchName = '';
    this.selectedGroupId = '';
    this.selectedTableId = '';
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
      guest.request_status === 'CONFIRMED'
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
      case 'CONFIRMED':
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
        return '⏳ Sin enviar';
      case 'VIEWED':
        return '👀 Visto';
      case 'CONFIRMED':
        return '✅ Confirmado';
      case 'REJECTED':
        return '❌ Rechazado';
      case 'SENT':
        return '📨 Enviado';
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
        this.loadTicket();
        this.loadGroups();
        this.loadTables();
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
        tables: this.tables,
        event: this.event
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
  async exportGuests() {

    if(this.guests.length === 0 || this.filteredGuests.length === 0) {
      await this.alertController.openFestivaAlert('warning', 'No hay invitados para exportar', 'Agrega invitados para poder exportar la lista.', true, 'Cerrar');
      return;
    }

    await this.alertController.openModalAlert();
    const { data, error } = await this.supabaseService.getSupabase().functions.invoke('export-guest-list', {
      body: { items: this.filteredGuests, eventName: this.event?.name, fileName: `${this.event?.id}.pdf` },
    } as any);
    await this.alertController.dismiss();
    if (error) {
      console.error('Error al generar PDF:', error);
    }
    const url = data?.url as string;
    if (url) window.open(url, '_system');
    return url;
  }

  async importGuests() {

    const modal = await this.modalController.create({
      component: ImportGuestsModalComponent,
      id: 'import-guests-modal',
      componentProps: {
        event: this.event,
        user: this.user,
        groups: this.groups,
        tables: this.tables
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    await this.alertController.openModalAlert();
    await this.loadGuests();
    this.alertController.dismiss();
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

  async sendInvitation(guest: Guest) {
    const eventDetails = [
      `🏳️ Evento: ${this.event?.name}`,
      `🗓️ Fecha: ${this.event?.event_date ? this.formatEventDate(this.event.event_date) : 'Por definir'}`,
      `📍 Lugar: ${this.event?.location}`
    ].filter(Boolean).join('\n\n');

    const result = await Share.share({
      title: `${this.ticket?.url}${guest.id}`,
      text: ` ${this.ticket?.url}${guest.id} \n\n\n ${guest.name.toUpperCase()},  \n\n ${this.event?.share_text}\n\n • Detalles del Evento: \n\n${eventDetails}`,
      dialogTitle: this.event?.name
    });

    if ((result.activityType || result.activityType === undefined) && guest.request_status !== 'CONFIRMED') {
      // Successfully shared
      await this.supabaseService.updateRecord('guests', guest.id, { request_status: 'SENT' });
      this.showToast('Invitación enviada exitosamente', 'success');
      guest.request_status = 'SENT';
      // await this.loadGuests();
    }
  }

  formatEventDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


}