import { Component, OnInit } from '@angular/core';
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

  constructor() { }

  ngOnInit() {}

}
