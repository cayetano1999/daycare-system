import { Component, inject, OnInit, effect } from '@angular/core';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Network } from '@capacitor/network';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { remoteConfig } from 'src/environments/environment.remoteconfig';
import { environment } from 'src/environments/environment';
import { CommunicationService } from './core/services/comunication/communication.service';
import { FirebaseAnalyticsService } from './core/services/firebase/firebase-analytics.service';
import { RoutesApp } from './core/enums/routes.enum';
import { BackButtonService } from './core/services/back-button/back-button.service';
import { PipesModule } from './shared/pipes/pipes.module';
import { SupabaseService } from './core/services/supabase.service';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { StorageHelper } from './core/helpers/storage.helper';
import { StorageKeys } from './core/enums/storage.keys.enum';
import { FirebaseMessagingService } from './core/services/firebase/firebase-messaging.service';
import { register } from 'swiper/element/bundle';
import { KuidoTabComponent } from './shared/components/kuido-tab/kuido-tab.component';
import { FingerprintService } from './core/services/fingerprint.service';
import { App } from '@capacitor/app';
import { Profile } from './core/interface/profile.interface';
import { USER_SINGLE } from './core/constants/constants';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AlertControllerService } from './core/services/ionic/alert-controller.service';

register(); // Register Swiper elements globally
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, PipesModule, KuidoTabComponent],
})
export class AppComponent implements OnInit {
  // Properties
  public version = environment.APP_VERSION;
  public menuOptions = [
    {
      title: 'Gestión de Incripciones',
      menu: true,
      icon: 'document-text-outline',
      url: 'daycare/inscription',
      description: 'Administra las inscripciones de los niños.',
    },
    {
      title: 'Gestión de Padres',
      menu: true,
      icon: 'people-circle',
      url: 'daycare/parents-management',
      description: 'Administra la información de los padres.',
    },
    {
      title: 'Administración de Niños',
      menu: true,
      icon: 'accessibility-outline',
      url: 'daycare/child-management',
      description: 'Administra la información de los niños.',
    },
    {
      title: 'Cumpleaños',
      menu: true,
      icon: 'gift-outline',
      url: 'daycare/birthdays',
      description: 'Muestra los niños que cumplen años en el día de hoy.',
    },
    // {
    //     title: 'Gestión de Tandas',
    //     menu: true,
    //     icon: 'time-outline',
    //     url: 'daycare/schedule-management',
    //     description: 'Administra las tandas de cuidado infantil.'
    // },
    {
      title: 'Gestión de Pagos',
      menu: true,
      icon: 'card-outline',
      url: 'daycare/payment-management',
      description: 'Administra los pagos y facturación.',
    },
    // {
    //     title: 'Personas Autorizadas',
    //     menu: true,
    //     icon: 'person-add-outline',
    //     url: 'daycare/authorized-person-management',
    //     description: 'Administra las personas autorizadas para recoger a los niños.'
    // },
  ]; //remoteConfig.OPTIONS_ITEMS.options as any;

  public menuSettingsOptions = [
    {
      title: 'Tu Guardería',
      menu: true,
      icon: 'settings-outline',
      url: 'daycare/company-info',
      description: 'Configura los detalles de tu guardería.',
    },
    {
      title: 'Cerrar Sesión',
      menu: true,
      icon: 'log-out-outline',
      url: null,
      description: 'Cerrar sesión de la aplicación.',
      onClick: async () => {
        const result = await this.alertCtrl.openFestivaAlert(
          'question',
          '¿Estás seguro de que deseas cerrar sesión?',
          '¿Cerrar sesión?',
          true,
          'Cancelar',
          'Cerrar Sesión',
        );
        if (result?.action == 'confirm') {
          await this.supabase.getSupabase().auth.signOut();
          await this.storageHelper.clear();
          this.availableMenu = false;
          this.router.navigate([RoutesApp.PRE_HOME], { replaceUrl: true });
        }
      },
    },
  ];
  public availableMenu = false;
  public loadingAds = false;
  public navegationHistory: string[] = [];
  public isOnboardingComplete: boolean = false;
  public profile!: Profile;
  public user!: Profile;
  // Services
  private readonly platform = inject(Platform);
  private readonly communicationService = inject(CommunicationService);
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly analyticsService = inject(FirebaseAnalyticsService);
  private readonly backBtnService = inject(BackButtonService);
  private readonly supabase = inject(SupabaseService);
  private readonly storageHelper = inject(StorageHelper);
  private readonly fcm = inject(FirebaseMessagingService);
  private readonly alertCtrl = inject(AlertControllerService);

  constructor() {
    this.setupRouterEvents();
    this.setupBackButton();
    this.validateUrlWeb();
    this.communicationService.message$.subscribe(async () => {
      console.log('Mensaje recibido en AppComponent');
      this.availableMenu = true;
      this.user = (await this.storageHelper.getStorageKey<Profile>(
        StorageKeys.USER_DATA,
      )) as Profile;
      console.log('Usuario cargado en AppComponent:', this.user);
    });
  }

  redirect(url?: string) {
    this.router.navigate([url || '/dashboard'], { replaceUrl: true });
  }

  async setStatusBar() {
    try {
      await StatusBar.setStyle({ style: Style.Dark }); // O Style.Dark
      await StatusBar.show(); // Para asegurarse que sea visible
      // Puedes ajustar el color de fondo si es necesario
      await StatusBar.setBackgroundColor({ color: '#000000' });
    } catch (error) {
      console.error('Error al configurar la barra de estado', error);
    }
  }

  async ngOnInit() {
    // document.body.classList.add('edge-to-edge');
    await this.platform.ready();
    await this.setStatusBar();
    // await SplashScreen.hide();
    // await this.fingerprint.checkBiometricAvailability();
    this.isOnboardingComplete = await this.storageHelper.getStorageKey(
      StorageKeys.ONBOARDING_COMPLETED,
    );
    this.profile = await this.storageHelper.getStorageKey(
      StorageKeys.USER_DATA,
    );

    console.log('Perfil cargado en AppComponent:', this.profile);
    this.availableMenu = this.profile ? true : false;

    const isConnected = await Network.getStatus();
    if (!isConnected.connected) {
      this.navCtrl.navigateRoot(RoutesApp.NO_INTERNET);
      return;
    }

    // if (!this.platform.is('mobileweb')) {
    //     await ScreenOrientation.lock({ orientation: 'portrait' });
    // }

    this.loadFingerprint();
    await this.fcm.initializeFirebaseMessaging();

    await this.checkSession();

    App.addListener('appUrlOpen', async ({ url }) => {
      await this.onGoogleAuthentication(url);
    });
  }

  async loadFingerprint() {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    await this.storageHelper.setStorageKey(
      StorageKeys.FINGERPRINT_DEVICE_ID,
      result.visitorId,
    );
  }

  async checkSession() {
    const isSessionExpired = await this.supabase.isSessionExpired();
    const session = await this.supabase.getSession();
    if (isSessionExpired) {
      await this.router.navigate([RoutesApp.PRE_HOME]);
    } else {
      const { data } = await this.supabase.profile();
      await this.storageHelper.setStorageKey(
        StorageKeys.SUPABASE_SESSION,
        session,
      );
      if (data) {
        await this.storageHelper.setStorageKey(StorageKeys.USER_DATA, data);
        USER_SINGLE.ID = data.id;
      }

      if (!this.isOnboardingComplete && data) {
        this.router.navigate([RoutesApp.ONBOARDING]);
        return;
      }
      await this.router.navigate([RoutesApp.HOME]);
    }
  }

  private setupRouterEvents(): void {
    effect(() => {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const screen = event.url.split('/').pop() || '';
          if (!['home', 'pre-home', 'onboarding'].includes(screen)) {
            this.analyticsService.setCurrentScreen(screen);
            this.updateNavigationHistory(event.url);
          }
        }
      });
    });
  }

  private updateNavigationHistory(url: string): void {
    if (!['pre-home', 'onboarding', ''].includes(url.split('/').pop() || '')) {
      if (!this.navegationHistory.includes(url)) {
        this.navegationHistory.push(url);
      }
    }
  }

  private setupBackButton(): void {
    this.platform.backButton.subscribeWithPriority(999, async () => {
      await this.backBtnService.backBtnManager(this.navegationHistory);
    });
  }

  private async onGoogleAuthentication(url: string) {
    if (url?.includes('access_token')) {
      const fragment = url.split('#')[1];
      const params = new URLSearchParams(fragment);

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        const { data, error } = await this.supabase
          .getSupabase()
          .auth.setSession({
            access_token,
            refresh_token,
          });
        if (error) {
          console.error('❌ Error al establecer sesión:', error.message);
          alert('Error al iniciar sesión');
          return;
        }
        await this.checkSession(); // Ya tienes al usuario autenticado
      } else {
        alert('❌ No se encontraron tokens en el redirect');
      }
    }
  }

  handleItemSelected(item: any): void {
    this.router.navigate([item.url], { replaceUrl: true });
  }

  validateUrlWeb() {
    if (window.location.href.includes('access_token')) {
      this.onGoogleAuthentication(window.location.href);
    }
  }

  getDescription(title: string): string {
    return 'Gestión y administración';
  }

  getIconColor(icon: string): string {
    return icon;
  }

  //validate if onboarding is complete and redirect
  private validateOnboarding() {
    if (this.isOnboardingComplete) {
      this.router.navigate([RoutesApp.HOME]);
    } else {
      this.router.navigate([RoutesApp.ONBOARDING]);
    }
  }
}
