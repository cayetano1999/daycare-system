import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { FeatureFlagKey } from 'src/app/core/enums/featureFlag.enum';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { FeatureFlagHelper } from 'src/app/core/helpers/featureflag.helper';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { environment } from 'src/environments/environment';
import { remoteConfig } from 'src/environments/environment.remoteconfig';
@Component({
  selector: 'app-pre-home',
  templateUrl: './pre-home.page.html',
  styleUrls: ['./pre-home.page.scss'],
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PreHomePage implements OnInit, OnDestroy {
  //services
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly storageHelper = inject(StorageHelper);


  currentImageIndex = 0;
  showIntro = true;
  fadeOut = false;
  
  private imageInterval: any;
  private fadeTimer: any;
  private introTimer: any;
  private isOnboardingComplete: boolean = false;

  // Placeholder para los datos de Remote Config
  pageData: any = remoteConfig.SCREENS.PRE_HOME;
  availableAuths = {
    google: environment.AUTH_GOOGLE,
    apple: environment.AUTH_IOS,
    register: environment.AUTH_REGISTER,
    login: environment.AUTH_LOGIN,
  }

  async ngOnInit() {
    this.showIntro = !await this.storageHelper.getStorageKey(StorageKeys.PRE_HOME_ANIMATION_DONE);
    this.isOnboardingComplete = await this.storageHelper.getStorageKey(StorageKeys.ONBOARDING_COMPLETED);
    this.startAnimationSequence();
    // Aquí es donde deberías integrar la lógica para cargar los datos de Remote Config
    // Por ejemplo, un método como this.loadRemoteConfigData();
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  private startAnimationSequence() {
    // Cycle through images every 1 second
    this.imageInterval = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.pageData.images.length;
    }, 1000);

    // Start fade out after 4 seconds
    this.fadeTimer = setTimeout(() => {
      this.fadeOut = true;
    }, 4000);

    // Hide intro after 5 seconds
    this.introTimer = setTimeout(() => {
      this.showIntro = false;
      this.startMainImageRotation();
    }, 5000);
  }

  private startMainImageRotation() {
    // Continue cycling images in main view
    this.imageInterval = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.pageData.images.length;
    }, 1000);
  }

  private clearTimers() {
    if (this.imageInterval) {
      clearInterval(this.imageInterval);
    }
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
    }
    if (this.introTimer) {
      clearTimeout(this.introTimer);
    }
  }

  async loginWithGoogle() {
    // Implement Google login logic
    const { data, error } = await this.supabaseService.signInWithGoogle();
    if (error) {
      console.error('Error logging in with Google:', error);
    } else {
      // Check if onboarding is complete and navigate accordingly
    }
  }

  async loginWithApple() {
    const { data, error } = await this.supabaseService.signInWithApple();
    if (error) {
      console.error('Error logging in with Apple:', error);
    } else {
      // Check if onboarding is complete and navigate accordingly
      
    }
  }

  register() {
    this.router.navigate([RoutesApp.AUTH_REGISTER]);
    // Implement registration logic
  }

  login() {
    this.router.navigate([RoutesApp.AUTH_LOGIN]);
    // Implement login logic
  }

 

  async ionViewWillLeave() {
    this.clearTimers();
    this.showIntro = false;
    await this.storageHelper.setStorageKey(StorageKeys.PRE_HOME_ANIMATION_DONE, true);

  }

  openUrlTerms() {
    window.open(environment.URL_TERMS, '_system');
  }

  openPrivacyPolicy() {
    window.open(environment.URL_PRIVACY, '_system');
  }


}