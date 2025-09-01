import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { Profile } from 'src/app/core/interface/profile.interface';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

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

  benefits: Benefit[] = [
    { 
      iconPath: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", 
      text: "Administración completa de eventos" 
    },
    { 
      iconPath: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z", 
      text: "Control de invitados en tiempo real" 
    },
    { 
      iconPath: "M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z", 
      text: "Gestión de listas de regalos" 
    },
    { 
      iconPath: "M13 10V3L4 14h7v7l9-11h-7z", 
      text: "Seguimiento y estadísticas" 
    }
  ];

  stats: Stat[] = [
    { number: "50K+", label: "Eventos administrados" },
    { number: "200K+", label: "Invitaciones gestionadas" },
    { number: "98%", label: "Satisfacción" }
  ];

  particles: Particle[] = [];
  profile: Profile | null = null;

  private navController = inject(NavController);
  private storageHelper = inject(StorageHelper);

  constructor() {}

  async ngOnInit() {
    this.generateParticles();
    this.startConfettiAnimation();

    this.profile = await this.storageHelper.getStorageKey(StorageKeys.USER_DATA);
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
    console.log('Confetti triggered!', small ? 'small' : 'large');
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

  nextStep() {
    if (this.currentStep < 2) {
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
    console.log('Onboarding completed');
    // this.navController.navigateRoot('/dashboard');
    await this.storageHelper.setStorageKey(StorageKeys.ONBOARDING_COMPLETED, true);

  }

  goBack() {
    this.navController.back();
  }

  trackByIndex(index: number): number {
    return index;
  }
}