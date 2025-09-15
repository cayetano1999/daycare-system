import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.festiva.app.mobile',
  appName: 'Festiva',
  webDir: 'www/browser',
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
    
  },
  ios: {
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.None 
    
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
    }
  }

 
};

export default config;
