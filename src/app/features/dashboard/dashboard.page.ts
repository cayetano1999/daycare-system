import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { NavController } from '@ionic/angular';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { Profile } from 'src/app/core/interface/profile.interface';
import { DeviceService } from 'src/app/core/services/device/device.service';
import { FirebaseMessagingService } from 'src/app/core/services/firebase/firebase-messaging.service';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { FestivaHeaderComponent } from 'src/app/shared/components/festiva-header/festiva-header.component';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

interface Event {
  id: string;
  name: string;
  description: string;
  event_date: string;
  status: 'ACTIVE' | 'DRAFT' | 'COMPLETED' | 'CANCELLED';
  plan_type: 'Starter' | 'Essential' | 'Premium' | 'Elite';
  image: string;
}

interface ExampleInvitation {
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
  imports: [...StandAloneModules, FestivaHeaderComponent],
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
  events: Event[] = [
    {
      id: '1',
      name: 'Boda de María y José',
      description: 'Una celebración mágica llena de amor y alegría en un hermoso jardín',
      event_date: '2024-06-15T18:00:00',
      status: 'ACTIVE',
      plan_type: 'Premium',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    },
    {
      id: '2',
      name: 'Cumpleaños de Isabella',
      description: 'Celebrando los 15 años de nuestra princesa con una fiesta inolvidable',
      event_date: '2024-07-20T16:00:00',
      status: 'DRAFT',
      plan_type: 'Elite',
      image: 'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    },
    {
      id: '3',
      name: 'Bautizo de Santiago',
      description: 'Un momento especial para dar la bienvenida a Santiago en la fe',
      event_date: '2024-05-10T11:00:00',
      status: 'COMPLETED',
      plan_type: 'Essential',
      image: 'https://images.pexels.com/photos/8923659/pexels-photo-8923659.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    },
    {
      id: '4',
      name: 'Graduación de Carlos',
      description: 'Celebrando el logro académico de Carlos con familia y amigos',
      event_date: '2024-08-05T19:00:00',
      status: 'ACTIVE',
      plan_type: 'Starter',
      image: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    },
    {
      id: '5',
      name: 'Aniversario de Bodas',
      description: 'Celebrando 25 años de amor y compañía en una cena íntima',
      event_date: '2024-09-12T20:00:00',
      status: 'ACTIVE',
      plan_type: 'Premium',
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    }
  ];

  // Mock example invitations
  exampleInvitations: ExampleInvitation[] = [
    {
      id: '1',
      name: 'Boda Elegante',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      type: 'Boda'
    },
    {
      id: '2',
      name: 'Quinceañera Dorada',
      image: 'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      type: 'Cumpleaños'
    },
    {
      id: '3',
      name: 'Bautizo Celestial',
      image: 'https://images.pexels.com/photos/8923659/pexels-photo-8923659.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      type: 'Bautizo'
    }
  ];

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
    this.user = await this.storageHelper.getStorageKey<Profile>(StorageKeys.USER_DATA) as Profile;
    this.user.full_name = this.user.full_name.split(' ').slice(0, 2).join(' '); // Get first and second name only
    this.isScrolled = true;
    this.scrollListener = () => {
      const scrollTop = window.scrollY;
      this.isScrolled = scrollTop > 50;
    };

    window.addEventListener('scroll', this.scrollListener);

    await this.loadEvents();
    await this.registerDeviceInfo();
    await this.setPushNotification();
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  get filteredEvents(): Event[] {
    return this.events.filter(event =>
      event.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get unreadNotifications(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  async loadEvents() {
    // Logic to load events
    const { data, error } = await this.supabase.getRecords<Event[]>('events', ['*'], 'user_id', this.user.id, 'created_at');
    console.log('Loaded events:', data);
    if (error) {
      console.error('Error loading events:', error);
      this.events = [];
    } else {
      this.events = data as any[];
    }
  }

  clearSearch() {
    this.searchQuery = '';
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
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

  trackByEventId(index: number, event: Event): string {
    return event.id;
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

  adminEvent(event: Event) {
    // Logic to manage the event
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


    if (!pushPermission) {
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
}