import { Component, OnInit } from '@angular/core';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-indicators-board',
  templateUrl: './indicators-board.component.html',
  styleUrls: ['./indicators-board.component.scss'],
    imports: [...StandAloneModules, IonicModule],
  
})
export class IndicatorsBoardComponent  implements OnInit {

  constructor() {
  
  }

  ngOnInit() {}

}
