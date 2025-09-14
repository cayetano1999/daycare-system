import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser'; // Usamos Capacitor Browser

@Injectable({
  providedIn: 'root'
})
export class AppInBrowserService {

  constructor() { }

  // Método para abrir un enlace en el navegador in-app
  public async openUrl(url: string): Promise<void> {
    try {
      // Abrir el enlace en el navegador in-app
      await Browser.open({ url: url, presentationStyle: 'fullscreen',  toolbarColor: '#282F33'  });
    } catch (error) {
      console.error('Error al abrir la URL en el navegador in-app:', error);
    }
  }


  // Método para cerrar el navegador in-app
  public async closeBrowser(): Promise<void> {
    try {
      await Browser.close();
    } catch (error) {
      console.error('Error al cerrar el navegador in-app:', error);
    }
  }
}
