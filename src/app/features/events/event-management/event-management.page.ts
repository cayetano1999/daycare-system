import { Component, OnInit, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { FestivaHeaderComponent } from 'src/app/shared/components/festiva-header/festiva-header.component';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { eventRoutes } from '../events.routes';
import { EVENT_STATE, isAdminUser, scrollToElement } from 'src/app/core/constants/constants';
import { RoleAccessDirective } from 'src/app/shared/directives/role-access.directive';
import { Profile } from 'src/app/core/interface/profile.interface';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { EventTicket } from '../event-ticket/event-ticket.page';
import { Capacitor } from '@capacitor/core';
import { EventActionRestrictions } from 'src/app/shared/directives/event-restrictions.directive';
import { AppInBrowserService } from 'src/app/core/services/browser/app-in-browser.service';
import { remoteConfig } from 'src/environments/environment.remoteconfig';

interface ManagementOption {
  id: string;
  title: string;
  description: string;
  iconPath: string;
  color: string;
  bgColor: string;
  textColor: string;
  action: () => void;
  url: string;
  isEnabled?: boolean;
}

@Component({
  selector: 'app-event-management',
  templateUrl: './event-management.page.html',
  styleUrls: ['./event-management.page.scss'],
  imports: [...StandAloneModules, RoleAccessDirective, EventActionRestrictions]
})
export class EventManagementPage implements OnInit {
  @Input() event!: FestivaEvent;

  showMoreOptions = false;
  showDeleteConfirm = false;
  eventRole = EVENT_STATE.eventRole;
  isIos = Capacitor.getPlatform() === 'ios';

  managementOptions: ManagementOption[] = remoteConfig.EVENT_OPTIONS;
  user!: Profile;

  private alertController = inject(AlertController);
  private navController = inject(NavController);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private alertCtrl = inject(AlertControllerService);
  private storageHelper = inject(StorageHelper);
  private readonly browser = inject(AppInBrowserService);

  constructor(

  ) {

    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.event = state.event;
    if (state?.managementOptionSelected?.length) {
      EVENT_STATE.managementOptionSelected = state.managementOptionSelected;
    }
  }

  ngOnInit() {
    // Initialize component
  }

  async ionViewWillEnter() {
    // Reset the selected management option when entering the view
    // EVENT_STATE.managementOptionSelected = '';
    this.user = await this.storageHelper.getStorageKey<Profile>(StorageKeys.USER_DATA) as Profile;
    this.eventRole = EVENT_STATE.eventRole;
    this.managementOptions.find(opt => opt.id === 'ticket')!.isEnabled = (isAdminUser(this.user.id));



    if (EVENT_STATE.managementOptionSelected.length) {
      scrollToElement(EVENT_STATE.managementOptionSelected);
    }

  }

  ionViewWillLeave() {
    // Reset the selected management option when leaving the view
    if (!this.router.url.includes('events/'))
      EVENT_STATE.managementOptionSelected = '';
  }

  async navigateToOption(url: string) {
    const optionId = this.managementOptions.find(option => option.url === url)?.id;
    if (optionId) {
      EVENT_STATE.managementOptionSelected = optionId;
    }
    this.router.navigate([url], { state: { event: this.event }, replaceUrl: true });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPlanColor(planType: string): string {
    switch (planType) {
      case 'Starter':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Essential':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Premium':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Elite':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'DRAFT':
        return 'Borrador';
      case 'COMPLETED':
        return 'Completado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }

  toggleMoreOptions() {
    this.showMoreOptions = !this.showMoreOptions;
    if (this.showMoreOptions) {
      scrollToElement('more-event-options');
    }
  }

  closeMoreOptions() {
    this.showMoreOptions = false;
  }

  editEvent() {
    this.showMoreOptions = false;
    this.router.navigate([RoutesApp.CREATE_EVENT], { state: { event: this.event }, replaceUrl: true });
    // Navigate to edit event screen
  }

  async confirmDelete() {
    this.showMoreOptions = false;
    const result = await this.alertCtrl.openFestivaAlert('danger', 'Confirmar eliminación', '¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.', true, 'Cancelar', 'Eliminar');
    if (result.action === 'confirm') {
      this.deleteEvent();
    }
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }

  async deleteEvent() {
    this.showDeleteConfirm = false;

    try {
      // Delete event from Supabase
      const { error } = await this.supabaseService.deleteRecord('events', this.event.id || '');

      if (error) {
        throw error;
      }

      // Show success message
      const alerts = await this.alertController.create({
        header: 'Evento eliminado',
        message: 'El evento ha sido eliminado exitosamente.',
        buttons: [{
          text: 'OK',
          handler: () => {
            this.goBack();
          }
        }]
      });
      await alerts.present();

    } catch (error: any) {
      console.error('Error deleting event:', error);

      const alerts = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo eliminar el evento. Intenta nuevamente.',
        buttons: ['OK']
      });
      await alerts.present();
    }
  }

  async previewEvent() {

    const {data, error} = await this.supabaseService.getRecord('event_ticket', ['*'], 'event_id', this.event.id || '');

    if (error) {
      console.error('Error fetching tickets:', error);
      this.alertCtrl.openFestivaAlert('danger', 'Error', 'No se pudo obtener la información de los tickets. Intenta nuevamente.');
      return;
    }

    if (!data || data.length === 0) {
      this.alertCtrl.openFestivaAlert('warning', 'Sin Tickets', 'Este evento no tiene tickets asociados. Por favor, crea al menos un ticket para poder previsualizar el evento.');
      return;
    }

    const result = data as any;
    const url = result.url as string;
    if(!url || url.length === 0) {
      this.alertCtrl.openFestivaAlert('warning', 'Sin URL de Ticket', 'El ticket asociado a este evento no tiene una URL válida. Por favor, edita el ticket para agregar una URL y poder previsualizar el evento.');
      return;
    }


    const newUrl = `${url.replace('invitacion.html', 'preview.html')}`
    const system = Capacitor.getPlatform();

    if(system === 'ios' && newUrl) {
      await this.browser.openUrl(newUrl);
      return;
    }

    // this.router.navigate([`events/preview/${this.event.id}`], { state: { event: this.event }, replaceUrl: true });
    window.open(newUrl, '_system');
    // Navigate to event preview screen
  }

  // Navigation methods for management options
  navigateToExpenses() {
    // this.navController.navigateForward('/event-expenses');
    this.router.navigate([RoutesApp.EVENT_EXPENSES], { state: { event: this.event }, replaceUrl: true });
  }

  navigateToAdmins() {
    // this.navController.navigateForward('/event-admins');
    this.router.navigate([RoutesApp.EVENT_MEMBERS], { state: { event: this.event }, replaceUrl: true });
  }

  navigateToTickets() {
    // this.navController.navigateForward('/event-tickets');
    this.router.navigate([RoutesApp.EVENT_TICKETS], { state: { event: this.event }, replaceUrl: true });
  }

  navigateToGifts() {
    // this.navController.navigateForward('/gift-list');
    this.router.navigate([RoutesApp.EVENT_GIFT_LIST], { state: { event: this.event }, replaceUrl: true });
  }

  navigateToGroups() {
    // this.navController.navigateForward('/event-groups');
    this.router.navigate([RoutesApp.GROUPS], { state: { event: this.event }, replaceUrl: true });
  }

  navigateToGuests() {
    // this.navController.navigateForward('/event-guests');
    this.router.navigate([RoutesApp.EVENT_GUESTS], { state: { event: this.event }, replaceUrl: true });
  }

  navigateToTables() {
    this.router.navigate([RoutesApp.EVENT_TABLES], { state: { event: this.event }, replaceUrl: true });
  }
  navigateToScanner() {
    this.router.navigate([RoutesApp.EVENT_SCANNER], { state: { event: this.event }, replaceUrl: true });
  }

  goBack() {
    this.router.navigate([RoutesApp.HOME]);
  }
}