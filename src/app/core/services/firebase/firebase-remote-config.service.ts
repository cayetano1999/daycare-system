import { Injectable } from "@angular/core";
import { Capacitor } from "@capacitor/core";
import firebase from 'firebase/compat/app'; // Importa la compatibilidad con la versión 10.x de Firebase
import 'firebase/compat/remote-config';
import { environment } from "src/environments/environment";
import { remoteConfig } from "src/environments/environment.remoteconfig";

@Injectable({
    providedIn: 'root'
})

export class FirebaseRemoteConfigService {

    /**
     *
     */
    constructor() {
    }


    async fetchAndActivate(): Promise<void> {
        const remoteConfig = firebase.remoteConfig();
        await remoteConfig.fetchAndActivate();
    }

    async getValue(key: string) {
        const remoteConfig = firebase.remoteConfig();
        return remoteConfig.getValue(key);
    }

    async getAllValues() {
        const remoteConfig = firebase.remoteConfig();
        remoteConfig.settings.fetchTimeoutMillis = 0;
        remoteConfig.settings.minimumFetchIntervalMillis = 0;
        await remoteConfig.fetchAndActivate();
        return remoteConfig.getAll();
    }


    async loadConfig() {

        const result = await this.getAllValues();
        const keys = Object.keys(remoteConfig);
        keys.forEach(element => {
            remoteConfig[element as keyof Object] = JSON.parse(result[element]?.asString() || '{}') as any || null;
        });

        const excludedKeys = [
            'firebaseConfig',
            'production',
            'firebase',

        ];

        const environmentKeys = Object.keys(environment).filter(key => !excludedKeys.includes(key));
        environmentKeys.forEach(element => {
            let envKey = 'ENVIRONMENT'; // default para web

            const platform = Capacitor.getPlatform();

            if (platform === 'android') {
                envKey = 'ENVIRONMENT_ANDROID';
            } else if (platform === 'ios') {
                envKey = 'ENVIRONMENT_IOS';
            }

            const raw = result[envKey]?.asString() || '{}';
            const parse = JSON.parse(raw)?.[element] as any;


            environment[element as keyof Object] = parse !== undefined && parse !== '{}' ? parse : environment[element as keyof Object] || null;
        });



        if (environment.STORE_REVIEW && environment.APP_VERSION === environment.STORE_REVIEW_VERSION) {
            // Mostrar la funcionalidad de reseñas en la app

            // [
            // FeatureFlagKey.ONLINE_GAME,
            // FeatureFlagKey.SHOW_ANDROID_BANNER_ADS,
            // FeatureFlagKey.SHOW_IOS_BANNER_ADS,
            // FeatureFlagKey.SHOW_ANDROID_VIDEO_ADS,
            // FeatureFlagKey.SHOW_IOS_VIDEO_ADS,
            // FeatureFlagKey.SOUNDS,
            // FeatureFlagKey.SUPPORT_CHAT
            // ].forEach(flagKey => {
            //     // remoteConfig.YAHWEH_FEATURE_FLAGS_V2[flagKey] = true;

            //     const flag = remoteConfig.YAHWEH_FEATURE_FLAGS_V2?.find(f => f.key === flagKey);
            //     if (flag) {
            //         flag.enabled = false;
            //     }
            // });


            // if (Capacitor.getPlatform() === 'ios') {
            //     const googleAuthFlag = remoteConfig.YAHWEH_FEATURE_FLAGS_V2?.find(f => f.key === FeatureFlagKey.GOOGLE_AUTH_IOS);
            //     if (googleAuthFlag) {
            //         googleAuthFlag.enabled = false;
            //     }
            // }


        }


    }
}