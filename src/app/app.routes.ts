import { Routes } from '@angular/router';
import { NoInternetPage } from './features/no-internet/no-internet.page';
import { MaintenancePage } from './features/maintenance/maintenance.page';
import { PreHomePage } from './features/pre-home/pre-home.page';
import { OnboardingPage } from './features/onboarding/onboarding.page';
import { authRoutes } from './features/auth/auth.routes';
import { dashBoardRoutes } from './features/dashboard/dashboard.routes';
import { eventRoutes } from './features/events/events.routes';

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
 
  

];


