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

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pre-home',
    pathMatch: 'full'
  },
 
  {
    path: 'auth',
    component: AuthPage,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },
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
    component: PreHomePage,
  },
  {
    path:'onboarding',
    component: OnboardingPage
  },
  {
    path:'home',
    component: HomePage
  }
];


