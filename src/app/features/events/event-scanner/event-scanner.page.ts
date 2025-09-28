import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { IonHeader } from "@ionic/angular/standalone";
import { IonicModule, NavController } from '@ionic/angular';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { DatePipe } from '@angular/common';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';

interface ScanHistory {
  guest: {
    id: string;
    name: string;
    companions: number;
  };
  scannedBy: {
    id: string;
    name: string;
  };
  event: {
    id: string;
    name: string;
  };
  date: string;
  quantity_scanned: number;
}

interface ScanResult {
  hasContent: boolean;
  content: string;
}

@Component({
  selector: 'app-event-scanner',
  templateUrl: './event-scanner.page.html',
  styleUrls: ['./event-scanner.page.scss'],
  standalone: true,
  imports: [...StandAloneModules],
  providers: [DatePipe]
})
export class EventScannerPage implements OnInit {

  scanResult: string = '';
  errorMessage: string = '';
  event: FestivaEvent | undefined;

  scanHistory: ScanHistory[] = [];

  isScanning: boolean = false;
  private scanning = false;
 isIos = Capacitor.getPlatform() === 'ios';

  private router = inject(Router);
  private alertCtrl = inject(AlertControllerService);
  private storageHelper = inject(StorageHelper);
  constructor() { }

  ngOnInit() {
    console.log('Event Scanner page initialized');
  }

  async ionViewWillEnter() {
    this.clearResults();
    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.event = state.event;

    await this.loadScanHistory();
  }

  private async loadScanHistory() {
    const scannerHistory = await this.storageHelper.getStorageKey<ScanHistory[]>(StorageKeys.SCANNER_HISTORY) || [];
    this.scanHistory = scannerHistory.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  ionViewWillLeave() {
    // Limpia siempre la UI si el usuario sale durante el escaneo
    document.body.classList.remove('scanner-active');
    this.isScanning = false;
    this.scanning = false;
  }

  async startQRScan() {
    console.log('Starting QR scan...');
  if (this.scanning) return; // evita llamadas duplicadas
    this.scanning = true;
    this.isScanning = true;
    this.scanResult = '';
    this.errorMessage = '';

    try {
      
      // Oscurece el fondo para mostrar la cámara sin toques detrás
      document.body.classList.add('scanner-active');

      const result: any = await CapacitorBarcodeScanner.scanBarcode({
        hint: 0,
        scanInstructions: 'Escanea el código QR',
        scanButton: false,
        scanText: 'Escanear',
        cameraDirection: 1, // <-- TRASERA (clave en iOS)
        scanOrientation: 1, // portrait
        // android: { scanningLibrary: 'zxing' },
        web: {
          showCameraSelection: true,
          scannerFPS: 30,
        },
      });

      // Normaliza posibles formas de respuesta entre plugins
      const content: string | undefined =
        result?.ScanResult ??
        result?.content ??
        (Array.isArray(result?.barcodes) ? result.barcodes[0]?.rawValue : undefined);

      // Muestra el background otra vez
      document.body.classList.remove('scanner-active');

      if (typeof content === 'string' && content.length > 0) {
        this.scanResult = content;

        // Pequeño delay para que iOS libere la sesión antes de navegar
        await this.sleep(150);

        await this.processScanResult(content);
      } else {
        // Cancelado o sin contenido no es error fatal
        this.errorMessage = 'Escaneo cancelado o sin contenido.';
      }

    } catch (error: any) {
      // OS-PLUG-BARC-0006 = cancelado por el SO/usuario
      if (error?.code === 'OS-PLUG-BARC-0006' || /cancel/i.test(error?.message)) {
        this.errorMessage = 'Escaneo cancelado.';
      } else {
        console.error('Error during scan:', error);
        this.errorMessage = 'Error al escanear el código QR';
      }

      // Asegura restaurar background
      document.body.classList.remove('scanner-active');
    } finally {
      this.isScanning = false;
      this.scanning = false;
    }
  }

  addToHistory(guestUid: string, ticketId: string) {
    // En producción, esto se haría con datos reales del servidor
    const newScan: ScanHistory = {
      guest: {
        id: guestUid,
        name: 'Invitado Escaneado',
        companions: 1
      },
      scannedBy: {
        id: 'current-user-id',
        name: 'Usuario Actual'
      },
      event: {
        id: this.event?.id || 'event-id',
        name: this.event?.name || 'Evento Actual'
      },
      date: new Date().toISOString(),
      quantity_scanned: 2
    };

    this.scanHistory.unshift(newScan);
  }

  async clearHistory() {

    //debo validar que para eliminar el historial la fecha del evento sea mayor a la fecha actual y la hora, porque el dia del evento no se puede eliminar nada, lo pueden hacer al otro dia del evento, el evento guarda event_Date y event_time
    const currentDate = new Date();
    const eventDate = new Date(this.event?.event_date || '');
    const eventTimeParts = (this.event?.event_time || '').split(':');
    if (eventTimeParts.length === 2) {
      eventDate.setHours(parseInt(eventTimeParts[0], 10), parseInt(eventTimeParts[1], 10), 0, 0);
    }

    if (currentDate < eventDate) {
      await this.alertCtrl.openFestivaAlert('warning', 'No permitido', 'No puedes borrar el historial de escaneos antes de que el evento haya finalizado.', false, 'OK');
      return;
    }
    

    await this.alertCtrl.openFestivaAlert('warning', 'Confirmar', '¿Estás seguro de que deseas borrar el historial de escaneos? Esta acción no se puede deshacer.', true, 'Cancelar', 'Borrar').then(async (result) => {
      if (result.action === 'confirm') {
        this.scanHistory = [];
        await this.storageHelper.removeStorageKey(StorageKeys.SCANNER_HISTORY);
        await this.alertCtrl.openFestivaAlert('success', 'Historial borrado', 'El historial de escaneos ha sido borrado exitosamente.', false, 'OK');
      }
    });
  }

  getInitials(guestName: string): string {
    const names = guestName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return date.toLocaleDateString('es-ES', options);
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };

    return date.toLocaleTimeString('es-ES', options);
  }

 async processScanResult(content: string) {
    try {

      // Expected format: eventId&ticketId
      const parts = content.split('&');

      if (parts.length >= 2) {
        const guestUid = parts[0];
        const ticketId = parts[1];

        // // Si quieres validar que pertenezca al evento actual descomenta:
        // if (scannedEventId !== this.event?.id) {
        //   this.errorMessage = 'Este código QR no pertenece a este evento';
        //   return;
        // }


        // Otro pequeño margen antes de navegar (iOS)
        await this.sleep(100);

        this.router.navigate(
          [`events/guest-verification/${guestUid}/${this.event?.id}`],
          { replaceUrl: true, state: { event: this.event } }
        );
      } else {
        this.errorMessage = 'Código QR inválido';
      }

    } catch (error) {
      console.error('Error processing scan result:', error);
      this.errorMessage = 'Error al procesar el código QR';
    }
  }

  async stopScan() {
    try {
      document.body.classList.remove('scanner-active');
      this.isScanning = false;
      this.scanning = false;
    } catch (error) {
      console.error('Error stopping scan:', error);
    }
  }

   clearResults() {
    this.scanResult = '';
    this.errorMessage = '';
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

   goBack() {
    // TODO: Implement navigation back
    this.router.navigate(['/events/management'], { state: { event: this.event }, replaceUrl: true });

  }
}