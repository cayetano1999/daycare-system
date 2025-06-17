import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { COLORS, ANALITYCS_EVENTS } from 'src/app/core/constants/constants';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { AppInBrowserService } from 'src/app/core/services/browser/app-in-browser.service';
import { FirebaseAnalyticsService } from 'src/app/core/services/firebase/firebase-analytics.service';
import { remoteConfig } from 'src/environments/environment.remoteconfig';
import {ProgressBarModule} from 'primeng/progressbar';
@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [IonicModule, ProgressBarModule]
})
export class OnboardingPage  implements OnInit {


  // Properties
  onboardingScreenText: any = remoteConfig.SCREENS.ONBOARDING;
  currentSlide = this.onboardingScreenText.slides[0];
  index: number = 0;
  animationClass: string = ''; 

  // Services
  statusBarHelper = inject(StatusBarHelper);
  router = inject(Router);
  storageHelper = inject(StorageHelper);
  browserInfo = inject(AppInBrowserService);
  analitycsService = inject(FirebaseAnalyticsService);  

  constructor() { }

  ngOnInit() { }

  async ionViewWillEnter() {
    await this.statusBarHelper.setStatusBarStyle(COLORS.white);
  }

  nextSlide() {
    if (this.index < this.onboardingScreenText.slides.length - 1) {
      this.index++;
      this.currentSlide = this.onboardingScreenText.slides[this.index];
      this.resetAnimation('animate__animated animate__backInRight');
    }
  }

  backslide() {
    if (this.index > 0) {
      this.index--;
      this.currentSlide = this.onboardingScreenText.slides[this.index];
      this.resetAnimation('animate__animated animate__backInLeft');
    }
  }

  private resetAnimation(animation: string) {
    this.animationClass = ''; // Elimina la clase de animación
    setTimeout(() => {
      this.animationClass = animation; // Vuelve a agregar la clase después de un breve intervalo
    }, 10); // 10ms es suficiente para reiniciar la animación
  }

  goToHome(skip: boolean) {
    // skip ? this.analitycsService.logEvents(ANALITYCS_EVENTS.skipOnboarding, {current_slide:  this.currentSlide}) : this.analitycsService.logEvents(ANALITYCS_EVENTS.completeOnboarding);
    this.storageHelper.setStorageKey(StorageKeys.ONBOARDING_COMPLETED, true);
    this.router.navigate([RoutesApp.HOME]);
  }

  redirectTermsAndConditions() {
    // this.analitycsService.logEvents(ANALITYCS_EVENTS.clickTermsAndConditions);
    this.browserInfo.openUrl(remoteConfig.ENVIRONMENTS.URL_TERMS);
  }

  fillProgressBar() { 
    return (this.index + 1) * 100 / this.onboardingScreenText.slides.length;
  }
}
