import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoSocialLoginComponent } from 'src/app/shared/components/kuido-social-login/kuido-social-login.component';
import { LoginSelectorComponent } from '../../components/login-selector/login-selector.component';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';
import { COLORS } from 'src/app/core/constants/constants';
import { RoutesApp } from 'src/app/core/enums/routes.enum';

@Component({
  selector: 'app-login-preview',
  templateUrl: './login-preview.component.html',
  styleUrls: ['./login-preview.component.scss'],
  standalone: true,
  imports:[IonicModule, KuidoHeaderComponent, KuidoSocialLoginComponent, LoginSelectorComponent]
})
export class LoginPreviewComponent  implements OnInit {

  //Services
  private readonly statusBar = inject(StatusBarHelper);
  private readonly navCtrl = inject(NavController);

  constructor() { }

  ngOnInit() {}

  //Lifecycle methods
  async ionViewWillEnter() {
    await this.statusBar.setStatusBarStyle(COLORS.headerGreen);
  }

  goToEmailLogin() {
    // redirigir a login con email
    this.navCtrl.navigateForward(RoutesApp.LOGIN_EMAIL);
  }
  
  goToPhoneLogin() {
    // redirigir a login con teléfono
    this.navCtrl.navigateForward(RoutesApp.LOGIN_PHONE);
  }

}
