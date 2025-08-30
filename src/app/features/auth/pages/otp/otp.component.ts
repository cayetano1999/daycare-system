import { Component, ElementRef, inject, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { IonicModule, NavController, AlertController, ModalController } from '@ionic/angular';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoSocialLoginComponent } from 'src/app/shared/components/kuido-social-login/kuido-social-login.component';
import { LoginSelectorComponent } from '../../components/login-selector/login-selector.component';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/core/services/supabase.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
  standalone: true,
  imports: [IonicModule, KuidoHeaderComponent, KuidoSocialLoginComponent, LoginSelectorComponent]
})
export class OtpComponent implements OnInit {

  @ViewChildren('otp1, otp2, otp3, otp4, otp5, otp6') otpInputs!: QueryList<ElementRef>;


  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly supabaseService = inject(SupabaseService);
  private readonly alertController = inject(AlertController);
  private readonly modalCtrl = inject(ModalController);

  @Input() currentContact: string = '';
  resendAttempts: number = 0;
  resendTimer: number = 60;
  intervalId: any = null;
  canResend: boolean = false;
  @Input() isFromRecover: boolean = false;


  get getContactState() {
    return this.router.getCurrentNavigation()?.extras.state?.['phone'] || this.router.getCurrentNavigation()?.extras.state?.['email'] || '';
  }

  ngOnInit(): void {
    this.currentContact = this.getContactState || this.currentContact;
    this.startResendTimer();
  }

  onKeyUp(event: KeyboardEvent, currentInput: HTMLInputElement, prevInput: HTMLInputElement | null, nextInput: HTMLInputElement | null) {
    const digit = currentInput.value;

    if (digit && nextInput) {
      nextInput.focus();
    }

    // Auto-submit when last digit is filled
    if (!nextInput && digit && this.isOTPComplete()) {
      this.verifyOTP();
    }
  }


  onKeyDown(event: KeyboardEvent, currentInput: HTMLInputElement, prevInput: HTMLInputElement | null, nextInput: HTMLInputElement | null) {
    if (event.key === 'Backspace') {
      if (currentInput.value === '' && prevInput) {
        prevInput.focus();
        prevInput.value = '';
        event.preventDefault();
      }
    }
  }

  isOTPComplete(): boolean {
    return this.otpInputs?.toArray().every(input => input.nativeElement.value.length === 1) ?? false;
  }

  getOTPValue(): string {
    return this.otpInputs?.toArray().map(input => input.nativeElement.value).join('') ?? '';
  }

  async verifyOTP() {
    const otp = this.getOTPValue();
    const contact = this.currentContact;

    if (!otp || otp.length !== 6) {
      this.showAlert('Error', 'El código debe tener 6 dígitos.');
      return;
    }

    const params: any = {
      token: otp,
      type: this.isFromRecover || this.currentContact.includes('@') ? 'email' : 'sms',
      ...(this.isFromRecover || this.currentContact.includes('@')
      ? { email: contact }
      : { phone: contact })
    };

    try {
      console.log('Verifying OTP with params:', params);
      const { data, error } = await this.supabaseService.getSupabase().auth.verifyOtp(params);

      if (error) {
        this.showAlert('Error', error.message);
        return;
      }

      this.isFromRecover || this.getContactState.includes('@')
        ? this.modalCtrl.dismiss({ success: true })
        : this.navCtrl.navigateRoot(RoutesApp.HOME);

    } catch (err: any) {
      this.showAlert('Error', err.message || 'Unexpected error verifying OTP');
    }
  }


  //method to clear OTP inputs
  clearOTPInputs() {
    this.otpInputs?.forEach(input => {
      input.nativeElement.value = '';
      input.nativeElement.focus();
    });
  }
  async resendCode() {
    if (!this.canResend || this.resendAttempts >= 3) return;

    const contact = this.currentContact;
    const isEmail = this.isFromRecover;
    const payload = isEmail ? { email: contact } : { phone: '+' + contact };

    try {
      const { error } = await this.supabaseService.getSupabase().auth.signInWithOtp(payload);

      if (error) {
        this.showAlert('Error', error.message);
      } else {
        this.resendAttempts++;
        this.startResendTimer();
        this.clearOTPInputs();

        const contactType = isEmail ? 'email address' : 'phone number';
        this.showAlert(
          'OTP Sent',
          `If ${contact} is registered in Kuido App, you will receive an OTP code via your ${contactType}. Please verify it now.`
        );
      }

    } catch (err: any) {
      this.showAlert('Error', err.message || 'Failed to resend code');
    }
  }


  startResendTimer() {
    this.canResend = false;
    this.resendTimer = 60;
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.canResend = true;
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertController.create({ header: title, message, buttons: ['OK'] });
    await alert.present();
  }
} 
