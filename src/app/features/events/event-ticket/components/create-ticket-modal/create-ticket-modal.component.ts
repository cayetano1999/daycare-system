import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

interface EventTicket {
  id: string;
  created_at: string;
  event_id: string;
  qr_code: string;
  ticket_type: string;
  url: string;
  gift_list_id?: string;
  name: string;
}

interface GiftList {
  id: string;
  name: string;
}

interface FormErrors {
  name?: string;
  ticketType?: string;
  url?: string;
}

interface TicketType {
  value: string;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-create-ticket-modal',
  templateUrl: './create-ticket-modal.component.html',
  styleUrls: ['./create-ticket-modal.component.scss'],
    imports: [...StandAloneModules]
  
})
export class CreateTicketModalComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() eventId: string = '';
  @Input() ticket?: EventTicket;
  @Input() giftLists: GiftList[] = [];
  @Input() event!: FestivaEvent | null;

  // Form data
  ticketName: string = 'Ticket del Evento';
  selectedTicketType: string = '';
  ticketUrl: string = '';
  includeGiftList: boolean = false;
  selectedGiftListId: string = '';

  // Ticket types
  ticketTypes: TicketType[] = [
    {
      value: 'Invitación',
      label: 'Invitación',
      description: 'Invitación formal para eventos especiales',
      icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
      value: 'Boleta',
      label: 'Boleta',
      description: 'Entrada para eventos con control de acceso',
      icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2H5zM5 21a2 2 0 01-2-2v-3a1 1 0 011-1h1a1 1 0 011 1v3a2 2 0 01-2 2H5zM19 5a2 2 0 012 2v3a1 1 0 01-1 1h-1a1 1 0 01-1-1V7a2 2 0 012-2h1zM19 21a2 2 0 002-2v-3a1 1 0 00-1-1h-1a1 1 0 00-1 1v3a2 2 0 002 2h1z'
    },
    {
      value: 'Invitación Única',
      label: 'Invitación Única',
      description: 'Invitación exclusiva de uso único',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
    }
  ];

  // Form validation
  errors: FormErrors = {};
  isSubmitting: boolean = false;

  constructor(
    private modalController: ModalController,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    if (this.mode === 'edit' && this.ticket) {
      this.ticketName = this.ticket.name;
      this.selectedTicketType = this.ticket.ticket_type;
      this.ticketUrl = this.ticket.url;
      this.includeGiftList = !!this.ticket.gift_list_id;
      this.selectedGiftListId = this.ticket.gift_list_id || '';
    }
  }

  selectTicketType(type: string) {
    this.selectedTicketType = type;
    this.validateField('ticketType');
  }

  toggleGiftList() {
    this.includeGiftList = !this.includeGiftList;
    if (!this.includeGiftList) {
      this.selectedGiftListId = '';
    }
  }

  selectGiftList(giftListId: string) {
    this.selectedGiftListId = giftListId;
  }

  validateField(field: string) {
    switch (field) {
      case 'name':
        if (!this.ticketName?.trim()) {
          this.errors.name = 'El nombre del ticket es requerido';
        } else if (this.ticketName.trim().length < 3) {
          this.errors.name = 'El nombre debe tener al menos 3 caracteres';
        } else if (this.ticketName.trim().length > 100) {
          this.errors.name = 'El nombre no puede exceder 100 caracteres';
        } else {
          delete this.errors.name;
        }
        break;

      case 'ticketType':
        if (!this.selectedTicketType) {
          this.errors.ticketType = 'Selecciona un tipo de ticket';
        } else {
          delete this.errors.ticketType;
        }
        break;

      case 'url':
        if (!this.ticketUrl?.trim()) {
          this.errors.url = 'La URL es requerida';
        } else if (!this.isValidUrl(this.ticketUrl.trim())) {
          this.errors.url = 'Ingresa una URL válida';
        } else {
          delete this.errors.url;
        }
        break;
    }
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validateForm(): boolean {
    this.validateField('name');
    this.validateField('ticketType');
    this.validateField('url');
    return Object.keys(this.errors).length === 0;
  }

  isFormValid(): boolean {
    return this.ticketName?.trim().length > 0 && 
           this.selectedTicketType.length > 0 &&
           this.ticketUrl?.trim().length > 0 &&
           Object.keys(this.errors).length === 0;
  }

  getInputClasses(field: string): string {
    const baseClasses = 'border-gray-300';
    const errorClasses = 'border-red-300';
    
    return this.errors[field as keyof FormErrors] ? errorClasses : baseClasses;
  }

  generateQRCode(): string {
    // Generate QR code content: eventId + ticketId (or random for new tickets)
    const ticketId = this.ticket?.id || this.generateRandomId();
    return `${this.event?.id || ''}-${ticketId}`;
  }

  generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  async handleSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    try {
      const ticketData = {
        name: this.ticketName.trim(),
        ticket_type: this.selectedTicketType,
        url: this.ticketUrl.trim(),
        event_id: this.event?.id || '',
        qr_code: this.generateQRCode(),
        gift_list_id: this.includeGiftList && this.selectedGiftListId ? this.selectedGiftListId : null
      } as any;

      if (this.mode === 'edit' && this.ticket) {
        // Update existing ticket
        const { data, error } = await this.supabaseService.updateRecord<Partial<EventTicket>>(
          'event_ticket',
          this.ticket.id,
          {
            name: ticketData.name,
            ticket_type: ticketData.ticket_type,
            url: ticketData.url,
            gift_list_id: ticketData.gift_list_id,
            event_id: ticketData.event_id
          }
        );

        if (error) {
          console.error('Error updating ticket:', error);
          this.showToast('Error al actualizar el ticket', 'error');
          return;
        }

      } else {
        // Create new ticket
        const { data, error } = await this.supabaseService.createRecord<Partial<EventTicket>>(
          'event_ticket',
          ticketData
        );

        if (error) {
          console.error('Error creating ticket:', error);
          this.showToast('Error al crear el ticket', 'error');
          return;
        }
      }

      // Close modal with success
      this.modalController.dismiss({
        success: true
      });

    } catch (error) {
      console.error('Error saving ticket:', error);
      this.showToast('Error al guardar el ticket', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  closeModal() {
    this.modalController.dismiss({
      success: false
    });
  }

  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    // TODO: Implement toast notification
  }
}