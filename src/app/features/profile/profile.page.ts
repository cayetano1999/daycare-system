import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { SwiperOptions } from 'swiper/types';
import { CreditCard } from '../creditcard/pages/create-credit-card/create-credit-card.component';
import { CreditCardService } from 'src/app/core/services/credit-card.service';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { KuidoTabComponent } from 'src/app/shared/components/kuido-tab/kuido-tab.component';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { ALERT_ICONS } from 'src/app/core/constants/constants';
import { Preferences } from '@capacitor/preferences';
import { NativeBiometric } from 'capacitor-native-biometric';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, KuidoHeaderComponent, KuidoTabComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfilePage {

  private readonly navCtrl = inject(NavController);
  private readonly creditCardService = inject(CreditCardService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly storageHelper = inject(StorageHelper);
  private readonly alertCtrl = inject(AlertControllerService)

  slideOpts: SwiperOptions = { centeredSlides: true, pagination: true, slidesPerView: 1, autoplay: { delay: 5000, disableOnInteraction: false } };
  creditCards: CreditCard[] = [];
  profile: any = {};


  settingsItems = [
    {
      name: 'Notifications',
      icon: 'notifications-outline',
      hasToggle: true,
      hasChevron: false
    },
    {
      name: 'Change password',
      icon: 'key-outline',
      hasToggle: false,
      hasChevron: true
    },
    {
      name: 'Language',
      icon: 'globe-outline',
      hasToggle: false,
      hasChevron: true
    },
    {
      name: 'Terms and conditions',
      icon: 'document-text-outline',
      hasToggle: false,
      hasChevron: true
    }
  ];

  dangerItems = [
    {
      name: 'Deleted account',
      icon: 'person-remove-outline'
    },
    {
      name: 'Log out',
      icon: 'log-out-outline'
    }
  ];
  session!: any;
  biometricEnabled = false;


  constructor() { }

  async ionViewWillEnter() {
    this.loadCreditCards()
    const { data, error } = await this.supabaseService.profile();
    this.profile = data;
    console.log(this.profile);
    this.biometricEnabled = await this.storageHelper.getStorageKey(StorageKeys.BIOMETRIC_AUTH);
    console.log('Biometric Enabled:', this.profile);
  }

  redirectAddCard() {
    this.navCtrl.navigateRoot(RoutesApp.CREATE_CREDIT_CARD);
  }

  onFeatureSelected(feature: any) {
  }

  async logout() {
    try {
      const result = await this.alertCtrl.openModalAlertMessage(
        'Are you sure you want to log out?',
        'Log Out',
        ALERT_ICONS.QUESTION,
        'question',
      );

      if (result.success) {
        await this.supabaseService.signOut();
        await this.storageHelper.clear();
        this.navCtrl.navigateRoot(RoutesApp.LOGIN_PREVIEW);
      }

    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  onSlideChange(event: any) {
    // Reinicia la bandera después de procesar el evento
  }

  onUserInteractionStart() {
  }

  onUserInteractionEnd() {
  }

  onAutoPlayTriggered() {
  }

  async redirectToOption(option: any) {
  }

  async loadCreditCards() {
    this.creditCards = await this.creditCardService.getCreditCards();
  }

  async openUpdateProfile() {
    try {
      // Obtener sesión
      this.session = await this.supabaseService.getSession();
      if (!this.session || !this.session.user) {
        await this.alertCtrl.showSessionExpired(
          'Session Expired',
          'Please log in again to update your profile.',
          'OK'
        );
        return;
      }

      // Preparar datos actuales del perfil
      this.profile['id'] = this.session.user.id;
      this.profile['contact'] = this.session.user.email || this.session.user.phone;

      // Abrir modal de edición
      const result = await this.alertCtrl.openModalUpdateProfile(this.profile);
      if (!result) return;

      console.log('Updating profile:', result);

      // Mostrar cargando
      await this.alertCtrl.openModalAlert();

      // Actualizar perfil en Supabase
      const { data, error } = await this.supabaseService.updateRecord('profiles', this.profile.id, {
        full_name: result.full_name,
      });

      if (error) {
        await this.alertCtrl.dismiss();
        await this.alertCtrl.openModalAlertMessage(
          'An error occurred while updating your profile. Please try again later.',
          'Error',
          ALERT_ICONS.ERROR,
          'alert',
          'OK'
        );
        return;
      }

      // Ocultar cargando
      await this.alertCtrl.dismiss();
      await this.storageHelper.setStorageKey(StorageKeys.USER_FULL_NAME, result.full_name);

      // Mostrar éxito
      await this.alertCtrl.openModalAlertMessage(
        'Profile updated successfully',
        'Success',
        ALERT_ICONS.SUCCESS,
        'alert',
        'OK'
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      await this.alertCtrl.dismiss();
      await this.alertCtrl.openModalAlertMessage(
        'An error occurred while updating your profile. Please try again later.',
        'Error',
        ALERT_ICONS.ERROR,
        'alert',
        'OK'
      );
    }


  }

  async changeLanguage() {
    const result = await this.alertCtrl.openModalLanguage();
    if (result) {
      console.log('Selected language:', result);
      // Aquí puedes manejar el cambio de idioma
    }
  }

  getTabIcon(tab: string): string {
    switch (tab) {
      case 'home':
        return 'home-outline';
      case 'profile':
        return 'person-outline';
      case 'settings':
        return 'settings-outline';
      default:
        return 'help-circle-outline';
    }
  }

  async onBiometricToggle(event: any) {
    const checked = event.target.checked;

    if (checked) {
      const available = await NativeBiometric.isAvailable();
      if (!available.isAvailable) {
        alert('Biometric authentication is not available on this device.');
        return;
      }

      try {
        await NativeBiometric.verifyIdentity({
          reason: 'Enable biometric authentication',
          title: 'Authentication Required',
        }).then(async (result) => {

          await this.storageHelper.setStorageKey(StorageKeys.BIOMETRIC_AUTH, true);
          this.biometricEnabled = true;

          // Opcional: guardar credenciales biométricas
          // await NativeBiometric.setCredentials({ username, password, server: 'kuido-login' });
        });


      } catch (error) {
        console.warn('Authentication canceled or failed:', error);
        this.biometricEnabled = false;
      }
    } else {
      this.storageHelper.removeStorageKey(StorageKeys.BIOMETRIC_AUTH);
      this.biometricEnabled = false;

      // Opcional: eliminar credenciales
      await NativeBiometric.deleteCredentials({ server: 'kuido-biometric-login' });
    }
  }



}
