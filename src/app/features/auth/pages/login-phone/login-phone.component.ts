import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IonicModule, NavController, AlertController, LoadingController } from '@ionic/angular';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoSocialLoginComponent } from 'src/app/shared/components/kuido-social-login/kuido-social-login.component';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { SupabaseService } from '../../../../core/services/supabase.service';

@Component({
  selector: 'app-login-phone',
  templateUrl: './login-phone.component.html',
  styleUrls: ['./login-phone.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, KuidoHeaderComponent, KuidoSocialLoginComponent]
})
export class LoginPhoneComponent implements OnInit {

  private readonly navCtrl = inject(NavController);
  private readonly statusBar = inject(StatusBarHelper);
  private readonly formBuilder = inject(FormBuilder);
  private readonly supabaseService = inject(SupabaseService);
  private readonly alertController = inject(AlertController);
  private readonly loadingController = inject(LoadingController);

  loginForm = this.formBuilder.group({
    phone: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[1-9][0-9]{9,14}$/)
      ]
    ]
  });

  constructor() { }

  ngOnInit() { }

  async onSubmit() {
    // const phone = this.loginForm.value.phone!;

    // this.navCtrl.navigateForward(RoutesApp.AUTH_OTP, { state: { phone } }); // navigate to the enter code screen
    // return;
    // if (this.loginForm.invalid) return;

    const phone = this.loginForm.value.phone!;
    console.log('Phone number:', phone);
    const loading = await this.loadingController.create({ message: 'Sending OTP...' });
    await loading.present();

    try {
      const { error } = await this.supabaseService.getSupabase().auth.signInWithOtp({ phone });
      await loading.dismiss();
      if (error) {
        this.showAlert('Error', error.message);
      } else {
        this.showAlert('Success', 'OTP code has been sent to the number.');
        this.navCtrl.navigateForward(RoutesApp.AUTH_OTP, { state: { phone } }); // navigate to the enter code screen
      }
    } catch (err: any) {
      await loading.dismiss();
      this.showAlert('Unexpected Error', err.message || 'Please try again');
    }
  }

  redirectToRegister() {
    this.navCtrl.navigateForward(RoutesApp.AUTH_REGISTER);
  }

  async ionViewWillEnter() {
    await this.statusBar.setStatusBarStyle('#2e885d');
  }

  private async showAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
