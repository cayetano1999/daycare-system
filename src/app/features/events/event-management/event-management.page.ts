import { Component, OnInit, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { FestivaHeaderComponent } from 'src/app/shared/components/festiva-header/festiva-header.component';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

interface ManagementOption {
  id: string;
  title: string;
  description: string;
  iconPath: string;
  color: string;
  bgColor: string;
  textColor: string;
  action: () => void;
}

@Component({
  selector: 'app-event-management',
  templateUrl: './event-management.page.html',
  styleUrls: ['./event-management.page.scss'],
  imports: [...StandAloneModules, FestivaHeaderComponent]
})
export class EventManagementPage implements OnInit {
  @Input() event!: FestivaEvent;

  showMoreOptions = false;
  showDeleteConfirm = false;

  managementOptions: ManagementOption[] = [
    {
      id: 'expenses',
      title: 'Gastos del Evento',
      description: 'Administra presupuesto y gastos',
      iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      action: () => this.navigateToExpenses()
    },
    {
      id: 'admins',
      title: 'Administradores',
      description: 'Gestiona quién puede administrar',
      iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      action: () => this.navigateToAdmins()
    },
    {
      id: 'Ticket',
      title: 'Ticket del Evento',
      description: 'Detalle de tu Invitación, boleta o entrada',
      iconPath: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      action: () => this.navigateToTickets()
    },
    {
      id: 'gifts',
      title: 'Lista de Regalos',
      description: 'Administra regalos y deseos',
      iconPath: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700',
      action: () => this.navigateToGifts()
    },
    {
      id: 'groups',
      title: 'Grupos',
      description: 'Organiza invitados en grupos',
      iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      action: () => this.navigateToGroups()
    },
    {
      id: 'guests',
      title: 'Invitados',
      description: 'Gestiona lista de invitados',
      iconPath: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      action: () => this.navigateToGuests()
    },
    {
      id: 'table',
      title: 'Mesas',
      description: 'Gestiona la asignación de mesas',
      iconPath: 'M3 9h18v3H3z M7 12v7 M17 12v7',
      color: 'from-black to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      action: () => this.navigateToTables()
    },
    {
      id: 'scanner',
      title: 'Escáner de Código',
      description: 'Escanea códigos QR y de barras',
      iconPath: 'M4 7V5a2 2 0 012-2h2M16 3h2a2 2 0 012 2v2M20 17v2a2 2 0 01-2 2h-2M8 21H6a2 2 0 01-2-2v-2M7 12h10',
      color: 'from-violet-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      action: () => this.navigateToScanner()
    }
  ];

  private alertController = inject(AlertController);
  private navController = inject(NavController);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private alertCtrl = inject(AlertControllerService);

  constructor(

  ) {

   const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.event = state.event;
  }

  ngOnInit() {
    // Initialize component
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
  }

  closeMoreOptions() {
    this.showMoreOptions = false;
  }

  editEvent() {
    this.showMoreOptions = false;
    console.log('Navigate to edit event');
    this.router.navigate([RoutesApp.CREATE_EVENT], { state: { event: this.event } });
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

  previewEvent() {
    console.log('Navigate to event preview');
    // Navigate to event preview screen
  }

  // Navigation methods for management options
  navigateToExpenses() {
    console.log('Navigate to expenses management');
    // this.navController.navigateForward('/event-expenses');
    this.router.navigate([RoutesApp.EVENT_EXPENSES], { state: { event: this.event }, replaceUrl: true });
  }

  navigateToAdmins() {
    console.log('Navigate to admins management');
    // this.navController.navigateForward('/event-admins');
    this.router.navigate([RoutesApp.EVENT_MEMBERS], { state: { event: this.event }, replaceUrl: true });
  }

  navigateToTickets() {
    console.log('Navigate to tickets management');
    // this.navController.navigateForward('/event-tickets');
    this.router.navigate([RoutesApp.EVENT_TICKETS], { state: { event: this.event }, replaceUrl: true });
  }

  navigateToGifts() {
    console.log('Navigate to gifts management');
    // this.navController.navigateForward('/gift-list');
    this.router.navigate([RoutesApp.EVENT_GIFT_LIST], { state: { event: this.event }, replaceUrl: true });
  }

  navigateToGroups() {
    console.log('Navigate to groups management');
    // this.navController.navigateForward('/event-groups');
    this.router.navigate([RoutesApp.GROUPS], { state: { event: this.event }, replaceUrl: true });
  }

  navigateToGuests() {
    console.log('Navigate to guests management');
    // this.navController.navigateForward('/event-guests');
    this.router.navigate([RoutesApp.EVENT_GUESTS], { state: { event: this.event }, replaceUrl: true });
  }

  navigateToTables() {
    console.log('Navigate to tables management');
    this.router.navigate([RoutesApp.EVENT_TABLES], { state: { event: this.event }, replaceUrl: true });
  }
  navigateToScanner() {
    console.log('Navigate to scanner');
    this.router.navigate([RoutesApp.EVENT_SCANNER], { state: { event: this.event }, replaceUrl: true });
  }

  goBack() {
    this.navController.back();
  }
}