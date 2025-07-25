import { Injectable } from '@angular/core';
import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';

@Injectable({
  providedIn: 'root',
})
export class FingerprintService {
  constructor() {}

  /**
   * Verifica si hay algún tipo de autenticación biométrica disponible.
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Retorna el tipo de autenticación biométrica disponible (FaceID, Fingerprint, etc.)
   */
  async getBiometryType(): Promise<BiometryType | null> {
    try {
      const result = await NativeBiometric.isAvailable();
      return result.biometryType || null;
    } catch (error) {
      console.error('Error getting biometric type:', error);
      return null;
    }
  }

  /**
   * Solicita al usuario autenticarse usando biometría (Face ID o Huella).
   * Retorna `true` si fue exitoso, `false` si falló o fue cancelado.
   */
  async authenticate(promptMessage = 'Authenticate to continue'): Promise<any> {
    try {
      const result = await NativeBiometric.verifyIdentity({
        reason: promptMessage,
        title: 'Biometric Authentication',
        subtitle: '',
        description: '',
      });
      return true;
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Guarda credenciales en almacenamiento seguro (opcional).
   */
  async storeCredentials(username: string, password: string): Promise<void> {
    try {
      await NativeBiometric.setCredentials({
        username,
        password,
        server: 'kuido-biometric-login',
      });
    } catch (error) {
      console.error('Error storing credentials:', error);
    }
  }

  /**
   * Intenta recuperar credenciales guardadas.
   */
  async getCredentials(): Promise<{ username: string; password: string } | null> {
    try {
      const credentials = await NativeBiometric.getCredentials({
        server: 'kuido-biometric-login',
      });

      return {
        username: credentials.username,
        password: credentials.password,
      };
    } catch (error) {
      console.warn('No credentials retrieved or cancelled:', error);
      return null;
    }
  }

  /**
   * Elimina las credenciales guardadas
   */
  async deleteCredentials(): Promise<void> {
    try {
      await NativeBiometric.deleteCredentials({ server: 'kuido-biometric-login' });
    } catch (error) {
      console.error('Error deleting credentials:', error);
    }
  }


  async enableBiometricLogin() {
    const verified = await this.authenticate('Enable biometric login');

    if (verified) {
      await this.storeCredentials('usuario@kuido.com', 'tu_contraseña');
      alert('Success');
    } else {
      alert('failed');
    }
  }
}
