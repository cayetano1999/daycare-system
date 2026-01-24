import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { CustomHeaderComponent } from 'src/app/shared/daycare/custom-header/custom-header.component';


interface GuardianForm {
  full_name: string;
  identification_type: string;
  identification_number: string;
  phone_number: string;
  workplace: string;
}

@Component({
  selector: 'app-guardian-edit-page',
  templateUrl: './guardian-edit.page.html',
  styleUrls: ['./guardian-edit.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, CustomHeaderComponent]
})
export class GuardianEditPage implements OnInit {
  supabaseService = inject(SupabaseService);
  alertService = inject(AlertControllerService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  location = inject(Location);

  guardianId: string = '';
  loading: boolean = false;
  saving: boolean = false;

  form: GuardianForm = {
    full_name: '',
    identification_type: 'Cédula',
    identification_number: '',
    phone_number: '',
    workplace: ''
  };

  identificationTypes = ['Cédula', 'Pasaporte', 'RNC'];

  errors: { [key: string]: string } = {};

  constructor() {
 
  }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      if (params['id']) {
        this.guardianId = params['id'];
        await this.loadGuardian();
      }
    });
  }

  async loadGuardian() {
    this.loading = true;
    try {
      const supabase = this.supabaseService.getSupabase();

      const { data, error } = await supabase
        .from('legal_parents')
        .select('*')
        .eq('id', this.guardianId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        await this.alertService.openFestivaAlert(
          'warning',
          'No encontrado',
          'El tutor no fue encontrado'
        );
        this.goBack();
        return;
      }

      this.form = {
        full_name: data.full_name || '',
        identification_type: data.identification_type || 'Cédula',
        identification_number: data.identification_number || '',
        phone_number: data.phone_number || '',
        workplace: data.workplace || ''
      };

    } catch (error) {
      console.error('Error loading guardian:', error);
      await this.alertService.openFestivaAlert(
        'danger',
        'Error',
        'No se pudo cargar la información del tutor'
      );
      this.goBack();
    } finally {
      this.loading = false;
    }
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.form.full_name.trim()) {
      this.errors['full_name'] = 'El nombre completo es requerido';
      isValid = false;
    }

    if (!this.form.identification_number.trim()) {
      this.errors['identification_number'] = 'El número de identificación es requerido';
      isValid = false;
    }

    return isValid;
  }

  formatPhoneNumber(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 10) {
      value = value.substring(0, 10);
    }

    if (value.length >= 6) {
      value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6);
    } else if (value.length >= 3) {
      value = value.substring(0, 3) + '-' + value.substring(3);
    }

    this.form.phone_number = value;
  }

  async saveGuardian() {
    if (!this.validateForm()) {
      await this.alertService.openFestivaAlert(
        'warning',
        'Formulario incompleto',
        'Por favor, corrige los errores antes de continuar'
      );
      return;
    }

    this.saving = true;
    try {
      const supabase = this.supabaseService.getSupabase();

      const { error } = await supabase
        .from('legal_parents')
        .update({
          full_name: this.form.full_name.trim(),
          identification_type: this.form.identification_type,
          identification_number: this.form.identification_number.trim(),
          phone_number: this.form.phone_number.trim() || null,
          workplace: this.form.workplace.trim() || null
        })
        .eq('id', this.guardianId);

      if (error) throw error;

      await this.alertService.openFestivaAlert(
        'success',
        'Éxito',
        'El tutor ha sido actualizado correctamente'
      );

      this.goBack();

    } catch (error) {
      console.error('Error saving guardian:', error);
      await this.alertService.openFestivaAlert(
        'danger',
        'Error',
        'No se pudo guardar la información del tutor'
      );
    } finally {
      this.saving = false;
    }
  }

  goBack() {
    this.location.back();
  }

  hasError(field: string): boolean {
    return !!this.errors[field];
  }

  getErrorMessage(field: string): string {
    return this.errors[field] || '';
  }
}
