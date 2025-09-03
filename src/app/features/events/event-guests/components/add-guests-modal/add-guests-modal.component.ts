import { Component, inject, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { Guest } from '../../event-guests.page';
import { Profile } from 'src/app/core/interface/profile.interface';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { FestivaEvent } from 'src/app/core/interface/event.interface';

interface Group {
  id: string;
  name: string;
  color_exa: string;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  available?: number; // Espacios disponibles
}

interface FormErrors {
  name?: string;
  table?: string;
}

@Component({
  selector: 'app-add-guests-modal',
  templateUrl: './add-guests-modal.component.html',
  styleUrls: ['./add-guests-modal.component.scss'],
  imports: [...StandAloneModules]
})
export class AddGuestModalComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() event: FestivaEvent | null = null;
  @Input() guest?: Guest;
  @Input() groups: Group[] = [];
  @Input() tables: Table[] = [];
  @Input() user?: Profile;

  // Form data
  guestName: string = '';
  phoneNumber: string = '';
  companionsNumber: number | null = null;
  selectedGroupId: string = '';
  selectedTableId: string = '';
  observation: string = '';

  // Table management
  availableTables: Table[] = [];
  originalTableId: string = ''; // Para restaurar disponibilidad en edición

  // Form validation
  errors: FormErrors = {};
  isSubmitting: boolean = false;
  isLoadingTables: boolean = false;

  private readonly alertCtrl = inject(AlertControllerService)

  constructor(
    private modalController: ModalController,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    console.log('AddGuestModalComponent initialized with mode:', this.event);
    if (this.mode === 'edit' && this.guest) {
      this.guestName = this.guest.name;
      this.phoneNumber = this.guest.phone_number || '';
      this.companionsNumber = this.guest.companions_number || null;
      this.selectedGroupId = this.guest.group_id || '';
      this.selectedTableId = this.guest.table_id || '';
      this.originalTableId = this.guest.table_id || '';
      this.observation = this.guest.observation || '';
    }

    await this.loadTablesWithAvailability();
  }

  async loadTablesWithAvailability() {
    this.isLoadingTables = true;
    
    try {
      // Cargar todas las mesas del evento
      const { data: tablesData, error: tablesError } = await this.supabaseService.getRecords<Table>(
        'event_tables',
        ['*'],
        'event_id',
        this.event?.id || '',
        'created_at'
      );

      if (tablesError) {
        console.error('Error loading tables:', tablesError);
        this.showToast('Error al cargar las mesas', 'error');
        return;
      }

      // Cargar todos los invitados del evento para calcular disponibilidad
      const { data: guestsData, error: guestsError }: any = await this.supabaseService.getRecords<Guest>(
        'guests',
        ['table_id', 'companions_number'],
        'event_id',
        this.event?.id || '',
        'created_at'
      );

      if (guestsError) {
        console.error('Error loading guests:', guestsError);
        this.showToast('Error al cargar los invitados', 'error');
        return;
      }

      // Calcular disponibilidad de cada mesa
      this.availableTables = ((tablesData) || []).map((table:any) => {
        // Filtrar invitados asignados a esta mesa (excluyendo el invitado actual en modo edición)
        const assignedGuests = (guestsData || []).filter((guest:any) => 
          guest.table_id === table.id && 
          (this.mode === 'create' || guest.id !== this.guest?.id)
        );

        // Calcular espacios ocupados (invitados + acompañantes)
        const occupiedSpaces = assignedGuests.reduce((total: any, guest: any) => {
          return total + 1 + (guest.companions_number || 0);
        }, 0);

        // Calcular espacios disponibles
        const available = Number(table.capacity) - occupiedSpaces;

        return {
          ...table,
          available: Math.max(0, available)
        };
      });

    } catch (error) {
      console.error('Error loading tables with availability:', error);
      this.showToast('Error al cargar las mesas', 'error');
    } finally {
      this.isLoadingTables = false;
    }
  }

  validateField(field: string) {
    switch (field) {
      case 'name':
        if (!this.guestName?.trim()) {
          this.errors.name = 'El nombre del invitado es requerido';
        } else if (this.guestName.trim().length < 2) {
          this.errors.name = 'El nombre debe tener al menos 2 caracteres';
        } else if (this.guestName.trim().length > 100) {
          this.errors.name = 'El nombre no puede exceder 100 caracteres';
        } else {
          delete this.errors.name;
        }
        break;

      case 'table':
        // if (this.selectedTableId) {
        //   const selectedTable = this.getSelectedTable();
        //   const requiredSpaces = 1 + (this.companionsNumber || 0);
          
        //   if (selectedTable && selectedTable.available !== undefined && selectedTable.available < requiredSpaces) {
        //     console.log('Table availability error');
        //     this.errors.table = `La mesa seleccionada solo tiene ${selectedTable.available} espacios disponibles. Necesitas ${requiredSpaces} espacios.`;
        //   } else {
        //     delete this.errors.table;
        //   }
        // } else {
        //   delete this.errors.table;
        // }
        break;
    }
  }

  validateForm(): boolean {
    this.validateField('name');
    this.validateField('table');
    return Object.keys(this.errors).length === 0;
  }

  isFormValid(): boolean {
    return this.guestName?.trim().length > 0 && 
           Object.keys(this.errors).length === 0;
  }

  getInputClasses(field: string): string {
    const baseClasses = 'border-gray-300';
    const errorClasses = 'border-red-300';
    
    return this.errors[field as keyof FormErrors] ? errorClasses : baseClasses;
  }

  getSelectedGroup(): Group | undefined {
    return this.groups.find(group => group.id === this.selectedGroupId);
  }

  getSelectedTable(): Table | undefined {
    return this.availableTables.find(table => table.id === this.selectedTableId);
  }

  // Validar disponibilidad cuando cambia la mesa o acompañantes
  onTableOrCompanionsChange() {
    this.validateField('table');
  }

  // Filtrar mesas disponibles para el dropdown
  getAvailableTablesForDropdown(): Table[] {
    const requiredSpaces = 1 + (this.companionsNumber || 0);
    return this.availableTables.filter(table => 
      table.available !== undefined && table.available >= requiredSpaces
    );
  }

  addFromContacts() {
    console.log('Add from contacts functionality');
    this.showToast('Función de contactos en desarrollo', 'warning');
  }

  async handleSubmit() {
    if (!this.validateForm()) {
      return;
    }

    // Validación final de disponibilidad de mesa
    if (this.selectedTableId) {
      const selectedTable = this.getSelectedTable();
      const requiredSpaces = 1 + (this.companionsNumber || 0);
      
      // if (selectedTable && selectedTable.available !== undefined && selectedTable.available < requiredSpaces) {
      //   this.showToast(`La mesa seleccionada no tiene suficientes espacios disponibles. Necesitas ${requiredSpaces} espacios y solo hay ${selectedTable.available} disponibles.`, 'error');
      //   return;
      // }
    }

    this.isSubmitting = true;

    try {
      const guestData = {
        name: this.guestName.trim(),
        phone_number: this.phoneNumber.trim() || null,
        companions_number: this.companionsNumber || null,
        group_id: this.selectedGroupId || null,
        table_id: this.selectedTableId || null,
        event_id: this.event?.id || null,
        request_status: 'PENDING' as const,
        status: 'ACTIVE',
        added_from_contact: false,
        observation: this.observation.trim() || null,
        invited_by: this.guest?.invited_by || this.user?.id
      } as any;

      if (this.mode === 'edit' && this.guest) {
        // Update existing guest
        const { data, error }: any = await this.supabaseService.updateRecord<Partial<Guest>>(
          'guests',
          this.guest.id,
          {
            name: guestData.name,
            phone_number: guestData.phone_number || '',
            companions_number: guestData.companions_number || 0,
            group_id: guestData.group_id || null,
            table_id: guestData.table_id || null,
            observation: guestData.observation || null,
            invited_by: guestData.invited_by || null
          }
        );

        if (error) {
          await this.showErrorAlert(error)
          return;
        }
        else {
          console.log('Guest updated:', data);
        }

      } else {
        // Create new guest
        const { data, error }: any = await this.supabaseService.createRecord<Partial<Guest>>(
          'guests',
          guestData
        );

        if (error) {
          console.error('Error creating guest:', error);
          this.showToast('Error al crear el invitado', 'error');
          return;
        }
      }

      // Close modal with success
      this.modalController.dismiss({
        success: true
      });

    } catch (error) {
      console.error('Error saving guest:', error);
      this.showToast('Error al guardar el invitado', 'error');
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
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  async showErrorAlert(error: any) {
    // TODO: Implement error alert
    const message = error?.message || 'No se pudo guardar el invitado. Intenta nuevamente.';

   if(error.message?.includes('insuficiente')) {
    await this.alertCtrl.openFestivaAlert('warning', 'Error', 'La mesa seleccionada no tiene suficientes espacios disponibles.', true, 'Aceptar');
   }
  }
}