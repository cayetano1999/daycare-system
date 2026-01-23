import { Routes } from "@angular/router";
import { InscriptionPage } from "./inscription/inscription.page";
import { AppMaintenanceGuard } from "src/app/core/guards/app-maintenance.guard";
import { ForceUpgradeGuard } from "src/app/core/guards/force-update.guard";
import { InternetConnectionGuard } from "src/app/core/guards/internet-conection.guard";
import { LoginPage } from "../auth/pages/login/login.page";
import { OtpVerificationPage } from "../auth/pages/otp-verification/otp-verification.page";
import { AuthorizedPersonManagementPage } from "./authorized-person-management/authorized-person-management.page";
import { ChildManagementComponent } from "./child-management/child-management.component";
import { PaymentManagementComponent } from "./payment-management/payment-management.component";
import { AuthorizedPickerPage } from "./authorized-picker/authorized-picker.page";
import { ScheduleManagementComponent } from "./schedule-management/schedule-management.component";
import { RegisterPage } from "./register/register.page";
import { InscriptionListComponent } from "src/app/features/daycare/inscription-list/inscription-list.component";
import { InscriptionEditPage } from "./inscription-edit/inscription-edit.page";
import { DocumentsPage } from "./documents/documents.page";
import { GuardiansPage } from "./guardians/guardians.page";
import { GuardianEditPage } from "./guardian-edit/guardian-edit.page";


export const dayCareRoutes: Routes = [

  //Authentication routes
  {
    path: 'daycare/inscription',
    component: InscriptionListComponent,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },
  {
    path: 'daycare/inscription/:id',
    component: InscriptionEditPage,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },
    {
    path: 'daycare/inscription-new',
    component: InscriptionPage,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },
  {
    path: 'daycare/parents-management',
    component: GuardiansPage,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },

  {
    path: 'daycare/child-management',
    component: ChildManagementComponent,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },

    {
    path: 'daycare/payment-management',
    component: PaymentManagementComponent,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },

    {
    path: 'daycare/authorized-person-management',
    component: AuthorizedPersonManagementPage,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },

  {
    path:'daycare/schedule-management',
    component: ScheduleManagementComponent,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },
  {
    path: 'daycare/register',
    component: RegisterPage,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },
  {
    path: 'daycare/documents/:id',
    component: DocumentsPage,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },
  {
    path: 'daycare/guardian-edit/:id',
    component: GuardianEditPage,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  }


]