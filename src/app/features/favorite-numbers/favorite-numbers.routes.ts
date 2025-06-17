import { Routes } from '@angular/router';
import { AppMaintenanceGuard } from 'src/app/core/guards/app-maintenance.guard';
import { ForceUpgradeGuard } from 'src/app/core/guards/force-update.guard';
import { InternetConnectionGuard } from 'src/app/core/guards/internet-conection.guard';
import { FavoriteNumbersComponent } from './favorite-numbers.component';


export const favoriteNumbers: Routes = [
    {
        path: 'favorite-numbers',
        component: FavoriteNumbersComponent,
        canActivate: [ForceUpgradeGuard, InternetConnectionGuard, AppMaintenanceGuard],
    }
]