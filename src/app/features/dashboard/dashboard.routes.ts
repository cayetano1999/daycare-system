import { Routes } from "@angular/router";
import { AppMaintenanceGuard } from "src/app/core/guards/app-maintenance.guard";
import { AuthModuleGuard } from "src/app/core/guards/auth-module.guard";
import { ForceUpgradeGuard } from "src/app/core/guards/force-update.guard";
import { InternetConnectionGuard } from "src/app/core/guards/internet-conection.guard";
import { DashboardPage } from "./dashboard.page";

export const dashBoardRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardPage,
    canActivate: [ForceUpgradeGuard, AppMaintenanceGuard, InternetConnectionGuard]
  }
];