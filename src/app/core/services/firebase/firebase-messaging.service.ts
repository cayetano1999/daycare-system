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
            console.log('Firebase Messaging token:', token.token);
            return token.token;
        } catch (error) {
            console.error('Error getting Firebase token:', error);
            return null;
        }
    }

    addListeners(): void {
        if (this.platform.is('mobileweb')) return;

        FirebaseMessaging.addListener('tokenReceived', async (token: GetTokenResult) => {
            console.log('Firebase token received:', token.token);
            

        });

        FirebaseMessaging.addListener('notificationReceived', async (action: any) => {
            console.log('Firebase message received:', action);

        });

        FirebaseMessaging.addListener('notificationActionPerformed', async (action: any) => {
            console.log('Firebase notification action performed:', action);
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
