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


register(); // Register Swiper elements globally
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, PipesModule, KuidoTabComponent]
})
export class AppComponent implements OnInit {
    // Properties
    public version = environment.APP_VERSION;
    public menuOptions = remoteConfig.OPTIONS_ITEMS.options as any;
    public availableMenu = false;
    public loadingAds = false;
    public navegationHistory: string[] = [];
    public isOnboardingComplete: boolean = false;
    public profile!: Profile;
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
    private readonly fingerprint = inject(FingerprintService);


    constructor() {
        this.setupRouterEvents();
        this.setupBackButton();
        this.validateUrlWeb();

    }


    async ngOnInit() {
        this.isOnboardingComplete = await this.storageHelper.getStorageKey(StorageKeys.ONBOARDING_COMPLETED);
        this.profile = await this.storageHelper.getStorageKey(StorageKeys.USER_DATA);

        const isConnected = await Network.getStatus();
        if (!isConnected.connected) {
            this.navCtrl.navigateRoot(RoutesApp.NO_INTERNET);
            return;
        }

        // if (!this.platform.is('mobileweb')) {
        //     await ScreenOrientation.lock({ orientation: 'portrait' });
        // }

        this.communicationService.message$.subscribe(() => this.availableMenu = true);
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
        await this.storageHelper.setStorageKey(StorageKeys.FINGERPRINT_DEVICE_ID, result.visitorId);
    }

    async checkSession() {

        const isSessionExpired = await this.supabase.isSessionExpired();
        const session = await this.supabase.getSession();
        if (isSessionExpired) {
            await this.router.navigate([RoutesApp.PRE_HOME]);
        }
        else {
            const { data } = await this.supabase.profile();
            await this.storageHelper.setStorageKey(StorageKeys.SUPABASE_SESSION, session);
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
            this.router.events.subscribe(event => {
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
        this.platform.backButton.subscribeWithPriority(10, async () => {
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
                const { data, error } = await this.supabase.getSupabase().auth.setSession({
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
    }

    validateUrlWeb() {
        if (window.location.href.includes('access_token')) {
            this.onGoogleAuthentication(window.location.href);
        }
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
