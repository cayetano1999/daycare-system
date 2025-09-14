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
  private storageHelper = inject(StorageHelper)

  // Contact information
  whatsappNumber: string = '18093716874';

  // App information
  appVersion: string = '1.0.0';
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
  openPrivacyPolicy() {
    // TODO: Navigate to privacy policy page or open external link
    this.showToast('Función de Política de Privacidad en desarrollo', 'info');
  }

  openTermsAndConditions() {
    // TODO: Navigate to terms page or open external link
    this.showToast('Función de Términos y Condiciones en desarrollo', 'info');
  }

  shareApp() {

    const shareData = {
      title: 'Festiva - Gestión Profesional de Eventos',
      text: 'Descubre la mejor app para gestionar tus eventos y celebraciones especiales',
      url: window.location.origin
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => {
          this.showToast('¡Gracias por compartir Festiva!', 'success');
        })
        .catch((error) => {
          console.error('Error sharing app:', error);
          this.fallbackShare();
        });
    } else {
      this.fallbackShare();
    }
  }

  private fallbackShare() {
    // Fallback for browsers that don't support Web Share API
    const shareText = `¡Descubre Festiva! La mejor app para gestionar eventos y celebraciones especiales. ${window.location.origin}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText)
        .then(() => {
          this.showToast('Enlace copiado al portapapeles', 'success');
        })
        .catch(() => {
          this.showToast('Error al copiar enlace', 'error');
        });
    } else {
      // Even older fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showToast('Enlace copiado al portapapeles', 'success');
    }
  }

  // Support Section Methods
  leaveFeedback() {

    const feedbackEmail = 'feedback@festiva.com';
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

    const mailtoUrl = `mailto:${feedbackEmail}?subject=${subject}&body=${body}`;

    try {
      window.open(mailtoUrl, '_system');
    } catch (error) {
      console.error('Error opening email client:', error);
      this.showToast('No se pudo abrir el cliente de correo', 'error');
    }
  }

  rateInStore() {

    // Detect platform and open appropriate store
    if (this.platform.is('ios')) {
      // iOS App Store
      const appStoreUrl = 'https://apps.apple.com/app/festiva/id123456789'; // TODO: Replace with actual App Store ID
      window.open(appStoreUrl, '_system');
    } else if (this.platform.is('android')) {
      // Google Play Store
      const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.festiva.app'; // TODO: Replace with actual package name
      window.open(playStoreUrl, '_system');
    } else {
      // Web fallback
      this.showToast('¡Gracias! Califícanos cuando descargues la app móvil', 'info');
    }
  }

  reportBug() {

    const bugReportEmail = 'bugs@festiva.com';
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
- Versión de la app: ${this.appVersion}
- Plataforma: ${this.platform.platforms().join(', ')}
- Navegador: ${navigator.userAgent}
- Fecha y hora: ${new Date().toLocaleString('es-ES')}

Saludos,
[Tu nombre]
    `);

    const mailtoUrl = `mailto:${bugReportEmail}?subject=${subject}&body=${body}`;

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
    const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${message}`;

    try {
      window.open(whatsappUrl, '_system');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      this.showToast('No se pudo abrir WhatsApp', 'error');
    }
  }

  // Utility Methods
  private showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    // TODO: Implement proper toast notification

    // Simple alert fallback for now
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else if (type === 'success') {
      alert(`Éxito: ${message}`);
    } else {
      alert(message);
    }
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
    const result = await this.alertCtrl.confirmation(async () => {
      try {
        await this.clearAndRedirect();

      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        this.showToast('Error al cerrar sesión. Inténtalo de nuevo.', 'error');
      }

    },
      '¿Estás seguro de que deseas cerrar sesión?',
      'Cerrar Sesión',
      'Cerrar Sesión',
      () => {
      }
    );

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
    const data  = await this.supabaseService.getRecords('deleted_accounts', ['*'], 'user_id', user.id, 'created_at');

    if (data.error) {
      console.error('Error checking existing deletion request:', data.error);
      await this.alertCtrl.openFestivaAlert('danger', 'Error', 'No se pudo procesar tu solicitud. Inténtalo de nuevo más tarde.');
      return;
    }

    if (data) {
      await this.alertCtrl.openFestivaAlert('warning', 'Solicitud Pendiente', 'Ya tienes una solicitud de eliminación de cuenta pendiente. Nuestro equipo se pondrá en contacto contigo pronto.');
      return;
    }

    const confirmation = await this.alertCtrl.confirmation(async () => {
      const { data, error } = await this.supabaseService.createRecord('deleted_accounts', {
        user_id: user.id,
      });
      if (error) {
        console.error('Error requesting account deletion:', error);
        await this.alertCtrl.openFestivaAlert('danger', 'Error', 'No se pudo procesar tu solicitud. Inténtalo de nuevo más tarde.');
        return;
      }
      await this.alertCtrl.openFestivaAlert('success', 'Solicitud Enviada', 'Hemos recibido tu solicitud de eliminación de cuenta. Nuestro equipo se pondrá en contacto contigo pronto para completar el proceso.');
      // Optionally log out the user
      await this.clearAndRedirect();

    }, '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.', 'Eliminar Cuenta', 'Eliminar', () => {
    });

  }

  async clearAndRedirect() {
    await this.supabaseService.signOut();
    await this.storageHelper.setStorageKey(StorageKeys.ONBOARDING_COMPLETED, false);
    await this.storageHelper.clear();
    this.router.navigate([RoutesApp.PRE_HOME]);
  }
}