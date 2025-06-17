import { Component, inject, signal } from '@angular/core';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { COLORS } from 'src/app/core/constants/constants';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';
import { LoginHeaderComponent } from './components/login-header/login-header.component';
import { LoginFooterComponent } from './components/login-footer/login-footer.component';
import { KeyboardService } from 'src/app/core/services/keyboard/keyboard.service';
import { RouterOutlet } from '@angular/router';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    styleUrls: ['./auth.page.scss'],
    standalone: true,
    imports: [IonicModule, LoginHeaderComponent, LoginFooterComponent, CommonModule, RouterOutlet]
})
export class AuthPage {

  //Services
  private readonly statusBar = inject(StatusBarHelper);
  private readonly keyboardService = inject(KeyboardService);
  private readonly navCtrl = inject(NavController);
  private readonly alertService = inject(AlertControllerService);
  private readonly modalCtrl = inject(ModalController);

  //Properties
  animationReady = signal(false)
  isKeyboardVisible = signal(false);

  constructor() {

    this.keyboardService.keyboardVisible$.subscribe((isVisible) => {
      this.isKeyboardVisible.update(()=> isVisible);
    });
   }

   async handleLogin(event: any){
    this.alertService.openModalAlert('Login', 'Login success', 'Ok');
    setTimeout( async () => {
      await this.modalCtrl.dismiss();
      this.navCtrl.navigateRoot([RoutesApp.ONBOARDING]);
    }, 3000); 
   }

  //Lifecycle
  async ionViewWillEnter() {
    await this.statusBar.setStatusBarStyle(COLORS.green);
    setTimeout(() => {
      this.animationReady.update(()=> true);
    }, 1000);
   }

}
