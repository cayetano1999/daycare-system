import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoSocialLoginComponent } from 'src/app/shared/components/kuido-social-login/kuido-social-login.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, KuidoHeaderComponent, KuidoSocialLoginComponent]
})
export class RegisterComponent implements OnInit {

  private readonly supabaseService = inject(SupabaseService);
  private readonly navCtrl = inject(NavController);
  private readonly alertCtrl = inject(AlertControllerService);
  private readonly storageHelper = inject(StorageHelper);
  constructor() { }

  ngOnInit() { }

  private formBuilder = inject(FormBuilder);

  loginForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirm: ['', [Validators.required, Validators.minLength(6)]],
  });

  showPassword = signal(false);
  showPasswordConfirm = signal(false);


  togglePassword() {
    this.showPassword.update(value => !value);
  }

  togglePasswordConfirm() {
    this.showPasswordConfirm.update(value => !value);
  }

  // onSubmit() {
  //   if (this.loginForm.valid) {
  //     console.log('Form submitted', this.loginForm.value);
  //     // Aquí iría tu lógica de login
  //   }
  // }

  loginViaGoogle() {
    this.supabaseService.signInWithGoogle().then((result) => {
      console.log(result);
    }).catch((error) => {
      console.error(error);
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { name, email, password, phone } = this.loginForm.value as any;
      this.supabaseService.signUpWithEmail({ email, password, full_name: name.toString().toUpperCase(), phone }).then(async (result) => {
        console.log(result);
        this.alertCtrl.openModalAlertMessage('Success', 'OTP code has been sent to email.', 'assets/img/shared/check.svg');
        this.navCtrl.navigateRoot(RoutesApp.AUTH_OTP, { state: { phone: email } }); // navigate to the enter code screen
        await this.storageHelper.setStorageKey(StorageKeys.USER_FULL_NAME, name.toString().toUpperCase());

      }).catch((error) => {
        console.error(error);
        alert('Error al registrar usuario');
      });
    }
  }


}
