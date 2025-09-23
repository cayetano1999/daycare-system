import { Component, OnInit } from '@angular/core';
import { StandAloneModules } from '../../stand-alone-module';

@Component({
  selector: 'app-event-skeleton',
  templateUrl: './event-skeleton.component.html',
  styleUrls: ['./event-skeleton.component.scss'],
  standalone: true,
  imports: [...StandAloneModules]
})
export class EventSkeletonComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
