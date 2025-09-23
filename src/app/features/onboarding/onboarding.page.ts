import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { Profile } from 'src/app/core/interface/profile.interface';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { remoteConfig } from 'src/environments/environment.remoteconfig';

interface Benefit {
  iconPath: string;
  text: string;
}

interface Stat {
  number: string;
  label: string;
}

interface Particle {
  left: number;
  top: number;
  delay: number;
}

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  imports:[StandAloneModules]
})
export class OnboardingPage implements OnInit, OnDestroy {
  currentStep = 0;
  touchStart: number | null = null;
  touchEnd: number | null = null;

  private confettiInterval: any;
  private confettiTimer: any;

  // Placeholder para los datos de Remote Config
  onboardingData = remoteConfig.SCREENS.ONBOARDING;

  particles: Particle[] = [];
  profile: Profile | null = null;

  private navController = inject(NavController);
  private storageHelper = inject(StorageHelper);
  private router = inject(Router);

  constructor() {}

  async ngOnInit() {
    this.generateParticles();
    this.startConfettiAnimation();

    this.profile = await this.storageHelper.getStorageKey(StorageKeys.USER_DATA);
    // Aquí es donde deberías integrar la lógica para cargar los datos de Remote Config
    // Por ejemplo, un método como this.loadRemoteConfigData();
  }

  ngOnDestroy() {
    this.clearConfettiTimers();
  }

  private generateParticles() {
    this.particles = Array.from({ length: 6 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2
    }));
  }

  private startConfettiAnimation() {
    if (this.currentStep === 0) {
      // Initial confetti burst
      this.confettiTimer = setTimeout(() => {
        this.triggerConfetti();
      }, 500);

      // Periodic confetti
      this.confettiInterval = setInterval(() => {
        this.triggerConfetti(true);
      }, 2000);
    }
  }

  private triggerConfetti(small = false) {
    // Since we can't use canvas-confetti in Ionic, we'll create CSS-based confetti
    // This is a placeholder for the confetti effect
  }

  private clearConfettiTimers() {
    if (this.confettiTimer) {
      clearTimeout(this.confettiTimer);
    }
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
    }
  }

  // Touch handlers for swipe navigation
  handleTouchStart(e: TouchEvent) {
    this.touchEnd = null;
    this.touchStart = e.touches[0].clientX;
  }

  handleTouchMove(e: TouchEvent) {
    this.touchEnd = e.touches[0].clientX;
  }

  handleTouchEnd() {
    if (!this.touchStart || !this.touchEnd) return;
    
    const distance = this.touchStart - this.touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && this.currentStep < 2) {
      this.nextStep();
    }
    if (isRightSwipe && this.currentStep > 0) {
      this.prevStep();
    }

   
  }

  getColorByStep(step: number): string {
    const colors = ['#2652d1', '#1c827c', '#9a2097'];
    return colors[step] || '#000000';
  }

  nextStep() {
    if (this.currentStep < this.onboardingData.steps.length - 1) {
      this.currentStep++;
      
      // Clear confetti when leaving first screen
      if (this.currentStep > 0) {
        this.clearConfettiTimers();
      }
    } else {
      this.onComplete();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      
      // Restart confetti if going back to first screen
      if (this.currentStep === 0) {
        this.startConfettiAnimation();
      }
    } else {
      this.goBack();
    }
  }

  async onComplete() {
    // Navigate to main app or dashboard
    // this.navController.navigateRoot('/dashboard');
    await this.storageHelper.setStorageKey(StorageKeys.ONBOARDING_COMPLETED, true);
    await this.router.navigate([RoutesApp.HOME]);
  }

  goBack() {
    this.navController.back();
  }

  trackByIndex(index: number): number {
    return index;
  }
  
  getBackgroundClass(index: number): string {
    const backgrounds = [
      'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700',
      'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700',
      'bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700'
    ];
    return backgrounds[index];
  }
}