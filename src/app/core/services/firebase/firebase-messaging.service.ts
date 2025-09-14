import { inject, Injectable } from '@angular/core';
import { FirebaseMessaging, GetTokenResult } from '@capacitor-firebase/messaging';
import { NavController, Platform } from '@ionic/angular';
import { StorageHelper } from '../../helpers/storage.helper';
import { StorageKeys } from '../../enums/storage.keys.enum';
import { Profile } from '../../interface/profile.interface';
import { SupabaseService } from '../supabase.service';

@Injectable({
    providedIn: 'root'
})
export class FirebaseMessagingService {

    private readonly navCtrl = inject(NavController);
    private readonly platform = inject(Platform);
    private readonly storageHelper = inject(StorageHelper);
    private readonly supabase = inject(SupabaseService);


    constructor() { }

    async requestPermissions(): Promise<boolean> {
        const permStatus = await FirebaseMessaging.requestPermissions();
        return permStatus.receive === 'granted';
    }


    async getToken(): Promise<string | null> {

        if (this.platform.is('mobileweb')) return null;

        try {
            const token: GetTokenResult = await FirebaseMessaging.getToken();
            return token.token;
        } catch (error) {
            console.error('Error getting Firebase token:', error);
            return null;
        }
    }

    addListeners(): void {
        if (this.platform.is('mobileweb')) return;

        FirebaseMessaging.addListener('tokenReceived', async (token: GetTokenResult) => {

        });

        FirebaseMessaging.addListener('notificationReceived', async (action: any) => {

        });

        FirebaseMessaging.addListener('notificationActionPerformed', async (action: any) => {
        });
    }

    removeAllListeners(): void {
        FirebaseMessaging.removeAllListeners();
    }

    async initializeFirebaseMessaging(): Promise<void> {
        if (this.platform.is('mobileweb')) return;

        try {
            this.addListeners();
        } catch (error) {
            console.error('Error initializing Firebase messaging:', error);
        }
    }

}
