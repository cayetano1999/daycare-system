import { inject, Injectable } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { CustomLoadingComponent } from 'src/app/shared/components/custom-loading/custom-loading.component';
import { ForceUpdateModalComponent } from 'src/app/shared/components/force-update-modal/force-update-modal.component';
import { ToastControllerService } from './toast-controller.service';
import { TopUpSuccessComponent } from 'src/app/shared/components/top-up-success/top-up-success.component';
import { UpdateProfileComponent } from 'src/app/shared/components/update-profile/update-profile.component';
import { AlertMessageComponent, AlertMessageType } from 'src/app/shared/components/alert-message/alert-message.component';
import { LanguageSelectorComponent } from 'src/app/shared/components/language-selector/language-selector.component';
import { CustomDialogComponent } from 'src/app/shared/components/custom-dialog/custom-dialog.component';
import { PushNotificationComponent } from 'src/app/shared/components/push-notification/push-notification.component';
@Injectable({
    providedIn: 'root'
})
export class AlertControllerService {

    private readonly toastCtrl = inject(ToastControllerService);
    private readonly alertController = inject(AlertController);
    private readonly modalCtrl = inject(ModalController);

    constructor() {
    }

    async confirmation(
        ok: (params?: any) => void,
        message: string,
        title: string,
        confirmText: string,
        cancel: (params?: any) => void,
        cancelTextBtn?: string,
    ) {

        const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: title,
            animated: true,
            message: message,
            mode: 'ios',
            buttons: [
                {
                    text: cancelTextBtn || 'Cancelar',
                    role: 'cancel',
                    cssClass: 'text-dark',
                    handler: () => {
                        cancel();
                    }
                }, {
                    text: confirmText,
                    handler: () => {
                        ok();
                    }
                }
            ],
            id: 'ionic-alert'
        });

        await alert.present();

    }

    async show(header: string, message: string, textbtn?: string) {
        const alert = await this.alertController.create({
            backdropDismiss: false,
            cssClass: 'my-custom-class',
            header: header,
            message: message,
            mode: 'ios',
            buttons: [
                {
                    text: textbtn || 'Ok',
                    handler: () => {
                    }
                },
            ],
            id: 'ionic-alert'


        });

        await alert.present();

        const { role } = await alert.onDidDismiss();
    }

    async showSessionExpired(header: string, message: string, textbtn?: string) {
        const alert = await this.alertController.create({
            backdropDismiss: false,
            cssClass: 'my-custom-class',
            header: header,
            message: message,
            mode: 'ios',
            buttons: [
                {
                    text: textbtn || 'Ok',
                    handler: () => {
                    }
                },
            ],
            id: 'ionic-alert-session-expired'


        });

        await alert.present();

        const { role } = await alert.onDidDismiss();
    }

    async error(header: string, message: string) {
        const alert = await this.alertController.create({
            backdropDismiss: false,
            cssClass: 'my-custom-class',
            header: header,
            message: message,
            mode: 'ios',
            buttons: [
                {
                    text: 'Ok',
                    cssClass: 'text-danger',
                    handler: () => {
                    }
                },
            ],
            id: 'ionic-alert'


        });


        await alert.present();

        await alert.onDidDismiss();
    }

    async dismiss() {
        const loadingModal = document.getElementById('modal-loading');
        if (loadingModal) {
            loadingModal.remove();
        }
        //remove the loading modal if exists

    }

    async openModalAlert(title?: string, message?: string, img?: string, btnClass?: string) {
        const modalLoading = await this.modalCtrl.create({
            component: CustomLoadingComponent,
            id: 'modal-loading',
            cssClass: 'backdrop-modal',
            backdropDismiss: false,
            componentProps: {
            }
        });
        setTimeout(async () => {
            const element = document.getElementById('modal-loading');
            if (element) {
                // this.toastCtrl.showToastError('Error al cargar la información');
                await this.modalCtrl.dismiss();
            }
        }, 60000);
        await modalLoading.present();

    }

    async openForceUpdateAlert() {
        const modalLives = await this.modalCtrl.create({
            component: ForceUpdateModalComponent,
            cssClass: 'backdrop-modal',
            backdropDismiss: false,
            componentProps: {
            },
            initialBreakpoint: 1,

        });
        await modalLives.present();
        const result = await modalLives.onDidDismiss();
    }


    async openModalUpdateProfile(profile: any) {
        const modal = await this.modalCtrl.create({
            component: UpdateProfileComponent,
            cssClass: '',
            componentProps: {
                profile
            },
            initialBreakpoint: 0.5,
            breakpoints: [0, 0.5, 1]
        });
        await modal.present();

        const result = await modal.onDidDismiss();
        return result.data;
    }

    async openModalAlertMessage(message: string, title: string, img?: string, type?: AlertMessageType, textConfirm?: string) {
        const modal = await this.modalCtrl.create({
            component: AlertMessageComponent,
            cssClass: 'backdrop-modal',
            componentProps: {
                message: message,
                title: title,
                img: img || '',
                type: type || 'alert',
                textConfirm: textConfirm || 'OK'
            },
        });
        await modal.present();
        const result = await modal.onDidDismiss();
        return result.data;

    }

    async openModalLanguage() {
        const modal = await this.modalCtrl.create({
            component: LanguageSelectorComponent,
            cssClass: 'backdrop-modal',
            componentProps: {
                languages: ['English', 'Spanish'],
                selectedLanguage: 'English'
            },
            initialBreakpoint: 0.5,
            breakpoints: [0, 0.5, 1]
        });
        await modal.present();
        const result = await modal.onDidDismiss();
        return result.data;
    }

    public async showAlert(title: string, message: string) {
        const alert = await this.alertController.create({
            header: title,
            message,
            buttons: ['OK']
        });
        await alert.present();
    }

    public async openFestivaAlert(type: 'success' | 'warning' | 'question' | 'danger' = 'success', title: string, message: string, showCancel: boolean = false, cancelText?: string, confirmText?: string) {

        const modal = await this.modalCtrl.create({
            component: CustomDialogComponent,
            cssClass: 'backdrop-modal',
            componentProps: {
            type,
            title,
            message,
            showCancel,
            cancelText: cancelText || 'Cancel',
            confirmText: confirmText || 'OK'
            },
        });
        await modal.present();
        const result = await modal.onDidDismiss();
        return result.data;

    }

     async openModalPushNotification() {
        const modalPushNotification = await this.modalCtrl.create({
            id: 'push_notification',
            cssClass: 'full-modal',
            component: PushNotificationComponent,
            backdropDismiss: false,
            presentingElement: await this.modalCtrl.getTop(), // si usas iOS-style modal stack
            backdropBreakpoint: 0,


        });
        //   await this.soundService.playAnswerReveal();
        await modalPushNotification.present();
        const result = await modalPushNotification.onDidDismiss();
        return result;
    }

}
