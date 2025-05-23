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

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, PipesModule]
})
export class AppComponent implements OnInit {
    // Properties
    public version = environment.APP_VERSION;
    public menuOptions = remoteConfig.OPTIONS_ITEMS.options as any;
    public availableMenu = false;
    public loadingAds = false;
    public navegationHistory: string[] = [];

    // Services
    private readonly platform = inject(Platform);
    private readonly communicationService = inject(CommunicationService);
    private readonly navCtrl = inject(NavController);
    private readonly router = inject(Router);
    private readonly analyticsService = inject(FirebaseAnalyticsService);
    private readonly backBtnService = inject(BackButtonService);
    private readonly supabase = inject(SupabaseService);

    constructor() {
        this.setupRouterEvents();
        this.setupBackButton();
        this.checkSession();
    }

    async ngOnInit() {
        const isConnected = await Network.getStatus();
        if (!isConnected.connected) {
            this.navCtrl.navigateRoot(RoutesApp.NO_INTERNET);
            return;
        }

        if (!this.platform.is('mobileweb')) {
            await ScreenOrientation.lock({ orientation: 'portrait' });
        }

        this.communicationService.message$.subscribe(() => this.availableMenu = true);
    }

    async checkSession() {
        const { data } = await this.supabase.getSupabase().auth.getSession();

        if (data.session) {
            this.router.navigate([RoutesApp.PROFILE]);
        } else {
            this.router.navigate([RoutesApp.LOGIN]);
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

    handleItemSelected(item: any): void {
        console.log('Item selected:', item);
    }
}
