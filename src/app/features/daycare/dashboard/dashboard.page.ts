import { Component, inject, OnInit } from '@angular/core';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { EventSkeletonComponent } from 'src/app/shared/components/event-skeleton/event-skeleton.component';
import { IndicatorsBoardComponent } from 'src/app/shared/daycare/indicators-board/indicators-board.component';
import { AdminAppDirective } from 'src/app/shared/directives/admin-app.directive';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
    imports: [...StandAloneModules, IndicatorsBoardComponent, AdminAppDirective],
  
})
export class DashboardComponent  implements OnInit {

  supabaseService = inject(SupabaseService);
  storageHelper = inject(StorageHelper);
  alertCtrl = inject(AlertControllerService);
  dataForDashboard: any;


  constructor() { }

  ngOnInit() {}

  async ionViewWillEnter(){
    await this.getData();
  }

  async getData(){
   try {
      this.alertCtrl.openFestivaAlert('loading', 'Cargando datos del tablero...', 'por favor espera');
    const {data, error} = await this.supabaseService.getSupabase().rpc('get_dashboard_summary');
    console.log('data', data);
    this.dataForDashboard = data;
    this.alertCtrl.dismiss();
   } catch (error) {
     this.alertCtrl.dismiss();
     this.alertCtrl.openFestivaAlert('danger', 'Error', 'No se pudieron cargar los datos del tablero.');
   }
  }

}
