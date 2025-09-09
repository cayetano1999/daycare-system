import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { NavController } from '@ionic/angular';
import { EVENT_STATE } from 'src/app/core/constants/constants';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { Profile } from 'src/app/core/interface/profile.interface';
import { DeviceService } from 'src/app/core/services/device/device.service';
import { FirebaseMessagingService } from 'src/app/core/services/firebase/firebase-messaging.service';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { FestivaHeaderComponent } from 'src/app/shared/components/festiva-header/festiva-header.component';
import { AdminAppDirective } from 'src/app/shared/directives/admin-app.directive';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { remoteConfig } from 'src/environments/environment.remoteconfig';

// interface Event {
//   id: string;
//   name: string;
//   description: string;
//   event_date: string;
//   status: 'ACTIVE' | 'DRAFT' | 'COMPLETED' | 'CANCELLED';
//   plan_type: 'Starter' | 'Essential' | 'Premium' | 'Elite';
//   image: string;
// }

export interface ExampleInvitation {
  id: string;
  name: string;
  image: string;
  type: string;
}

interface Notification {
  id: string;
  type: 'accepted' | 'rejected' | 'forwarded';
  guestName: string;
  eventName: string;
  timestamp: string;
  read: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [...StandAloneModules, FestivaHeaderComponent, AdminAppDirective],
})
export class DashboardPage implements OnDestroy {
  activeTab = 'home';
  searchQuery = '';
  showNotifications = false;
  isScrolled = false;

  private scrollListener: any;

  // Mock user data
  user!: Profile;

  // Mock events data
  events: FestivaEvent[] = [
  ];

  eventsToManage: FestivaEvent[] = [];

  // Mock example invitations
  exampleInvitations: ExampleInvitation[] = remoteConfig.TICKET_TEMPLATES;

  // Mock notifications data
  notifications: Notification[] = [
    {
      id: '1',
      type: 'accepted',
      guestName: 'Ana García',
      eventName: 'Boda de María y José',
      timestamp: '2024-01-15T10:30:00',
      read: false
    },
    {
      id: '2',
      type: 'rejected',
      guestName: 'Carlos Mendoza',
      eventName: 'Cumpleaños de Isabella',
      timestamp: '2024-01-14T16:45:00',
      read: false
    },
    {
      id: '3',
      type: 'forwarded',
      guestName: 'Laura Rodríguez',
      eventName: 'Bautizo de Santiago',
      timestamp: '2024-01-14T09:15:00',
      read: true
    },
    {
      id: '4',
      type: 'accepted',
      guestName: 'Miguel Torres',
      eventName: 'Graduación de Carlos',
      timestamp: '2024-01-13T14:20:00',
      read: true
    },
    {
      id: '5',
      type: 'accepted',
      guestName: 'Sofia Herrera',
      eventName: 'Aniversario de Bodas',
      timestamp: '2024-01-12T11:30:00',
      read: true
    }
  ];

  private storageHelper = inject(StorageHelper);
  private router = inject(Router);
  private supabase = inject(SupabaseService);
  private deviceService = inject(DeviceService);
  private readonly fcm = inject(FirebaseMessagingService);
  private readonly alertCtrl = inject(AlertControllerService);



  constructor() { }

  async ionViewWillEnter() {
    // Handle scroll effect for header
    this.setActiveTab('home');
    this.user = await this.storageHelper.getStorageKey<Profile>(StorageKeys.USER_DATA) as Profile;
    this.user.full_name = this.user.full_name.split(' ').slice(0, 2).join(' '); // Get first and second name only
    this.isScrolled = true;
    this.scrollListener = () => {
      const scrollTop = window.scrollY;
      this.isScrolled = scrollTop > 50;
    };

    window.addEventListener('scroll', this.scrollListener);
    await this.alertCtrl.openModalAlert();
    await this.loadEvents();
    await this.registerDeviceInfo();
    await this.setPushNotification();
    await this.alertCtrl.dismiss();
  }

  async testingPush() {
    const { data, error } = await this.supabase.getSupabase().functions.invoke('send-push_notification', {
      body: {
        token: 'dsxvv9FMTLqeG5KHBAOtec:APA91bFZLeVUaIt5WWgX_o0ozJOWyeseX9hPKsWgLpkWHKDGjg8KNKEzxjUDZAHTLfQHrF0GQ6JDNBGBMuXAsfyWfAVlcGpvx2S-gy33w7iWjFpreAsXE8U',
        title: '🎊 Festiva',
        body: 'Tu invitación fue actualizada. Toca para ver los detalles.',
        image: 'https://tus-assets/festiva.png',
        data: { screen: 'invite-details', inviteId: 'abc-123' },
        priority: 'high',
      }
    });
    console.log({ data, error });
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  get filteredEvents(): FestivaEvent[] {

    return this.events.filter(event =>
      event?.name?.toLowerCase().includes(this.searchQuery?.toLowerCase()) ||
      event?.description?.toLowerCase().includes(this.searchQuery?.toLowerCase())
    );
  }

  get unreadNotifications(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  onImageError(event: any) {
    event.target.src = 'assets/img/shared/avatar-default.png'; // Ruta a la imagen por defecto
  }

  async loadEvents(event?: any) {
    // Logic to load events
    const { data, error } = await this.supabase.getRecords<FestivaEvent[]>('events', ['*'], 'user_id', this.user.id, 'created_at');
    console.log('Loaded events:', data);
    if (error) {
      console.error('Error loading events:', error);
      this.events = [];
    } else {
      //stop refresh if exists
      event?.target?.complete();
      //map events to add role property as Admin
      this.events = this.mapEventsForAdmin(data as any[]);
      await this.loadEventsToManage();

    }
  }

  async loadEventsToManage() {
    // Logic to load events
    const { data, error }: any = await this.supabase.getRecords<any>(
      'event_members',
      [
        '*',
        'events(*)',
        'member:user_profiles!user_id(*)',     // perfil del miembro (event_members.user_id)
        'owner:user_profiles!created_by(*)',   // perfil del dueño  (event_members.created_by)
      ],
      'user_id',
      this.user.id,
      'created_at'
    );

    console.log('Loaded events for manage:', data);
    if (error) {
      console.error('Error loading events:', error);
      // this.events = [];
    } else {
      const result = this.mapEventsToManageRole(data || []);
      console.log('Mapped events with role:', result);
      this.events = [this.events, ...result].flat();
      console.log('All events:', this.events);
    }
  }

  //metodo para hacer map de los eventos a administrar agregandole la propiedad role
  mapEventsToManageRole(events: any[]): any[] {
    return events.map(ev => ({
      ...ev.events,
      role: ev.role,
      owner: false,
      user: ev.owner
    }));
  }

  mapEventsForAdmin(events: any[]): any[] {
    return events.map(ev => ({
      ...ev,
      role: 'Admin',
      owner: true,
      user: null
    }));
  }

  clearSearch() {
    this.searchQuery = '';
  }

  requestAdminEvents() {
    window.open('https://wa.me/18099560999?text=Hola%2C%20quiero%20saber%20mas%20informaci%C3%B3n%20sobre%20la%20administraci%C3%B3n%20de%20eventos', '_system');
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;

    switch (tab) {
      case 'request':
        window.open('https://wa.me/18099560999?text=Hola%2C%20quiero%20saber%20mas%20informaci%C3%B3n%20sobre%20las%20invitaciones', '_system');
        this.activeTab = 'home';
        break;
        case 'info':
          this.router.navigate([RoutesApp.INFORMATION]);
          break;
      case 'settings':
        this.router.navigate([RoutesApp.SETTINGS]);
        break;
      case 'profile':
        this.router.navigate([RoutesApp.AUTH_REGISTER], { state: { fromProfile: true, profile: this.user } });
        break;
      
      default:
        console.log('Tab no manejada:', tab);
        break;
    }
  }

  setShowNotifications(show: boolean) {
    this.showNotifications = show;
  }

  getPlanTypeColor(planType: string): string {
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getNotificationText(notification: Notification): string {
    switch (notification.type) {
      case 'accepted':
        return `${notification.guestName} aceptó la invitación`;
      case 'rejected':
        return `${notification.guestName} rechazó la invitación`;
      case 'forwarded':
        return `${notification.guestName} reenvió la invitación`;
      default:
        return 'Nueva notificación';
    }
  }

  formatNotificationTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  }

  trackByEventId(index: number, event: FestivaEvent): string {
    return event.id || '';
  }

  trackByInvitationId(index: number, invitation: ExampleInvitation): string {
    return invitation.id;
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  createNewEvent() {
    // Logic to create a new event
    this.router.navigate([RoutesApp.CREATE_EVENT]);
  }

  adminEvent(event: FestivaEvent) {
    // Logic to manage the event
    EVENT_STATE.eventRole = (event as any)?.role || '';
    this.router.navigate([RoutesApp.MANAGE_EVENT], { state: { event, managementOptionSelected: '' } });
  }

  async registerDeviceInfo() {
    if (this.user.device_id) return; // Already registered

    const { device_id, device_name } = await this.deviceService.getDeviceInfo();

    const { data, error } = await this.supabase.updateRecord('user_profiles', this.user.id, {
      device_id,
      device_name
    });
  }

  async setPushNotification() {

    const isWeb = !['android', 'ios'].includes(Capacitor.getPlatform());

    if (isWeb) return;

    const pushPermission = await this.storageHelper.getStorageKey(StorageKeys.PUSH_PERMISSIONS);

    if (pushPermission === 'rejected') return; // User has denied permissions previously

    if (pushPermission === 'granted' && this.user.push_token) return; // User has granted permissions and has a push token

    const modalPushShown = await this.storageHelper.getStorageKey<boolean>(StorageKeys.MODAL_PUSH_SHOWN);

    if (!pushPermission && !this.user.push_token && !modalPushShown) {
      await this.storageHelper.setStorageKey(StorageKeys.MODAL_PUSH_SHOWN, true);
      await this.alertCtrl.openModalPushNotification();
    }
    const permissionGranted = await this.fcm.requestPermissions();

    if (permissionGranted) {
      const token = await this.fcm.getToken();
      if (token) {
        const userTokenUpdated = this.user.push_token !== token;

        if (userTokenUpdated) {
          const { data, error } = await this.supabase.updateRecord('user_profiles', this.user.id, { push_token: token });
          if (data) {

            this.user.push_token = token;
            await this.storageHelper.setStorageKey(StorageKeys.USER_DATA, this.user);
            await this.storageHelper.setStorageKey(StorageKeys.PUSH_PERMISSIONS, 'granted');
          }
        }
      }
    }
    else {
      await this.storageHelper.setStorageKey(StorageKeys.PUSH_PERMISSIONS, 'rejected');
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'Admin':
        return 'border-red-500 bg-red-50';
      case 'Escritura':
        return 'border-green-500 bg-green-50';
      case 'Lectura':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-200 hover:border-gray-300';
    }
  }

  goToTemplates() {
    this.router.navigate([RoutesApp.TEMPLATES]);
  }
}