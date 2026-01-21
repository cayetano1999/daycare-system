import { Component, OnInit } from '@angular/core';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { ScheduleComponent } from "src/app/shared/daycare/shcedule/schedule.component";

@Component({
  selector: 'app-schedule-management',
  templateUrl: './schedule-management.component.html',
  styleUrls: ['./schedule-management.component.scss'],
  standalone: true,
  imports: [...StandAloneModules, ScheduleComponent]

})
export class ScheduleManagementComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
