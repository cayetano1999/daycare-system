import { Component, ElementRef, inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoSocialLoginComponent } from 'src/app/shared/components/kuido-social-login/kuido-social-login.component';
import { LoginSelectorComponent } from '../../components/login-selector/login-selector.component';
import { RoutesApp } from 'src/app/core/enums/routes.enum';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
    standalone: true,
    imports:[IonicModule, KuidoHeaderComponent, KuidoSocialLoginComponent, LoginSelectorComponent]
})
export class OtpComponent  implements OnInit {

  //Childs
  @ViewChildren('otp1, otp2, otp3, otp4') otpInputs!: QueryList<ElementRef>;

  //Sevices
  private readonly navCtrl = inject(NavController);
  
  ngOnInit(): void {
  }

  onKeyUp(event: KeyboardEvent, currentInput: HTMLInputElement, prevInput: HTMLInputElement | null, nextInput: HTMLInputElement | null) {
    const digit = currentInput.value;
    
    // Move to next input if a digit was entered
    if (digit && nextInput) {
      nextInput.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, currentInput: HTMLInputElement, prevInput: HTMLInputElement | null, nextInput: HTMLInputElement | null) {
    // Handle backspace
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
    return this.otpInputs?.toArray()
      .map(input => input.nativeElement.value)
      .join('') ?? '';
  }

  async verifyOTP() {
    const otp = this.getOTPValue();
    // Add your OTP verification logic here
    this.navCtrl.navigateRoot(RoutesApp.HOME);
    
    console.log('Verifying OTP:', otp);
  }

  async resendCode() {
    // Add your resend code logic here
    console.log('Resending code...');
  }

}
