import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [...StandAloneModules]
})
export class LoginPage implements OnInit {

 // Propiedades del formulario
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;

  router = inject(Router);
  supabaseService = inject(SupabaseService);
  storageHelper = inject(StorageHelper);
  alertCtrl = inject(AlertControllerService);
  navCtrl = inject(NavController);

  constructor() { }

  ngOnInit() {
    // Inicialización del componente
    this.loadRememberedCredentials();
  }

  /**
   * Maneja el envío del formulario de login
   */
  onSubmit(): void {
    if (this.isValidForm()) {
      this.performLogin();
    }
  }

  /**
   * Valida si el formulario es válido
   * @returns boolean
   */
  private isValidForm(): boolean {
    return this.isValidEmail(this.email) && this.password.length >= 6;
  }

  /**
   * Valida el formato del email
   * @param email - Email a validar
   * @returns boolean
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Realiza el proceso de login
   */
  private performLogin(): void {
    this.isLoading = true;
    this.autoLoginWithEmailInSupabase();

  }

  async autoLoginWithEmailInSupabase() {

    await this.alertCtrl.openModalAlert();
      const email = this.email;
      const password = this.password;
  
      const { data, error } = await this.supabaseService.signIn(email, password);
      if (error) {
        console.error('Auto login error:', error);
        this.alertCtrl.dismiss();
        this.isLoading = false;
        await this.alertCtrl.openFestivaAlert('danger', 'No se pudo iniciar sesión', 'Verifica tus credenciales e intenta de nuevo.');
      } else {
        this.alertCtrl.dismiss();
        this.isLoading = false;

        if (data?.session) {
          this.supabaseService.getSupabase().auth.setSession(data.session);
          await this.storageHelper.setStorageKey(StorageKeys.SESSION_DATA, data.session);
          const profile = await this.supabaseService.profile();
          if (profile) {
            await this.storageHelper.setStorageKey(StorageKeys.USER_DATA, profile.data);
          }
          this.router.navigate([RoutesApp.ONBOARDING]);
        }
      }
    }
  /**
   * Maneja el login exitoso
   */
  private onLoginSuccess(): void {
    // Redirigir al dashboard o página principal
    // this.router.navigate(['/dashboard']);
    console.log('Login successful!');
  }

  /**
   * Maneja errores de login
   * @param error - Error recibido
   */
  private onLoginError(error: any): void {
    console.error('Login error:', error);
    // Aquí puedes mostrar un toast o mensaje de error
    // Por ejemplo: this.toastController.create({ message: 'Error al iniciar sesión', color: 'danger' })
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Navega a la página de registro
   */
  goToSignUp(): void {
    // this.router.navigate(['/signup']);
    console.log('Navigate to sign up');
    this.router.navigate([RoutesApp.AUTH_REGISTER]);
  }

  /**
   * Carga las credenciales guardadas si existen
   */
  private loadRememberedCredentials(): void {
    const savedEmail = localStorage.getItem('festiva_remembered_email');
    const savedRememberMe = localStorage.getItem('festiva_remember_me');
    
    if (savedEmail && savedRememberMe === 'true') {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }

  /**
   * Guarda las credenciales en localStorage
   */
  private saveCredentials(): void {
    localStorage.setItem('festiva_remembered_email', this.email);
    localStorage.setItem('festiva_remember_me', 'true');
  }

  /**
   * Limpia las credenciales guardadas
   */
  private clearSavedCredentials(): void {
    localStorage.removeItem('festiva_remembered_email');
    localStorage.removeItem('festiva_remember_me');
  }

  /**
   * Limpia el formulario
   */
  clearForm(): void {
    this.email = '';
    this.password = '';
    this.rememberMe = false;
    this.showPassword = false;
  }

  /**
   * Maneja el evento de presionar Enter en los inputs
   * @param event - Evento del teclado
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.isValidForm()) {
      this.onSubmit();
    }
  }

  /**
   * Obtiene el estado del formulario para debugging
   * @returns Objeto con el estado actual
   */
  getFormState(): any {
    return {
      email: this.email,
      password: this.password ? '***' : '',
      rememberMe: this.rememberMe,
      showPassword: this.showPassword,
      isLoading: this.isLoading,
      isValid: this.isValidForm()
    };
  }

  /**
   * Resetea el estado de carga (útil para manejo de errores)
   */
  resetLoadingState(): void {
    this.isLoading = false;
  }

  /**
   * Valida un campo específico
   * @param field - Campo a validar
   * @returns boolean
   */
  isFieldValid(field: string): boolean {
    switch (field) {
      case 'email':
        return this.isValidEmail(this.email);
      case 'password':
        return this.password.length >= 6;
      default:
        return false;
    }
  }

  /**
   * Obtiene el mensaje de error para un campo
   * @param field - Campo del cual obtener el error
   * @returns string con el mensaje de error
   */
  getFieldError(field: string): string {
    switch (field) {
      case 'email':
        if (!this.email) return 'El correo electrónico es requerido';
        if (!this.isValidEmail(this.email)) return 'Ingresa un correo electrónico válido';
        return '';
      case 'password':
        if (!this.password) return 'La contraseña es requerida';
        if (this.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        return '';
      default:
        return '';
    }
  }

  back() {
    this.navCtrl.back();
  }
}

