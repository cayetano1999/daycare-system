import { Component, inject } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { AppInBrowserService } from 'src/app/core/services/browser/app-in-browser.service';
import { environment } from 'src/environments/environment';
import { remoteConfig } from 'src/environments/environment.remoteconfig';

@Component({
  selector: 'app-force-update-modal',
  templateUrl: './force-update-modal.component.html',
  styleUrls: ['./force-update-modal.component.scss'],
  standalone: true,
  imports: [IonicModule]

})
export class ForceUpdateModalComponent {

  title: string = remoteConfig.SCREENS.FORCE_UPDATE.title;
  message: string = remoteConfig.SCREENS.FORCE_UPDATE.message;
  btnUpdateText: string = remoteConfig.SCREENS.FORCE_UPDATE.btnUpdateText;

  //services
  inAppBrowser = inject(AppInBrowserService);
  platForm = inject(Platform);

  constructor() { }


  async redirectToUpdate() {
    this.platForm.is('android') ? window.open(environment.URL_APP_ANDROID, '_system') : window.open(environment.URL_APP_IOS, '_system');
  }


}
