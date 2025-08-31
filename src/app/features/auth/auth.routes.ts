import { Routes } from "@angular/router";
import { AppMaintenanceGuard } from "src/app/core/guards/app-maintenance.guard";
import { ForceUpgradeGuard } from "src/app/core/guards/force-update.guard";
import { InternetConnectionGuard } from "src/app/core/guards/internet-conection.guard";
import { RegisterPage } from "./register/register.page";

export const authRoutes: Routes = [

  //Authentication routes
  {
    path: 'auth/register',
    component: RegisterPage,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  },

]