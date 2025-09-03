import { Component, inject, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';
import { remoteConfig } from 'src/environments/environment.remoteconfig';
import { StandAloneModules } from '../../stand-alone-module';

@Component({
  selector: 'app-push-notification',
  templateUrl: './push-notification.component.html',
  styleUrls: ['./push-notification.component.scss'],
  standalone: true,
  imports: [...StandAloneModules]
})
export class PushNotificationComponent  implements OnInit {

  //properties
  pushNotificationScreen: any = remoteConfig.SCREENS.PUSH_NOTIFICATION;

  //services
  private readonly statusBar = inject(StatusBarHelper);
  private readonly modalCtrl = inject(ModalController);

  constructor() { }

  async ngOnInit() {
  }

  async activatePush(){
    this.modalCtrl.dismiss({status: false});    
  }

  declinePush() {
    this.modalCtrl.dismiss({status: false});
  }

}
