import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

interface Guest {
  id: string;
  created_at: string;
  event_id: string;
  invited_by: string;
  group_id?: string;
  companions_number?: number;
  name: string;
  observation?: string;
  phone_number?: string;
  status: string;
  added_from_contact: boolean;
  table_id?: string;
  request_status: 'PENDING' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'SENT';
  group?: {
    id: string;
    name: string;
    color_exa: string;
  };
  table?: {
    id: string;
    name: string;
  };
}

interface Event {
  id: string;
  created_at: string;
  user_id: string;
  plan_type: string;
  event_date: string;
  status: string;
  name: string;
  description: string;
  image: string;
  share_text: string;
  url_media?: string;
  location: string;
}

@Component({
  selector: 'app-guest-verification',
  templateUrl: './guest-verification.page.html',
  styleUrls: ['./guest-verification.page.scss'],
  imports: [...StandAloneModules]
})
export class GuestVerificationPage {
  // Route parameters
  guestId: string = '';
  eventId: string = '';

  // Data
  guest: Guest | null = null;
  event: Event | null = null;
  eventState: Event | null = null;

  // States
  isLoading: boolean = true;
  verificationResult: 'success' | 'error' | 'not_found' | null = null;
  errorMessage: string = '';

  // Bonus: Confetti animation
  showConfetti: boolean = false;
  confettiArray = Array.from({ length: 50 }, (_, i) => i);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storageHelper = inject(StorageHelper);
  private supabaseService: SupabaseService = inject(SupabaseService);
  private readonly alertCtrl = inject(AlertControllerService);

  /**
   *
   */
  constructor() {
    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.eventState = state.event;
  }

  ionViewWillEnter() {
    this.route.params.subscribe(params => {
      this.guestId = params['guest_id'] || '';
      this.eventId = params['event_id'] || '';

      if (this.guestId && this.eventId) {
        this.verifyGuest();
      } else {
        this.handleError('Parámetros de URL inválidos');
      }
    });



  }

  async verifyGuest() {
    this.isLoading = true;
    this.verificationResult = null;

    const scannerHistory = await this.storageHelper.getStorageKey<any[]>(StorageKeys.SCANNER_HISTORY) || [];

    try {
      // Load guest and event in parallel
      const [guestResult, eventResult] = await Promise.all([
        this.loadGuest(),
        this.loadEvent()
      ]);

      if (!guestResult.success || !eventResult.success) {
        this.handleNotFound();
        return;
      }

      // Verify that guest belongs to the event
      if (this.guest?.event_id === this.event?.id) {
        this.handleSuccess();
        const userData = await this.storageHelper.getStorageKey<any>(StorageKeys.USER_DATA);

        //verificar si anteriormente se escaneo este invitado
        const alreadyScanned = scannerHistory.find((entry: any) => entry.guest.id === this.guest?.id && entry.event.id === this.event?.id);


        if(alreadyScanned?.quantity_scanned >= (this.guest?.companions_number || 0) + 1){
         await this.alertCtrl.openFestivaAlert('warning', 'Límite de escaneos alcanzado', `El invitado ${this.guest?.name} ya ha sido escaneado el número máximo de veces permitido (${alreadyScanned.quantity_scanned} veces).`, false, 'Aceptar', 'Ok');
         this.isLoading = false;
         return;
        }

        if (alreadyScanned) {
          // Incrementar la cantidad escaneada
          alreadyScanned.quantity_scanned += 1;
          alreadyScanned.date = new Date().toISOString(); // Actualizar la fecha al último escaneo
          alreadyScanned.guest = {
            ...alreadyScanned.guest,
          } // Actualizar el nombre por si acaso
          // Mover el registro al inicio del array
          const index = scannerHistory.indexOf(alreadyScanned);
          if (index > -1) {
            scannerHistory.splice(index, 1);
            scannerHistory.unshift(alreadyScanned);
          }
          await this.storageHelper.setStorageKey(StorageKeys.SCANNER_HISTORY, scannerHistory);
          return;
        }

        const newScannerEntry = {
          guest: {
            id: guestResult.success ? this.guest?.id : '',
            name: guestResult.success ? this.guest?.name : '',
            companions: guestResult.success ? this.guest?.companions_number : 0
          },
          scannedBy: {
            id: userData?.id || '',
            name: userData?.full_name || ''
          },
          event: {
            id: eventResult.success ? this.event?.id : '',
            name: eventResult.success ? this.event?.name : ''
          },
          date: new Date().toISOString(),
          quantity_scanned: 1
        };
        scannerHistory.unshift(newScannerEntry);
        await this.storageHelper.setStorageKey(StorageKeys.SCANNER_HISTORY, scannerHistory);

      } else {
        this.handleError('El invitado no pertenece a este evento');
      }

    } catch (error) {
      console.error('Error during verification:', error);
      this.handleError('Error interno del servidor');
    } finally {
      this.isLoading = false;
    }
  }

  private async loadGuest(): Promise<{ success: boolean }> {
    try {
      const { data, error }: any = await this.supabaseService.getRecord(
        'guests',
        [
          '*',
          'groups(id, name, color_exa)',
          'event_tables(id, name)'
        ],
        'id',
        this.guestId
      );

      if (error || !data) {
        console.error('Error loading guest:', error);
        return { success: false };
      }

      // Transform data to match interface
      this.guest = {
        ...data,
        group: data?.groups,
        table: data?.event_tables
      } as Guest;

      return { success: true };

    } catch (error) {
      console.error('Exception loading guest:', error);
      return { success: false };
    }
  }

  private async loadEvent(): Promise<{ success: boolean }> {
    try {
      const { data, error } = await this.supabaseService.getRecord(
        'events',
        ['*'],
        'id',
        this.eventId
      );

      if (error || !data) {
        console.error('Error loading event:', error);
        return { success: false };
      }

      this.event = data as any;
      return { success: true };

    } catch (error) {
      console.error('Exception loading event:', error);
      return { success: false };
    }
  }

  private handleSuccess() {

    this.verificationResult = 'success';
    this.errorMessage = '';

    // Bonus: Show confetti animation
    setTimeout(() => {
      this.showConfetti = true;
      setTimeout(() => {
        this.showConfetti = false;
      }, 3000);
    }, 500);
  }

  private handleError(message: string) {
    this.verificationResult = 'error';
    this.errorMessage = message;
  }

  private handleNotFound() {
    this.verificationResult = 'not_found';
    this.errorMessage = 'No se encontró la información solicitada';
  }

  // Helper methods
  getStatusClasses(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'VIEWED':
        return 'status-viewed';
      case 'CONFIRMED':
        return 'status-accepted';
      case 'REJECTED':
        return 'status-rejected';
      case 'SENT':
        return 'status-sent';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'VIEWED':
        return 'Visto';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'REJECTED':
        return 'Rechazado';
      case 'SENT':
        return 'Enviado';
      default:
        return 'Desconocido';
    }
  }

  formatEventDate(dateString: string | undefined): string {
    if (!dateString) return 'Fecha no disponible';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCurrentTimestamp(): string {
    return new Date().toLocaleString('es-ES');
  }

  // Bonus: Random position and delay for confetti
  getRandomPosition(): number {
    return Math.random() * 100;
  }

  getRandomDelay(): number {
    return Math.random() * 2;
  }

  // Actions
  retryVerification() {
    this.verifyGuest();
  }

  goBack() {
    if (this.event) {
      this.router.navigate([RoutesApp.EVENT_SCANNER], { state: { event: this.event }, replaceUrl: true });
    } else {
      this.router.navigate([RoutesApp.HOME], { replaceUrl: true });
    }
  }

  // Bonus: Share verification result
  shareResult() {
    if (navigator.share && this.verificationResult === 'success') {
      navigator.share({
        title: 'Verificación de Invitado',
        text: `${this.guest?.name} está verificado para ${this.event?.name}`,
        url: window.location.href
      }).catch(console.error);
    }
  }

  // Bonus: Print verification
  printVerification() {
    window.print();
  }

  // Bonus: Copy guest info to clipboard
  async copyGuestInfo() {
    if (!this.guest || !this.event) return;

    const info = `
Invitado: ${this.guest.name}
Evento: ${this.event.name}
Estado: ${this.getStatusText(this.guest.request_status)}
Fecha: ${this.formatEventDate(this.event.event_date)}
Verificado: ${new Date().toLocaleString('es-ES')}
    `.trim();

    try {
      await navigator.clipboard.writeText(info);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  }
}