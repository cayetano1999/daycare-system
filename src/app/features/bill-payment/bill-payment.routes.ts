import { Routes } from '@angular/router';
import { AppMaintenanceGuard } from 'src/app/core/guards/app-maintenance.guard';
import { ForceUpgradeGuard } from 'src/app/core/guards/force-update.guard';
import { InternetConnectionGuard } from 'src/app/core/guards/internet-conection.guard';
import { BillPaymentComponent } from './bill-payment.component';


export const billPaymentRoutes: Routes = [
    {
        path: 'bill-payment',
        component: BillPaymentComponent,
        canActivate: [ForceUpgradeGuard, InternetConnectionGuard, AppMaintenanceGuard],
    }
]