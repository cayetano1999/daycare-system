import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { REGEX } from 'src/app/core/constants/constants';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { passwordMatchValidator } from 'src/app/core/helpers/custom-validators.helper';
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
export class ForgotPasswordComponent  implements OnInit {

  //Services
  private readonly navCtrl = inject(NavController);
  private readonly supabaseService = inject(SupabaseService);

  constructor() { }

  ngOnInit() {}

    private formBuilder = inject(FormBuilder);
  
    loginForm = this.formBuilder.nonNullable.group({
      email: ['alejandroa.mercedes@gmail.com', [Validators.required, Validators.email]],
      newPassword: ['klkpapa', [Validators.required, Validators.pattern(REGEX.password)]],
      confirmPassword: ['Klkpapa123', [Validators.required]],
    }, { validators: passwordMatchValidator });
  
    async onSubmit() {
      console.log('Form submitted', this.loginForm);

      debugger
      if (this.loginForm.valid) {
        console.log('Form submitted', this.loginForm.value);
        // Aquí iría tu lógica de login
        const {data, error} = await this.supabaseService.forgotPassword(this.loginForm.value.email as string);
        if(error==null){
          this.navCtrl.navigateRoot(RoutesApp.AUTH_OTP)
        }
      }
    }

}
