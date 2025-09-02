import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Profile } from 'src/app/core/interface/profile.interface';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

interface EventTable {
  id: string;
  created_at: string;
  event_id: string;
  name: string;
  capacity: number;
  created_by: string | null;
  available: number
}

interface FormErrors {
  name?: string;
  capacity?: string;
}

@Component({
  selector: 'app-add-table-modal',
  templateUrl: './add-table-modal.component.html',
  styleUrls: ['./add-table-modal.component.scss'],
  imports: [...StandAloneModules]
})
export class AddTableModalComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() eventId: string = '';
  @Input() table?: EventTable;
  @Input() user?: Profile;

  // Form data
  tableName: string = '';
  tableCapacity: number | null = null;

  // Form validation
  errors: FormErrors = {};
  isSubmitting: boolean = false;

  // Capacity suggestions
  capacitySuggestions = [
    { value: 6, label: 'Íntima' },
    { value: 8, label: 'Estándar' },
    { value: 10, label: 'Grande' },
    { value: 12, label: 'Familiar' },
    { value: 15, label: 'Extendida' },
    { value: 20, label: 'Banquete' }
  ];

  constructor(
    private modalController: ModalController,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    if (this.mode === 'edit' && this.table) {
      this.tableName = this.table.name;
      this.tableCapacity = this.table.capacity;
    }
  }

  selectCapacity(capacity: number) {
    this.tableCapacity = capacity;
    this.validateField('capacity');
  }

  validateField(field: string) {
    switch (field) {
      case 'name':
        if (!this.tableName?.trim()) {
          this.errors.name = 'El nombre de la mesa es requerido';
        } else if (this.tableName.trim().length < 2) {
          this.errors.name = 'El nombre debe tener al menos 2 caracteres';
        } else if (this.tableName.trim().length > 50) {
          this.errors.name = 'El nombre no puede exceder 50 caracteres';
        } else {
          delete this.errors.name;
        }
        break;

      case 'capacity':
        if (!this.tableCapacity || this.tableCapacity <= 0) {
          this.errors.capacity = 'La capacidad es requerida';
        } else if (this.tableCapacity < 1) {
          this.errors.capacity = 'La capacidad mínima es 1 persona';
        } else if (this.tableCapacity > 50) {
          this.errors.capacity = 'La capacidad máxima es 50 personas';
        } else {
          delete this.errors.capacity;
        }
        break;
    }
  }

  validateForm(): boolean {
    this.validateField('name');
    this.validateField('capacity');
    return Object.keys(this.errors).length === 0;
  }

  isFormValid(): boolean {
    return this.tableName?.trim().length > 0 && 
           this.tableCapacity !== null && 
           this.tableCapacity > 0 &&
           Object.keys(this.errors).length === 0;
  }

  getInputClasses(field: string): string {
    const baseClasses = 'border-gray-300';
    const errorClasses = 'border-red-300';
    
    return this.errors[field as keyof FormErrors] ? errorClasses : baseClasses;
  }

  async handleSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    try {
      const tableData = {
        name: this.tableName.trim(),
        capacity: this.tableCapacity!,
        event_id: this.eventId,
        available: this.table?.available ?? this.tableCapacity!

      };

      if (this.mode === 'edit' && this.table) {
        // Update existing table
        const { data, error } = await this.supabaseService.updateRecord<Partial<EventTable>>(
          'event_tables',
          this.table.id,
          {
            name: tableData.name,
            capacity: tableData.capacity,
            created_by: this.user?.id,
            available: this.table?.available
          }
        );

        if (error) {
          console.error('Error updating table:', error);
          this.showToast('Error al actualizar la mesa', 'error');
          return;
        }

      } else {
        // Create new table
        const { data, error } = await this.supabaseService.createRecord<Partial<EventTable>>(
          'event_tables',
          tableData
        );

        if (error) {
          console.error('Error creating table:', error);
          this.showToast('Error al crear la mesa', 'error');
          return;
        }
      }

      // Close modal with success
      this.modalController.dismiss({
        success: true
      });

    } catch (error) {
      console.error('Error saving table:', error);
      this.showToast('Error al guardar la mesa', 'error');
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
}