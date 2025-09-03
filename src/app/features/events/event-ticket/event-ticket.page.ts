import { Component, inject, OnInit } from '@angular/core';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { CreateTicketModalComponent } from './components/create-ticket-modal/create-ticket-modal.component';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { Router } from '@angular/router';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import * as qr from 'qrcode';
import { RoleAccessDirective } from 'src/app/shared/directives/role-access.directive';

interface EventTicket {
  id: string;
  created_at: string;
  event_id: string;
  qr_code: string;
  ticket_type: string;
  url: string;
  gift_list_id?: string;
  name: string;
}

interface GiftList {
  id: string;
  name: string;
}

@Component({
  selector: 'app-event-ticket',
  templateUrl: './event-ticket.page.html',
  styleUrls: ['./event-ticket.page.scss'],
  imports: [...StandAloneModules, RoleAccessDirective]
})
export class EventTicketsPage {
  ticket: EventTicket | null = null;

  isLoading: boolean = true;
  showDeleteConfirm: boolean = false;
  showSuccessAnimation: boolean = false;
  showCreatedAnimation: boolean = false;
  event: FestivaEvent | null = null;
  qrCode: string = '';
  private alertController = inject(AlertController);
  private navController = inject(NavController);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private modalController = inject(ModalController);


  constructor(

  ) {

    // const navigation = this.router.getCurrentNavigation();
    // if (navigation && navigation.extras && navigation.extras.state) {
    //   const event = navigation.extras.state['event'];
    //   this.event = event;
    // }
  }


  async ionViewWillEnter() {

    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.event = state.event;
    await this.loadTicket();

    await this.generateQRCode();
  }

  async generateQRCode() {
    // Generate QR code content: eventId + ticketId (or random for new tickets)
    const ticketId = this.ticket?.id || '';
    this.qrCode = await qr.toDataURL(`${this.event?.id || ''}-${ticketId}`);

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

  async openCreateTicketModal() {
    // Load gift lists for the event
    const { data: giftLists } = await this.supabaseService.getRecords<GiftList>(
      'gift_list',
      ['id', 'name'],
      'event_id',
      this.event?.id || '',
      'created_at'
    );

    const modal = await this.modalController.create({
      component: CreateTicketModalComponent,
      componentProps: {
        mode: 'create',
        eventId: this.event?.id || '',
        giftLists: giftLists || [],
        event: this.event

      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.success) {
        this.showSuccessAnimation = true;
        setTimeout(() => {
          this.showSuccessAnimation = false;
          this.showCreatedAnimation = true;
          this.loadTicket();
          setTimeout(() => {
            this.showCreatedAnimation = false;
          }, 1000);
        }, 2000);
      }
    });

    return await modal.present();
  }

  async openEditTicketModal() {
    if (!this.ticket) return;

    // Load gift lists for the event
    const { data: giftLists } = await this.supabaseService.getRecords<GiftList>(
      'gift_list',
      ['id', 'name'],
      'event_id',
      this.event?.id || '',
      'created_at'
    );
    const modal = await this.modalController.create({
      component: CreateTicketModalComponent,
      componentProps: {
        mode: 'edit',
        eventId: this.event?.id || '',
        ticket: this.ticket,
        giftLists: giftLists || [],
        event: this.event
      }
    });
    modal.onDidDismiss().then((result) => {
      if (result.data?.success) {
        this.loadTicket();
        this.showToast('Ticket actualizado exitosamente', 'success');
      }
    });

    return await modal.present();
  }

  confirmDelete() {
    this.showDeleteConfirm = true;
  }

  async handleDelete() {
    if (!this.ticket) return;

    try {
      const { error } = await this.supabaseService.deleteRecord('event_ticket', this.ticket.id);

      if (error) {
        console.error('Error deleting ticket:', error);
        this.showToast('Error al eliminar el ticket', 'error');
        return;
      }

      this.showToast('Ticket eliminado exitosamente', 'success');
      this.ticket = null;

    } catch (error) {
      console.error('Error deleting ticket:', error);
      this.showToast('Error al eliminar el ticket', 'error');
    } finally {
      this.showDeleteConfirm = false;
    }
  }

  shareTicket() {
    if (!this.ticket) return;

    // TODO: Implement share functionality
    console.log('Sharing ticket:', this.ticket.url);
    this.showToast('Función de compartir en desarrollo', 'warning');
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

  goBack() {
    // TODO: Implement navigation back
    this.router.navigate(['/events/management'], { state: { event: this.event }, replaceUrl: true });

  }

  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    // TODO: Implement toast notification
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  ionViewWillLeave() {
    // TODO: Implement any cleanup or save state logic
    console.log('Leaving event ticket page');
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras) {
      navigation.extras.state = {};
    }
  }
}