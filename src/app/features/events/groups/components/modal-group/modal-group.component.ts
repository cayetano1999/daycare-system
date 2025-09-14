import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { Group } from '../../groups.page';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { Profile } from 'src/app/core/interface/profile.interface';



interface GroupFormData {
  name: string;
  color_exa: string;
}

@Component({
  selector: 'app-group-modal',
  templateUrl: './modal-group.component.html',
  styleUrls: ['./modal-group.component.scss'],
  imports: [...StandAloneModules]
})
export class ModalGroupComponent implements OnInit {
  @Input() editingGroup: Group | null = null;
  @Input() existingGroups: Group[] = [];
  @Input() user: Profile | null = null;
  @Input() event: FestivaEvent | null = null;

  formData: GroupFormData = {
    name: '',
    color_exa: '#3B82F6'
  };
  
  formErrors: Record<string, string> = {};
  isLoading = false;

  // Predefined colors for quick selection
  predefinedColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#A855F7'  // Violet
  ];

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    if (this.editingGroup) {
      this.formData = {
        name: this.editingGroup.name,
        color_exa: this.editingGroup.color_exa
      };
    }
  }

  validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!this.formData.name.trim()) {
      errors['name'] = 'El nombre del grupo es requerido';
    } else if (this.formData.name.length < 2) {
      errors['name'] = 'El nombre debe tener al menos 2 caracteres';
    } else if (this.formData.name.length > 30) {
      errors['name'] = 'El nombre no puede exceder 30 caracteres';
    }

    // Check for duplicate names (excluding current editing group)
    const isDuplicate = this.existingGroups.some(group => 
      group.name.toLowerCase() === this.formData.name.trim().toLowerCase() && 
      group.id !== this.editingGroup?.id
    );

    if (isDuplicate) {
      errors['name'] = 'Ya existe un grupo con este nombre';
    }

    if (!this.formData.color_exa || !/^#[0-9A-F]{6}$/i.test(this.formData.color_exa)) {
      errors['color_exa'] = 'Selecciona un color válido';
    }

    this.formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  selectPredefinedColor(color: string) {
    this.formData.color_exa = color;
    if (this.formErrors['color_exa']) {
      delete this.formErrors['color_exa'];
    }
  }

  async handleSubmit() {
    if (!this.validateForm()) return;

    this.isLoading = true;

    try {
      const groupData = {
        name: this.formData.name.trim(),
        color_exa: this.formData.color_exa,
        event_id: this.event?.id
      };

      let result;

      if (this.editingGroup) {
        // Update existing group
        const { data, error } = await this.supabaseService.updateRecord(
          'groups',
          this.editingGroup.id,
          groupData
        );

        if (error) {
          throw error;
        }

        result = { action: 'update', data: { ...this.editingGroup, ...groupData } };
      } else {
        // Create new group
        const { data, error } = await this.supabaseService.createRecord('groups', groupData);

        if (error) {
          throw error;
        }

        result = { action: 'create', data };
      }

      // Return result to parent component
      await this.modalController.dismiss(result);
    } catch (error: any) {
      console.error('Error saving group:', error);
      
      let errorMessage = 'No se pudo guardar el grupo. Intenta nuevamente.';
      
      if (error.message?.includes('duplicate')) {
        errorMessage = 'Ya existe un grupo con este nombre.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      }
      
      const alert = await this.alertController.create({
        header: 'Error',
        message: errorMessage,
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.isLoading = false;
    }
  }

  async closeModal() {
    await this.modalController.dismiss();
  }
}