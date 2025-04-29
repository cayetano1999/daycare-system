// main.ts
import { CommonModule, registerLocaleData } from '@angular/common';
import * as es from '@angular/common/locales/es';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { AppComponent } from './app/app.component';

// Servicios
import { ApiService } from './app/core/services/api/api.service';
import { FirebaseAnalyticsService } from './app/core/services/firebase/firebase-analytics.service';
import { FirebaseRemoteConfigService } from './app/core/services/firebase/firebase-remote-config.service';
import { FirebaseAppService } from './app/core/services/firebase/firebase.app.service';
import { AuthInterceptor } from './app/core/interceptors/default.interceptor';

// Pipes
import { PipesModule } from './app/shared/pipes/pipes.module';
import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { environment } from './environments/environment';
import { routes } from './app/app.routes';


if (environment.production) {
  enableProdMode();
}

// Inicialización del Locale
registerLocaleData(es.default);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Routing sin módulos
    importProvidersFrom(IonicModule.forRoot({
      mode: 'ios',
      backButtonText: '',
      swipeBackEnabled: true,
      hardwareBackButton: true
    })),
    importProvidersFrom(PipesModule), // Pipes compartidos
    importProvidersFrom(CommonModule),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ApiService,
    FirebaseAnalyticsService,
    FirebaseRemoteConfigService,
    FirebaseAppService,
    provideHttpClient(withInterceptorsFromDi()), // HttpClient con interceptores
    { provide: LOCALE_ID, useValue: 'es' },
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (remoteConfig: FirebaseRemoteConfigService, firebase: FirebaseAppService) => {
        return async () => {
          await firebase.initializeFirebaseApp(); // Inicializar Firebase
          await remoteConfig.loadConfig(); // Cargar Remote Config
        };
      },
      deps: [FirebaseRemoteConfigService, FirebaseAppService],
      multi: true
    }
  ]
}).catch(err => console.error(err));
