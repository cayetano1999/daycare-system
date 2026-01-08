import { Component, OnInit, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { EVENT_STATE, isAdminUser, scrollToElement } from 'src/app/core/constants/constants';
import { RoleAccessDirective } from 'src/app/shared/directives/role-access.directive';
import { Profile } from 'src/app/core/interface/profile.interface';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { Capacitor } from '@capacitor/core';
import { EventActionRestrictions } from 'src/app/shared/directives/event-restrictions.directive';
import { AppInBrowserService } from 'src/app/core/services/browser/app-in-browser.service';
import { remoteConfig } from 'src/environments/environment.remoteconfig';
import { environment } from 'src/environments/environment';

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
    try {
      this.router.navigate([url], { state: { event: this.event }, replaceUrl: true }).catch(async err => {
         const response = await this.alertCtrl.openFestivaAlert('warning', 'Opción no disponible', 'La opción seleccionada no está disponible en esta versión de la aplicación. Por favor, actualiza la aplicación para acceder a esta función.', true, 'Cancelar', 'Actualizar');
      if (response.action === 'confirm') {
        window.open(Capacitor.getPlatform() === 'ios' ? environment.URL_APP_IOS : environment.URL_APP_ANDROID, '_system');
        return;
      }
      });
    } catch (error) {
      console.error('Error navigating to option:', error);
    }
  }

   formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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

      await this.alertCtrl.openFestivaAlert('success', 'Evento eliminado', 'El evento ha sido eliminado exitosamente.');

    } catch (error: any) {
      console.error('Error deleting event:', error);
       await this.alertCtrl.openFestivaAlert('danger', 'Error', 'No se pudo eliminar el evento. Intenta nuevamente.');
      return;
    }
  }

  async previewEvent() {

    const { data, error } = await this.supabaseService.getRecord('event_ticket', ['*'], 'event_id', this.event.id || '');

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
    if (!url || url.length === 0) {
      this.alertCtrl.openFestivaAlert('warning', 'Sin URL de Ticket', 'El ticket asociado a este evento no tiene una URL válida. Por favor, edita el ticket para agregar una URL y poder previsualizar el evento.');
      return;
    }


    const newUrl = `${url.replace('invitacion.html', 'preview.html')}`
    const system = Capacitor.getPlatform();

    if (system === 'ios' && newUrl) {
      await this.browser.openUrl(newUrl);
      return;
    }

    // this.router.navigate([`events/preview/${this.event.id}`], { state: { event: this.event }, replaceUrl: true });
    window.open(newUrl, '_system');
    // Navigate to event preview screen
  }


  goBack() {
    this.router.navigate([RoutesApp.HOME]);
  }
}