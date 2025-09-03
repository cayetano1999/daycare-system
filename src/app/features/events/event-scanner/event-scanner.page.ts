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
  imports:[...StandAloneModules]
})
export class EventScannerPage implements OnInit {
  eventId: string = 'event-1'; // TODO: Get from route params
  eventName: string = 'Boda de María y José'; // TODO: Get from event data
  
  isScanning: boolean = false;
  scanResult: string = '';
  errorMessage: string = '';
  event: FestivaEvent | undefined;

  private router = inject(Router);
  private navController = inject(NavController);

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.clearResults();
    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.event = state.event;
  }

  async startScan() {
    this.isScanning = true;
    this.scanResult = '';
    this.errorMessage = '';

    try {
      // Check permission before scanning
    

      // Hide background to show camera
      document.body.classList.add('scanner-active');
      
      // Start scanning
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: 0,
        scanInstructions: 'Escanea el código QR de la boleta',
        scanButton: true,
        scanText: 'Escanear',
        cameraDirection: 1,
        scanOrientation: 1,
        // android: {
        //   scanningLibrary: 'zxing',
        // },
        web: {
          showCameraSelection: true,
          scannerFPS: 30,
        },
      });

      // Show background again
      document.body.classList.remove('scanner-active');

      if (result.ScanResult) {
        this.scanResult = result.ScanResult;
        this.processScanResult(result.ScanResult);
      } else {
        this.errorMessage = 'No se pudo leer el código QR';
      }

    } catch (error) {
      console.error('Error during scan:', error);
      this.errorMessage = 'Error al escanear el código QR';
      
      // Make sure to show background again
      document.body.classList.remove('scanner-active');
    } finally {
      this.isScanning = false;
    }
  }

  async processScanResult(content: string) {
    try {
      console.log('Scanned QR content:', content);
      
      // Process the QR content
      // Expected format: eventId-ticketId
      const parts = content.split('-');
      
      if (parts.length >= 2) {
        const scannedEventId = parts[0];
        const ticketId = parts[1];
        
        // Verify if this QR belongs to the current event
        if (scannedEventId === this.eventId) {
          // Valid QR for this event
          this.showToast('Código QR válido para este evento', 'success');
          
          // TODO: Process ticket validation, mark as scanned, etc.
          console.log('Valid ticket ID:', ticketId);
          
        } else {
          this.errorMessage = 'Este código QR no pertenece a este evento';
        }
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
    } catch (error) {
      console.error('Error stopping scan:', error);
    }
  }

  clearResults() {
    this.scanResult = '';
    this.errorMessage = '';
  }


  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    // TODO: Implement toast notification
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  // Lifecycle cleanup
  ionViewWillLeave() {
    if (this.isScanning) {
      this.stopScan();
    }
  }

  goBack() {
    this.router.navigate([RoutesApp.MANAGE_EVENT], { state: { event: this.event }, replaceUrl: true });
  
  }
}
