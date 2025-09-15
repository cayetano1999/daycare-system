import { Injectable } from "@angular/core";
import { Capacitor } from "@capacitor/core";
import firebase from 'firebase/compat/app'; // Importa la compatibilidad con la versión 10.x de Firebase
import 'firebase/compat/remote-config';
import { environment } from "src/environments/environment";
import { remoteConfig } from "src/environments/environment.remoteconfig";
import { FeatureFlagKey } from "../../enums/featureFlag.enum";

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
        const platform = Capacitor.getPlatform();
        environmentKeys.forEach(element => {
            let envKey = 'ENVIRONMENT'; // default para web


            if(platform === 'ios' || platform === 'android') {
                envKey = `ENVIRONMENT_${platform.toUpperCase()}`; // ENVIRONMENT_IOS o ENVIRONMENT_ANDROID
            }
            const raw = result[envKey]?.asString() || '{}';
            const parse = JSON.parse(raw)?.[element] as any;
            environment[element as keyof Object] = parse !== undefined && parse !== '{}' ? parse : environment[element as keyof Object] || null;
        });


        if (environment.STORE_REVIEW && environment.APP_VERSION === environment.STORE_REVIEW_VERSION) {
            // Mostrar la funcionalidad de reseñas en la app
            [
            FeatureFlagKey.RESTRICTIONS_ADMIN,
            FeatureFlagKey.AUTH_GOOGLE,
            FeatureFlagKey.AUTH_APPLE,
            FeatureFlagKey.AUTH_FORGOT_PASSWORD,
            
            ].forEach(flagKey => {
                // remoteConfig.YAHWEH_FEATURE_FLAGS_V2[flagKey] = true;

                const flag = remoteConfig.FEATURE_FLAGS?.find(f => f.key === flagKey);
                if (flag) {
                    flag.enabled = false;
                }
            });

            if(platform === 'android') {
                environment.AUTH_LOGIN = false;
                environment.AUTH_REGISTER = false;
                environment.AUTH_GOOGLE = true;
                environment.AUTH_IOS = true;
            }
            else if(platform === 'ios') {
                environment.AUTH_LOGIN = true;
                environment.AUTH_REGISTER = true;
                environment.AUTH_GOOGLE = false;
                environment.AUTH_IOS = false;
            }

        }
    }
}