import { Routes } from "@angular/router";
import { AppMaintenanceGuard } from "src/app/core/guards/app-maintenance.guard";
import { ForceUpgradeGuard } from "src/app/core/guards/force-update.guard";
import { InternetConnectionGuard } from "src/app/core/guards/internet-conection.guard";
import { AuthPage } from "./auth-home.page";
import { LoginPreviewComponent } from "./pages/login-preview/login-preview.component";

export const authenticationRoutes: Routes = [
  {
    path: '',
    redirectTo: 'pre-home',
    pathMatch: 'full'
  },

  //Authentication routes
  {
    path: 'auth',
    component: AuthPage,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },

  {
    path: 'auth/login-preview',
    component: LoginPreviewComponent,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  }
]