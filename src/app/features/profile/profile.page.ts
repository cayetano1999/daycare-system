import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { SwiperOptions } from 'swiper/types';
import { CreditCard } from '../creditcard/pages/create-credit-card/create-credit-card.component';
import { CreditCardService } from 'src/app/core/services/credit-card.service';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, KuidoHeaderComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfilePage {

  private readonly navCtrl = inject(NavController);
  private readonly creditCardService = inject(CreditCardService);

  slideOpts: SwiperOptions = { centeredSlides: true, pagination: true, slidesPerView: 1, autoplay: { delay: 5000, disableOnInteraction: false } };
  creditCards: CreditCard[] = [];


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

  constructor() {}

  ionViewWillEnter() {
    this.loadCreditCards()
  }

  redirectAddCard() {
    this.navCtrl.navigateRoot(RoutesApp.CREATE_CREDIT_CARD);
  }

    onFeatureSelected(feature: any) {
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

  async loadCreditCards(){
   this.creditCards = await this.creditCardService.getCreditCards();
  }
}
