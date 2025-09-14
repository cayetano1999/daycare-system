import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.page.html',
  styleUrls: ['./otp-verification.page.scss'],
  imports: [...StandAloneModules]
})
export class OtpVerificationPage implements OnDestroy {
  @Input() email: string = '';
  @Input()password: string = '';
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  otp: string[] = ['', '', '', '', '', ''];
  isLoading = false;
  isResending = false;
  error = '';
  resendCooldown = 0;
  private cooldownTimer: any;

  navController = inject(NavController);
  alertController = inject(AlertController);
  supabaseService = inject(SupabaseService);
  private router = inject(Router);

  /**
   *
   */
  constructor() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      const { email, password } = navigation.extras.state['credentials'] || {};
      this.email = email;
      this.password = password;
    }
  }

  ionViewWillEnter() {
    // Auto-focus first input

    //get state


    setTimeout(() => {
      const firstInput = this.otpInputs?.first?.nativeElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 300);
  }

  ngOnDestroy() {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  handleInputChange(index: number, event: any) {
    const value = event.target.value;

    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      event.target.value = this.otp[index];
      return;
    }

    const newOtp = [...this.otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    this.otp = newOtp;
    this.error = '';

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = this.otpInputs.toArray()[index + 1]?.nativeElement;
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Auto-submit when all fields are filled
    if (this.isOtpComplete() && value) {
      setTimeout(() => {
        this.handleVerification();
      }, 100);
    }
  }

  handleKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      if (!this.otp[index] && index > 0) {
        // If current field is empty, go to previous field
        const prevInput = this.otpInputs.toArray()[index - 1]?.nativeElement;
        if (prevInput) {
          prevInput.focus();
        }
      } else {
        // Clear current field
        const newOtp = [...this.otp];
        newOtp[index] = '';
        this.otp = newOtp;
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = this.otpInputs.toArray()[index - 1]?.nativeElement;
      if (prevInput) {
        prevInput.focus();
      }
    } else if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = this.otpInputs.toArray()[index + 1]?.nativeElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || '';
    const newOtp = [...this.otp];

    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }

    this.otp = newOtp;

    // Focus the next empty field or the last field
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    const targetInput = this.otpInputs.toArray()[focusIndex]?.nativeElement;
    if (targetInput) {
      targetInput.focus();
    }

    // Auto-submit if all fields are filled
    if (pastedData.length === 6) {
      setTimeout(() => {
        this.handleVerification();
      }, 100);
    }
  }

  isOtpComplete(): boolean {
    return this.otp.every(digit => digit !== '');
  }

  async handleVerification() {
    if (!this.isOtpComplete()) {
      this.error = 'Por favor, completa todos los dígitos del código.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const otpCode = this.otp.join('');

      // Verify OTP with Supabase
      const { data, error } = await this.supabaseService.verifyEmailOtp(this.email, otpCode);

      if (error) {
        throw error;
      }

      // Success - show success message and navigate
      const alert = await this.alertController.create({
        header: '¡Verificación exitosa!',
        message: 'Tu cuenta ha sido verificada correctamente. Bienvenido a Festiva.',
        buttons: [{
          text: 'Continuar',
          handler: async () => {
            // Navigate to onboarding
            await this.autoLogin();
          }
        }]
      });
      await alert.present();

    } catch (error: any) {
      console.error('OTP verification error:', error);

      let errorMessage = 'Código incorrecto. Por favor, verifica e intenta nuevamente.';

      if (error.message?.includes('expired')) {
        errorMessage = 'El código ha expirado. Solicita uno nuevo.';
      } else if (error.message?.includes('invalid')) {
        errorMessage = 'Código inválido. Verifica e intenta nuevamente.';
      } else if (error.message?.includes('too_many_requests')) {
        errorMessage = 'Demasiados intentos. Espera un momento antes de intentar nuevamente.';
      }

      this.error = errorMessage;

      // Clear OTP and focus first input
      this.otp = ['', '', '', '', '', ''];
      setTimeout(() => {
        const firstInput = this.otpInputs?.first?.nativeElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    } finally {
      this.isLoading = false;
    }
  }

  async handleResendCode() {
    if (this.resendCooldown > 0 || this.isResending) return;

    this.isResending = true;
    this.error = '';

    try {
      // Resend OTP using Supabase
      const { error } = await this.supabaseService.sendEmailOtp(this.email);

      if (error) {
        throw error;
      }

      // Start cooldown
      this.resendCooldown = 60; // 60 seconds
      this.cooldownTimer = setInterval(() => {
        this.resendCooldown--;
        if (this.resendCooldown <= 0) {
          clearInterval(this.cooldownTimer);
        }
      }, 1000);

      // Show success message
      const alert = await this.alertController.create({
        header: 'Código reenviado',
        message: 'Hemos enviado un nuevo código de verificación a tu correo electrónico.',
        buttons: ['OK']
      });
      await alert.present();

    } catch (error: any) {
      console.error('Resend OTP error:', error);

      let errorMessage = 'No se pudo reenviar el código. Intenta nuevamente.';

      if (error.message?.includes('rate_limit')) {
        errorMessage = 'Has solicitado demasiados códigos. Espera un momento antes de intentar nuevamente.';
      }

      this.error = errorMessage;
    } finally {
      this.isResending = false;
    }
  }


  async autoLogin(){
    const { data, error } = await this.supabaseService.signIn(this.email, this.password);
    if (error) {
      console.error('Auto login error:', error);
    } else {
      if (data?.session) {
        this.supabaseService.getSupabase().auth.setSession(data.session);
      }
    }
  }

  goBack() {
    this.navController.back();
  }
}