import { Component, inject, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { Router } from '@angular/router';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { NavController } from '@ionic/angular';
import { RoutesApp } from 'src/app/core/enums/routes.enum';

interface ScanResult {
  hasContent: boolean;
  content: string;
}

@Component({
  selector: 'app-event-scanner',
  templateUrl: './event-scanner.page.html',
  styleUrls: ['./event-scanner.page.scss'],
  standalone: true,
  imports: [...StandAloneModules]
})
export class EventScannerPage implements OnInit {
  eventId: string = 'event-1'; // TODO: Get from route params
  eventName: string = 'Boda de María y José'; // TODO: Get from event data

  isScanning: boolean = false;
  private scanning = false;

  scanResult: string = '';
  errorMessage: string = '';
  event: FestivaEvent | undefined;

  private router = inject(Router);
  private navController = inject(NavController);

  constructor(private supabaseService: SupabaseService) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.clearResults();
    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.event = state.event;
  }

  ionViewWillLeave() {
    // Limpia siempre la UI si el usuario sale durante el escaneo
    document.body.classList.remove('scanner-active');
    this.isScanning = false;
    this.scanning = false;
  }

  private async ensureCameraPermission(): Promise<boolean> {
    try {
      const status: any = await (CapacitorBarcodeScanner as any).checkPermissions?.();
      if (status?.camera === 'granted') return true;

      const req: any = await (CapacitorBarcodeScanner as any).requestPermissions?.();
      return req?.camera === 'granted';
    } catch {
      // Si el plugin no expone permisos, dejamos que iOS muestre el prompt igual
      return true;
    }
  }

  async startScan() {
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
        scanInstructions: 'Escanea el código QR de la boleta',
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

  async processScanResult(content: string) {
    try {
      console.log('Scanned QR content:', content);

      // Expected format: eventId&ticketId
      const parts = content.split('&');

      if (parts.length >= 2) {
        const scannedEventId = parts[0];
        const ticketId = parts[1];

        // Si quieres validar que pertenezca al evento actual descomenta:
        if (scannedEventId !== this.event?.id) {
          this.errorMessage = 'Este código QR no pertenece a este evento';
          return;
        }

        this.showToast('Código QR válido para este evento', 'success');

        // Otro pequeño margen antes de navegar (iOS)
        await this.sleep(100);

        this.router.navigate(
          [`events/guest-verification/${this.event?.id}/${ticketId}`],
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

  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    // TODO: Implementa tu toast real si lo necesitas
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  // Lifecycle cleanup
  // (si se estaba escaneando, ya se limpia en ionViewWillLeave)

  goBack() {
    this.router.navigate([RoutesApp.MANAGE_EVENT], { state: { event: this.event }, replaceUrl: true });
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
