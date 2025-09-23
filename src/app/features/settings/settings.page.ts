import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { StandAloneModules } from '../../shared/stand-alone-module';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { AppInBrowserService } from 'src/app/core/services/browser/app-in-browser.service';
import { Share } from '@capacitor/share';
import { remoteConfig } from 'src/environments/environment.remoteconfig';
import { Device } from '@capacitor/device';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [...StandAloneModules]
})
export class SettingsPage implements OnInit {

  private router = inject(Router);
  private navCtrl = inject(NavController);
  private platform = inject(Platform);
  private alertCtrl = inject(AlertControllerService);
  private supabaseService = inject(SupabaseService);
  private storageHelper = inject(StorageHelper);
  private browser = inject(AppInBrowserService);

  // Contact information
  whatsappNumber: string = '18093716874';

  // App information
  appVersion: string = environment.APP_VERSION;
  appName: string = 'Festiva';
  isIos = Capacitor.getPlatform() === 'ios';

  constructor() { }

  ngOnInit() {
  }

  ionViewWillEnter() {
  }

  // Navigation
  goBack() {
    this.navCtrl.back();
  }

  // Legal Section Methods
  async openPrivacyPolicy() {
    // TODO: Navigate to privacy policy page or open external link
    await this.browser.openUrl(environment.URL_PRIVACY);
  }

  async openTermsAndConditions() {
    // TODO: Navigate to terms page or open external link
    await this.browser.openUrl(environment.URL_TERMS);
  }

  shareApp() {

    const shareData = {
      title: 'Festiva - Gestión Profesional de Eventos e Invitaciones Digitales',
      text: `🎊 Descubre la mejor app para gestionar tus eventos y celebraciones especiales \n\n Disponible en 🍎 ios: ${environment.URL_APP_IOS} \n Disponible en 🤖android: ${environment.URL_APP_ANDROID}`,
    };

    Share.share(shareData).then(() => {
      this.showToast('¡Gracias por compartir Festiva!', 'success');
    }).catch((error) => {
      console.error('Error sharing:', error);
      this.fallbackShare(shareData);
    });
  }

  private fallbackShare(shareData: { title: string; text: string }) {
    // Fallback for browsers that don't support Web Share API

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareData.text)
        .then(() => {
          this.showToast('Enlace copiado al portapapeles', 'success');
        })
        .catch(() => {
          this.showToast('Error al copiar enlace', 'error');
        });
    } else {
      // Even older fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareData.text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showToast('Enlace copiado al portapapeles', 'success');
    }
  }

  // Support Section Methods
  leaveFeedback() {

    const subject = encodeURIComponent('Feedback sobre Festiva');
    const body = encodeURIComponent(`
Hola equipo de Festiva,

Me gustaría compartir mi feedback sobre la aplicación:

[Escribe aquí tus comentarios y sugerencias]

Versión de la app: ${this.appVersion}
Dispositivo: ${this.platform.platforms().join(', ')}

Saludos,
[Tu nombre]
    `);

    const mailtoUrl = `mailto:${remoteConfig.CONTACTS.email}?subject=${subject}&body=${body}`;

    try {
      window.open(mailtoUrl, '_system');
    } catch (error) {
      console.error('Error opening email client:', error);
      this.showToast('No se pudo abrir el cliente de correo', 'error');
    }
  }

  rateInStore() {
    // Detect platform and open appropriate store
    // iOS App Store
    const appStoreUrl = this.isIos ? environment.URL_APP_IOS : environment.URL_APP_ANDROID; // TODO: Replace with actual App Store ID
    window.open(appStoreUrl, '_system');
  }

  async reportBug() {

    const subject = encodeURIComponent('Reporte de Error - Festiva');
    const body = encodeURIComponent(`
Hola equipo técnico de Festiva,

He encontrado un error en la aplicación:

DESCRIPCIÓN DEL ERROR:
[Describe detalladamente el problema]

PASOS PARA REPRODUCIR:
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

COMPORTAMIENTO ESPERADO:
[Qué esperabas que pasara]

COMPORTAMIENTO ACTUAL:
[Qué está pasando realmente]

INFORMACIÓN TÉCNICA:
- Versión de la app: ${environment.APP_VERSION}
- Plataforma: ${Capacitor.getPlatform()}
- Dispositivo: ${(await Device.getInfo()).manufacturer}
- Fecha y hora: ${new Date().toLocaleString('es-ES')}

Saludos,
[Tu nombre]
    `);

    const mailtoUrl = `mailto:${remoteConfig.CONTACTS.email}?subject=${subject}&body=${body}`;

    try {
      window.open(mailtoUrl, '_system');
    } catch (error) {
      console.error('Error opening email client:', error);
      this.showToast('No se pudo abrir el cliente de correo', 'error');
    }
  }

  // Contact Section Methods
  openWhatsApp() {

    const message = encodeURIComponent('Hola, me comunico desde la app Festiva. ¿Podrían ayudarme?');
    const whatsappUrl = `https://wa.me/${remoteConfig.CONTACTS.festiva_phone}?text=${message}`;

    try {
      window.open(whatsappUrl, '_system');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      this.showToast('No se pudo abrir WhatsApp', 'error');
    }
  }

  // Utility Methods
  private showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {

    const festivaType: 'success' | 'warning' | 'question' | 'danger' =
      type === 'error' ? 'danger'
        : type === 'info' ? 'question'
          : type;
    this.alertCtrl.openFestivaAlert(festivaType, message, '');
  }

  // Analytics Methods (for future implementation)
  private trackAction(action: string, category: string = 'Settings') {
    // TODO: Implement analytics tracking
  }

  // App Information Methods
  getAppInfo() {
    return {
      name: this.appName,
      version: this.appVersion,
      platform: this.platform.platforms().join(', '),
      userAgent: navigator.userAgent
    };
  }

  // Debug Methods (for development)
  debugInfo() {
  }

  async logOut() {

    const answer = await this.alertCtrl.openFestivaAlert('warning', 'Cerrar Sesión', '¿Estás seguro de que deseas cerrar sesión?', true, 'Cancelar', 'Cerrar Sesión');
    if(answer.action === 'confirm') {
        await this.clearAndRedirect();
    }

  }

  // Future Methods (placeholders)
  openNotificationSettings() {
    this.showToast('Configuración de notificaciones próximamente', 'info');
  }

  openLanguageSettings() {
    this.showToast('Configuración de idioma próximamente', 'info');
  }

  openThemeSettings() {
    this.showToast('Configuración de tema próximamente', 'info');
  }

  clearCache() {
    this.showToast('Caché limpiado exitosamente', 'success');
  }

  exportData() {
    this.showToast('Exportación de datos próximamente', 'info');
  }

  async deleteAccount() {
    const user = await this.storageHelper.getStorageKey(StorageKeys.USER_DATA);
    if (!user) {
      await this.alertCtrl.openFestivaAlert('danger', 'Error', 'No se encontró información de usuario. Por favor, inicia sesión de nuevo.');
      return;
    }
    //consultar si ya existe una solicitud de eliminación pendiente
    const existRecord: any = await this.supabaseService.getRecords('deleted_accounts', ['*'], 'user_id', user.id, 'created_at');

    if (existRecord.error) {
      console.error('Error checking existing deletion request:', existRecord.error);
      await this.alertCtrl.openFestivaAlert('danger', 'Error', 'No se pudo procesar tu solicitud. Inténtalo de nuevo más tarde.');
      return;
    }

    if (existRecord?.data.length > 0 || existRecord?.data || existRecord?.data.id) {
      await this.alertCtrl.openFestivaAlert('warning', 'Solicitud Pendiente', 'Ya tienes una solicitud de eliminación de cuenta pendiente. Nuestro equipo se pondrá en contacto contigo pronto.');
      return;
    }

    const confirmation = await this.alertCtrl.openFestivaAlert('warning', 'Confirmar Eliminación', '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible y se eliminarán todos tus datos.', true, 'Cancelar', 'Eliminar');

    if (confirmation.action === 'cancel') {
      return;
    }

    const { data, error } = await this.supabaseService.createRecord('deleted_accounts', {
      user_id: user.id,
    });
    if (error) {
      console.error('Error requesting account deletion:', error);
      await this.alertCtrl.openFestivaAlert('danger', 'Error', 'No se pudo procesar tu solicitud. Inténtalo de nuevo más tarde.');
      return;
    }
    await this.clearAndRedirect();
    await this.alertCtrl.openFestivaAlert('success', 'Solicitud Enviada', 'Hemos recibido tu solicitud de eliminación de cuenta. Nuestro equipo se pondrá en contacto contigo pronto para completar el proceso.');
    // Optionally log out the user

  }

  async clearAndRedirect() {
    await this.supabaseService.signOut();
    await this.storageHelper.setStorageKey(StorageKeys.ONBOARDING_COMPLETED, false);
    await this.storageHelper.clear();
    this.router.navigate([RoutesApp.PRE_HOME]);
  }
}