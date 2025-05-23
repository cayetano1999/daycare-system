import { Routes } from '@angular/router';
import { ForceUpgradeGuard } from './core/guards/force-update.guard';
import { InternetConnectionGuard } from './core/guards/internet-conection.guard';
import { AppMaintenanceGuard } from './core/guards/app-maintenance.guard';
import { AuthPage } from './features/auth/auth-home.page';
import { NoInternetPage } from './features/no-internet/no-internet.page';
import { MaintenancePage } from './features/maintenance/maintenance.page';
import { PreHomePage } from './features/pre-home/pre-home.page';
import { OnboardingPage } from './features/onboarding/onboarding.page';
import { HomePage } from './features/home/home.page';
import { SplashScreenComponent } from './features/splash-screen/splash-screen.component';
import { LoginPreviewComponent } from './features/auth/pages/login-preview/login-preview.component';
import { authenticationRoutes } from './features/auth/authentication.routes';
import { topUpRoutes } from './features/top-up/top-up.routes';
import { billPaymentRoutes } from './features/bill-payment/bill-payment.routes';
import { favoriteNumbers } from './features/favorite-numbers/favorite-numbers.routes';
import { SessiongGuard as SessionGuard } from './core/guards/session.guard';
import { profileRoutes } from './features/profile/profile.page.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login-preview',
    pathMatch: 'full'
  },

  //Authentication routes
  ...authenticationRoutes,
  ...topUpRoutes,
  ...billPaymentRoutes,
  ...favoriteNumbers,
  ...profileRoutes,

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
    path: 'home',
    component: HomePage,
    canActivate: [SessionGuard]
  },
  {
    path: 'splash-screen',
    component: SplashScreenComponent
  }

];


