
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Capacitor } from "@capacitor/core";
import { Platform } from "@ionic/angular";
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, User, getAuth, onAuthStateChanged, signInWithCredential, signInWithPopup } from "firebase/auth";

import 'firebase/auth';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GoogleAuthService {

    provider = new GoogleAuthProvider();

    isWeb = false;
    firebase: any;
    clientId: string = ""
    constructor(
        private platform: Platform,
        private router: Router) {
        this.firebase = initializeApp(environment.firebaseConfig);
        const pltf = Capacitor.getPlatform();
        if (pltf === 'android') {
            this.clientId = '193661590436-6mbgp90lr1c6a1il9jnqgjojgefr9qhp.apps.googleusercontent.com'
        }

        else if (pltf === 'ios') {
            this.clientId = '193661590436-lhdkoot91og17vg56v58ghghho0m2922.apps.googleusercontent.com'; // Este Id es para cuando sea Fisico
        }

        else {
        this.clientId = '193661590436-pik35gum993dh1r0imj8b3debnnblbsu.apps.googleusercontent.com';

        }
        // GoogleAuth.initialize({
        //     clientId: this.clientId,
        //     scopes: ['profile', 'email'],
        //     grantOfflineAccess: true,
        // });
    }

    public async refreshToken() {
        const auth = getAuth(this.firebase);
        onAuthStateChanged(auth, async (currenUser: User | null) => {
            if (currenUser) {
                const idToken = await currenUser.getIdToken(true);
                //  await this.localStorageService.set(AppStorageKey.AccessToken, idToken);
            } else {
                await this.logout();
            }
        });
    }

    async logout() {
        // await getAuth(this.firebase).signOut();
        // await GoogleAuth.signOut().then(() => console.log('Signed Out')).catch((e) => { console.log('Signed Out') });
    }

    initialize() {
        if (this.isWeb) {
        }
    }

    async loginViaGoogle(): Promise<any> {
        // try {


        //     const user = await GoogleAuth.signIn();
        //     alert(JSON.stringify(user));
        //     if (user) {
        //         return user;
        //     }
        // } catch (error) {
        //     console.log(error);
        //     alert('Error al iniciar sesión con Google');
        // }
    }

    async test() {
        
        const auth = getAuth();
        auth.useDeviceLanguage(); // opcional
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result;
    }

}
