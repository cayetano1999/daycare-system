import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.kuidomobileapp',
  appName: 'Kuido',
  webDir: 'www/browser',
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
    
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.None 
    
    }
  },

  server: {
    cleartext: true,
    allowNavigation: ['35.202.111.227'],
  },
};

export default config;
