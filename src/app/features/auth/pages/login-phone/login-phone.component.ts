import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { COLORS } from 'src/app/core/constants/constants';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoSocialLoginComponent } from 'src/app/shared/components/kuido-social-login/kuido-social-login.component';

@Component({
  selector: 'app-login-phone',
  templateUrl: './login-phone.component.html',
  styleUrls: ['./login-phone.component.scss'],
    standalone: true,
    imports: [IonicModule, FormsModule, ReactiveFormsModule, KuidoHeaderComponent, KuidoSocialLoginComponent]
})
export class LoginPhoneComponent  implements OnInit {

  //Services
    private readonly statusBar = inject(StatusBarHelper);
    private readonly navCtrl = inject(NavController);
  

  constructor() { }

  ngOnInit() {}

  private formBuilder = inject(FormBuilder);

  loginForm = this.formBuilder.group({
    phone: ['', [Validators.required, Validators.required]],
  });

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Form submitted', this.loginForm.value);
      // Aquí iría tu lógica de login
      this.navCtrl.navigateRoot(RoutesApp.AUTH_OTP);

    }
  }

  redirectToRegister() {
    this.navCtrl.navigateForward(RoutesApp.AUTH_REGISTER);
  }

  //Lifecycle methods
  async ionViewWillEnter() {
    await this.statusBar.setStatusBarStyle(COLORS.headerGreen);
  }


}
