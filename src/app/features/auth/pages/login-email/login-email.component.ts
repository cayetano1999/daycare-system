import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { COLORS } from 'src/app/core/constants/constants';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoSocialLoginComponent } from 'src/app/shared/components/kuido-social-login/kuido-social-login.component';

@Component({
  selector: 'app-login-email',
  templateUrl: './login-email.component.html',
  styleUrls: ['./login-email.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, KuidoHeaderComponent, KuidoSocialLoginComponent]
})
export class LoginEmailComponent  implements OnInit {
  private formBuilder = inject(FormBuilder);
  private readonly statusBar = inject(StatusBarHelper);
  private readonly navCtrl = inject(NavController);
  

  constructor() { }

  ngOnInit() {}


  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  showPassword = signal(false);

  togglePassword() {
    this.showPassword.update(value => !value);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Form submitted', this.loginForm.value);
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
