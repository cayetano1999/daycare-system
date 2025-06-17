import { Routes } from "@angular/router";
import { ValidatePhoneComponent } from "./pages/validate-phone/validate-phone.component";
import { AppMaintenanceGuard } from "src/app/core/guards/app-maintenance.guard";
import { ForceUpgradeGuard } from "src/app/core/guards/force-update.guard";
import { InternetConnectionGuard } from "src/app/core/guards/internet-conection.guard";
import { ForgotPasswordComponent } from "../auth/pages/forgot-password/forgot-password.component";
import { LoginEmailComponent } from "../auth/pages/login-email/login-email.component";
import { LoginPhoneComponent } from "../auth/pages/login-phone/login-phone.component";
import { LoginPreviewComponent } from "../auth/pages/login-preview/login-preview.component";
import { OtpComponent } from "../auth/pages/otp/otp.component";
import { RegisterComponent } from "../auth/pages/register/register.component";
import { SendTopUpsComponent } from './pages/send-top-ups/send-top-ups.component';

export const topUpRoutes: Routes = [

  //Authentication routes
  {
    path: 'top-up/validate-phone',
    component: ValidatePhoneComponent,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },

  {
    path: 'top-up/send-top-ups',
    component: SendTopUpsComponent,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },

]