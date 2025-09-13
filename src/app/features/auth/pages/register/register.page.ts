import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertController, NavController } from '@ionic/angular';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { Profile } from 'src/app/core/interface/profile.interface';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  gender: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [...StandAloneModules]
})
export class RegisterPage implements OnInit, OnDestroy {
  formData: FormData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    gender: ''
  };

  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  passwordsMatch: boolean | null = null;
  isPasswordValid = false;

  countries = [
    { code: 'AR', name: 'Argentina' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'HN', name: 'Honduras' },
    { code: 'MX', name: 'México' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'PA', name: 'Panamá' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Perú' },
    { code: 'DO', name: 'República Dominicana' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'ES', name: 'España' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'OTHER', name: 'Otro' }
  ];

  private passwordCheckTimer: any;
  user: Profile | null = null;
  isIos = Capacitor.getPlatform() === 'ios';

  private alertController = inject(AlertControllerService);
  private navController = inject(NavController);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private storageHelper = inject(StorageHelper);
  isFromProfile: boolean = false;;

  constructor(

  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.watchPasswordChanges();


    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.fromProfile) this.isFromProfile = state.fromProfile;

    if(state?.profile) {
      this.user = state.profile;
      this.mapFormToProfile();
    }

    console.log('isFromProfile:', this.isFromProfile);

  }



  mapFormToProfile() {
    this.formData = {
      id: this.user?.id || '',
      fullName: this.user?.full_name.toUpperCase(),
      email:  '',
      country: this.user?.country || '',
      gender: this.user?.gender || ''
    } as any;
  }

  ngOnDestroy() {
    if (this.passwordCheckTimer) {
      clearTimeout(this.passwordCheckTimer);
    }
  }

  private watchPasswordChanges() {
    setInterval(() => {
      // Validate password strength
      this.isPasswordValid = this.validatePasswordStrength(this.formData.password);

      // Check if passwords match
      if (this.formData.password && this.formData.confirmPassword) {
        this.passwordsMatch = this.formData.password === this.formData.confirmPassword;
      } else {
        this.passwordsMatch = null;
      }
    }, 300);
  }

  private validatePasswordStrength(password: string): boolean {
    if (!password || password.length < 6) return false;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  selectGender(gender: string) {
    this.formData.gender = this.formData.gender === gender ? '' : gender;
  }

  isFormValid(): boolean {

    if (this.isFromProfile) {
      // If updating profile, only fullName and email are required
      return !!(
        this.formData.fullName.trim()
      );
    }

    // If creating account, all fields are required
    return !!(
      this.formData.fullName.trim() &&
      this.formData.email.trim() &&
      this.isValidEmail(this.formData.email) &&
      this.isPasswordValid &&
      this.passwordsMatch === true
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public async checkEmailExists(email: string): Promise<boolean> {
    try {
      const supabase = this.supabaseService.getSupabase();
      const response = await supabase.functions.invoke('check-email-exists', {
        body: { email }
      });

      if (response.error) {
        console.error('Error checking email:', response.error);
        return false;
      }

      return response.data?.exists || false;
    } catch (error) {
      console.error('Error calling edge function:', error);
      return false;
    }
  }

  async onSubmit() {
    if (!this.isFormValid()) {
      await this.alertController.openFestivaAlert('warning', 'Formulario incompleto', 'Por favor, completa todos los campos requeridos correctamente.');
      return;
    }

    if (this.passwordsMatch === false) {
      await this.alertController.openFestivaAlert('warning', 'Error en contraseña', 'Las contraseñas no coinciden. Por favor, verifica e intenta nuevamente.');
      return;
    }

    this.isLoading = true;


    if(this.isFromProfile) {
      // Update profile logic here
      try {
        const updates: any = {
          full_name: this.formData.fullName.toUpperCase(),
          country: this.formData.country,
          gender: this.formData.gender
        }

       const {data, error} = await this.supabaseService.updateRecord('user_profiles', this.user?.id || '', updates );
        if(error) {
          await this.alertController.openFestivaAlert('danger', 'Error', 'Hubo un problema al actualizar tu perfil. Por favor, intenta nuevamente.');
          return;
        }
        if(data) {
          await this.storageHelper.setStorageKey(StorageKeys.USER_DATA, data);
        }
        await this.alertController.openFestivaAlert('success', 'Perfil actualizado', 'Tu perfil ha sido actualizado exitosamente.');
        this.navController.back();
      } catch (error) {
        await this.alertController.openFestivaAlert('danger', 'Error', 'Hubo un problema al actualizar tu perfil. Por favor, intenta nuevamente.');
      } finally {
        this.isLoading = false;
      }
      return;
    }

    try {
      // 1. Check if email already exists
      const emailExists = await this.checkEmailExists(this.formData.email);
      console.log('Email exists:', emailExists);

      if (emailExists) {
        await this.alertController.openFestivaAlert('warning', 'Correo ya registrado', 'El correo electrónico que ingresaste ya está registrado. Por favor, utiliza otro correo o inicia sesión.');
        return;
      }

      //2. Create account with Supabase
      await this.supabaseService.signUpWithEmail({
        email: this.formData.email,
        password: this.formData.password,
        full_name: this.formData.fullName.toUpperCase(), // Save name in uppercase
        phone: '' // We don't collect phone in this form
      });

      // 3. Success
      await this.alertController.openFestivaAlert('success', 'Cuenta creada', 'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.');

      // 4. Auto login
      await this.autoLoginWithEmailInSupabase();

    } 
    
    catch (error: any) {
      console.error('Registration error:', error);

      let errorMessage = 'Hubo un problema al crear tu cuenta. Por favor, intenta nuevamente.';

      if (error.message?.includes('already registered')) {
        errorMessage = 'Este correo electrónico ya está registrado.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'El formato del correo electrónico no es válido.';
      } else if (error.message?.includes('weak password')) {
        errorMessage = 'La contraseña no cumple con los requisitos de seguridad.';
      }

     await this.alertController.openFestivaAlert('danger', 'Error de registro', errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.navController.back();
  }

  async autoLoginWithEmailInSupabase() {
    const email = this.formData.email;
    const password = this.formData.password;

    const { data, error } = await this.supabaseService.signIn(email, password);
    if (error) {
      console.error('Auto login error:', error);
    } else {
      console.log('Auto login successful');
      console.log(data);
      if (data?.session) {
        this.supabaseService.getSupabase().auth.setSession(data.session);
        await this.storageHelper.setStorageKey(StorageKeys.SESSION_DATA, data.session);
        const profile = await this.supabaseService.profile();
        if (profile) {
          console.log('User profile data:', profile.data);
          await this.storageHelper.setStorageKey(StorageKeys.USER_DATA, profile.data);
        }
        this.router.navigate([RoutesApp.ONBOARDING]);
      }
    }
  }
}