import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
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
  imports:[...StandAloneModules]
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

  constructor(
    private alertController: AlertController,
    private navController: NavController,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.watchPasswordChanges();
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

  private async checkEmailExists(email: string): Promise<boolean> {
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
      const alert = await this.alertController.create({
        header: 'Formulario incompleto',
        message: 'Por favor, completa todos los campos requeridos correctamente.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    if (this.passwordsMatch === false) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden. Por favor, verifica e intenta nuevamente.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.isLoading = true;

    try {
      // 1. Check if email already exists
      const emailExists = await this.checkEmailExists(this.formData.email);
      
      if (emailExists) {
        const alert = await this.alertController.create({
          header: 'Email ya registrado',
          message: 'Este correo electrónico ya está registrado. ¿Quieres iniciar sesión en su lugar?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Iniciar sesión',
              handler: () => {
                // Navigate to login screen
                console.log('Navigate to login');
              }
            }
          ]
        });
        await alert.present();
        return;
      }

      // 2. Create account with Supabase
      await this.supabaseService.signUpWithEmail({
        email: this.formData.email,
        password: this.formData.password,
        full_name: this.formData.fullName.toUpperCase(), // Save name in uppercase
        phone: '' // We don't collect phone in this form
      });

      // 3. Success
      const alert = await this.alertController.create({
        header: '¡Cuenta creada!',
        message: 'Tu cuenta ha sido creada exitosamente. Bienvenido a Festiva.',
        buttons: [{
          text: 'Continuar',
          handler: () => {
            // Navigate to main app or onboarding
            console.log('Navigate to main app');
          }
        }]
      });
      await alert.present();
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Hubo un problema al crear tu cuenta. Por favor, intenta nuevamente.';
      
      if (error.message?.includes('already registered')) {
        errorMessage = 'Este correo electrónico ya está registrado.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'El formato del correo electrónico no es válido.';
      } else if (error.message?.includes('weak password')) {
        errorMessage = 'La contraseña no cumple con los requisitos de seguridad.';
      }
      
      const alert = await this.alertController.create({
        header: 'Error al registrarse',
        message: errorMessage,
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.navController.back();
  }
}