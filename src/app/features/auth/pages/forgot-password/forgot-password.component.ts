import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoSocialLoginComponent } from 'src/app/shared/components/kuido-social-login/kuido-social-login.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, KuidoHeaderComponent, KuidoSocialLoginComponent]
  
})
export class ForgotPasswordComponent  implements OnInit {

  //Services
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
        this.navCtrl.navigateRoot(RoutesApp.AUTH_OTP)
      }
    }

}
