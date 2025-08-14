import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { COLORS } from 'src/app/core/constants/constants';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoSocialLoginComponent } from 'src/app/shared/components/kuido-social-login/kuido-social-login.component';

@Component({
  selector: 'app-login-email',
  templateUrl: './login-email.component.html',
  styleUrls: ['./login-email.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, KuidoHeaderComponent, KuidoSocialLoginComponent]
})
export class LoginEmailComponent {

  private formBuilder = inject(FormBuilder);
  private readonly statusBar = inject(StatusBarHelper);
  private readonly navCtrl = inject(NavController);
  private readonly supabase = inject(SupabaseService);
  loading: boolean = false;
  error = '';
  constructor() { }



  loginForm = this.formBuilder.group({
    email: ['alamador@apap.com.do', [Validators.required, Validators.email]],
    password: ['Klkpapa123', [Validators.required, Validators.minLength(6)]]
  });

  showPassword = signal(false);

  togglePassword() {
    this.showPassword.update(value => !value);
  }

  async onSubmit() {
    if (this.loginForm.valid) {

      const { email, password } = this.loginForm.value;
      try {
        this.loading = true

        const { error } = await this.supabase.signIn(email as string, password as string);
        if (error) {
          this.error = error.message;
        } else {
          this.navCtrl.navigateRoot(RoutesApp.HOME);
        }
        

      } catch (error) {
        if (error instanceof Error) {
          alert(error.message)
        }
      } finally {
        this.loginForm.reset()
        this.loading = false
      }
      // Aquí iría tu lógica de login
    }
  }

  redirectForgotPassword() {
    this.navCtrl.navigateForward(RoutesApp.AUTH_FORGOT_PASSWORD);
  }

  redirectToRegister() {
    this.navCtrl.navigateForward(RoutesApp.AUTH_REGISTER);
  }
  
  //Lifecycle methods
  async ionViewWillEnter() {
    await this.statusBar.setStatusBarStyle(COLORS.headerGreen);
  }

}
