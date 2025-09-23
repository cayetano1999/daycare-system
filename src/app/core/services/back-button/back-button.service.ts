import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { RoutesApp } from '../../enums/routes.enum';
import { AlertControllerService } from '../ionic/alert-controller.service';
import { AlertController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class BackButtonService {
  constructor() { }
  private readonly router = inject(Router)
  private readonly modalCtrl = inject(ModalController);
  private readonly alertCtrl = inject(AlertController);
  private readonly actionSheetCtrl = inject(ActionSheetController);
  private readonly customAlertCtrl = inject(AlertControllerService);
  private navCtrl = inject(NavController);


  public async backBtnManager(navegationHistory: string[]) {

    let fromSwitch = false;
    const currentUrl = this.router.url;

    try {
      const actionSheet = await this.actionSheetCtrl.getTop();
      if (actionSheet) {
        actionSheet.dismiss();
        return;
      }
    } catch (error) { }

    // 2. Cerrar Alerta si está abierta
    try {
      const alert = await this.alertCtrl.getTop();
      if (alert) {
        alert.dismiss();
        return;
      }
    } catch (error) { }

    // 3. Cerrar Modal si está abierto
    try {
      const modal = await this.modalCtrl.getTop();
      if (modal) {
        modal.dismiss();
        return;
      }
    } catch (error) { }


    if(currentUrl === '/onboarding') {
      return;
    }

    // 4. Si no hay overlays, manejar la navegación de la página
    if (currentUrl === '/dashboard' || currentUrl === '/') {
      // Si estamos en la página principal, salir de la app
      try {
        const result = await this.customAlertCtrl.openFestivaAlert('warning', '¿Salir de Festiva?', '¿Seguro que deseaas salir ?', true, 'No', 'Si');
        if (result.action === 'confirm') {
          App.exitApp();
        }
        return;
      }
      catch {

      }
    }

    if (currentUrl === '/events/management') {
      this.router.navigate([RoutesApp.HOME])
      return;
    }


    if (currentUrl.includes('/events/')) {
      const element = document.getElementById('btn-mng-back');
      if (element) {
        element.click();
        fromSwitch = true;
        return;
      }
    }


    // switch (currentUrl) {

    //   case '/events/':
    //     const element = document.getElementById('btn-mng-back');
    //     if (element) {
    //       element.click();
    //       fromSwitch = true;
    //       return;
    //     }
    //     break;

    // }

    // else {
    // Si no, simplemente retroceder
    // window.history.back();
    this.navCtrl.back();
    // }
  }





}
