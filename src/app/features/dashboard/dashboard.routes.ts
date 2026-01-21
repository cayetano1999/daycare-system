import { Routes } from "@angular/router";
import { AppMaintenanceGuard } from "src/app/core/guards/app-maintenance.guard";
import { AuthModuleGuard } from "src/app/core/guards/auth-module.guard";
import { ForceUpgradeGuard } from "src/app/core/guards/force-update.guard";
import { InternetConnectionGuard } from "src/app/core/guards/internet-conection.guard";
import { DashboardPage } from "./dashboard.page";
import { DashboardComponent } from "../daycare/dashboard/dashboard.page";
import { InscriptionComponent } from "src/app/shared/daycare/inscription/inscription.component";
import { InscriptionPage } from "../daycare/inscription/inscription.page";
import { AuthorizedPickerPage } from "../daycare/authorized-picker/authorized-picker.page";
import { AuthorizedPersonManagementPage } from "../daycare/authorized-person-management/authorized-person-management.page";
import { ChildManagementComponent } from "../daycare/child-management/child-management.component";
import { PaymentManagementComponent } from "../daycare/payment-management/payment-management.component";

export const dashBoardRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [ForceUpgradeGuard, AppMaintenanceGuard, InternetConnectionGuard]
  }
];