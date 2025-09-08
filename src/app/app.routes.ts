import { Routes } from '@angular/router';
import { NoInternetPage } from './features/no-internet/no-internet.page';
import { MaintenancePage } from './features/maintenance/maintenance.page';
import { PreHomePage } from './features/pre-home/pre-home.page';
import { OnboardingPage } from './features/onboarding/onboarding.page';
import { authRoutes } from './features/auth/auth.routes';
import { dashBoardRoutes } from './features/dashboard/dashboard.routes';
import { eventRoutes } from './features/events/events.routes';
import { informationRoutes } from './features/information/information.routes';
import { settingsRoutes } from './features/settings/settings.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login-preview',
    pathMatch: 'full'
  },

  // //Authentication routes
  // ...authenticationRoutes,
  // ...topUpRoutes,
  // ...billPaymentRoutes,
  // ...favoriteNumbers,
  // ...profileRoutes,
  // ...creditcardRoutes,
  ...authRoutes,
  ...dashBoardRoutes,
  ...eventRoutes,
  ...informationRoutes,
  ...settingsRoutes,

  {
    path: 'no-internet',
    component: NoInternetPage
  },
  {
    path: 'maintenance',
    component: MaintenancePage
  },
  {
    path: 'pre-home',
    component: PreHomePage
  },
 {
    path: 'onboarding',
    component: OnboardingPage
  },
  {
    path: 'information',
    loadComponent: () => import('./features/information/information.page').then( m => m.InformationPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.page').then( m => m.SettingsPage)
  }
 
  

];


