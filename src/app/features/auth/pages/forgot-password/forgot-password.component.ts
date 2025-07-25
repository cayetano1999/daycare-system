import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ALERT_ICONS, REGEX } from 'src/app/core/constants/constants';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { passwordMatchValidator } from 'src/app/core/helpers/custom-validators.helper';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoSocialLoginComponent } from 'src/app/shared/components/kuido-social-login/kuido-social-login.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, KuidoHeaderComponent, KuidoSocialLoginComponent]
})
export class ForgotPasswordComponent implements OnInit {

  private readonly navCtrl = inject(NavController);
  private readonly supabaseService = inject(SupabaseService);
  private readonly alertCtrl = inject(AlertControllerService);
  private readonly formBuilder = inject(FormBuilder);

  showPasswordFields: boolean = false;
  showEmailField: boolean = true;

  loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    newPassword: ['', [Validators.required, Validators.pattern(REGEX.password)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordMatchValidator });

  ngOnInit() {}

  async onSubmit() {
    if (this.loginForm.invalid && this.showPasswordFields) {
      await this.alertCtrl.openModalAlertMessage('Please complete all required fields correctly.', 'Invalid Form', ALERT_ICONS.ERROR, 'alert');
      return;
    }

    const { email, newPassword } = this.loginForm.value || { email: '', newPassword: '' };

    if (this.showPasswordFields) {
      await this.changePassword(newPassword ?? '');
      return;
    }

    try {
      this.alertCtrl.openModalAlert();
      const result = await this.supabaseService.forgotPassword(email || '');
      console.log('OTP sent:', result);

      if (result.error) {
        await this.alertCtrl.openModalAlertMessage('Error sending OTP', result.error.message, ALERT_ICONS.ERROR, 'alert');
        return;
      }

      this.alertCtrl.dismiss();      
      await this.alertCtrl.openModalAlertMessage('If the email is registered, you will receive an OTP code. Please verify it now.', 'Check your email', ALERT_ICONS.SUCCESS, 'alert');

      const otpResult = await this.alertCtrl.openModalValidateOtp(email || '', true);
      console.log('OTP validated:', otpResult);

      if (otpResult?.success) {
        this.showPasswordFields = true;
        this.showEmailField = false;
      } else {
        await this.alertCtrl.openModalAlertMessage('The OTP code could not be verified. Please try again.', 'Invalid OTP', ALERT_ICONS.ERROR, 'alert');
      }

    } catch (error: any) {
      console.error('Error sending OTP:', error.message);
      await this.alertCtrl.openModalAlertMessage('Unexpected Error', error.message || 'Could not send the OTP.', ALERT_ICONS.ERROR, 'alert');
    }
  }

  async changePassword(newPassword: string) {
    if (!newPassword || this.loginForm.invalid) {
      await this.alertCtrl.openModalAlertMessage('Invalid Password', 'Make sure passwords match and meet all requirements.', ALERT_ICONS.ERROR, 'alert');
      return;
    }

    try {
      const { error } = await this.supabaseService.getSupabase().auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Error updating password:', error.message);
        await this.alertCtrl.openModalAlertMessage('Error changing password', error.message, ALERT_ICONS.ERROR, 'alert');
        return;
      }

      await this.alertCtrl.openModalAlertMessage('Success', 'Your password has been updated successfully.', ALERT_ICONS.SUCCESS, 'alert');
      this.navCtrl.navigateForward(RoutesApp.LOGIN_PREVIEW);

    } catch (err: any) {
      console.error('Unexpected error:', err);
      await this.alertCtrl.openModalAlertMessage('Unexpected Error', err.message || 'Could not update your password.', ALERT_ICONS.ERROR, 'alert');
    }
  }

}
