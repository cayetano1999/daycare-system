import { Routes } from "@angular/router";
import { AppMaintenanceGuard } from "src/app/core/guards/app-maintenance.guard";
import { ForceUpgradeGuard } from "src/app/core/guards/force-update.guard";
import { InternetConnectionGuard } from "src/app/core/guards/internet-conection.guard";
import { AuthPage } from "./auth-home.page";
import { LoginPreviewComponent } from "./pages/login-preview/login-preview.component";
import { LoginEmailComponent } from "./pages/login-email/login-email.component";
import { LoginPhoneComponent } from "./pages/login-phone/login-phone.component";
import { RegisterComponent } from "./pages/register/register.component";
import { ForgotPasswordComponent } from "./pages/forgot-password/forgot-password.component";
import { OtpComponent } from "./pages/otp/otp.component";

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
  },
  {
    path: 'auth/login-email',
    component: LoginEmailComponent,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },
  {
    path: 'auth/login-phone',
    component: LoginPhoneComponent,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },
  {
    path: 'auth/forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },
  {
    path: 'auth/otp',
    component: OtpComponent,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  }
]