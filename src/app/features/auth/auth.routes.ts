import { Routes } from "@angular/router";
import { AppMaintenanceGuard } from "src/app/core/guards/app-maintenance.guard";
import { ForceUpgradeGuard } from "src/app/core/guards/force-update.guard";
import { InternetConnectionGuard } from "src/app/core/guards/internet-conection.guard";
import { RegisterPage } from "./pages/register/register.page";
import { OtpVerificationPage } from "./pages/otp-verification/otp-verification.page";
import { AuthModuleGuard } from "src/app/core/guards/auth-module.guard";
import { LoginPage } from "./pages/login/login.page";

export const authRoutes: Routes = [

  //Authentication routes
  {
    path: 'auth/register',
    component: RegisterPage,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },
  {
    path: 'auth/otp-verification',
    component: OtpVerificationPage,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },

  {
    path: 'auth/login',
    component: LoginPage,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  }

]