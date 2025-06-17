import { Routes } from "@angular/router";
import { AppMaintenanceGuard } from "src/app/core/guards/app-maintenance.guard";
import { ForceUpgradeGuard } from "src/app/core/guards/force-update.guard";
import { InternetConnectionGuard } from "src/app/core/guards/internet-conection.guard";
import { CreditcardComponent } from "./creditcard.component";
import { CreateCreditCardComponent } from "./pages/create-credit-card/create-credit-card.component";

export const creditcardRoutes: Routes = [
  {
    path: 'creditcard/create',
    component: CreateCreditCardComponent,
    canActivate: [AppMaintenanceGuard, InternetConnectionGuard, ForceUpgradeGuard]
  }
]