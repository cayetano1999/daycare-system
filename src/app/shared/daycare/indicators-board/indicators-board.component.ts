import { Component, OnInit } from '@angular/core';
import { EventSkeletonComponent } from 'src/app/shared/components/event-skeleton/event-skeleton.component';
import { AdminAppDirective } from 'src/app/shared/directives/admin-app.directive';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { IonContent, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  peopleCircleOutline,
  clipboardOutline,
  cashOutline,
  personAddOutline,
  cardOutline
} from 'ionicons/icons';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-indicators-board',
  templateUrl: './indicators-board.component.html',
  styleUrls: ['./indicators-board.component.scss'],
    imports: [...StandAloneModules, IonicModule],
  
})
export class IndicatorsBoardComponent  implements OnInit {

  constructor() {
    // addIcons({
    //   'people-outline': peopleOutline,
    //   'people-circle-outline': peopleCircleOutline,
    //   'clipboard-outline': clipboardOutline,
    //   'cash-outline': cashOutline,
    //   'person-add-outline': personAddOutline,
    //   'card-outline': cardOutline
    // });
  }

  ngOnInit() {}

}
