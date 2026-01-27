import { Component, inject, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CustomHeaderComponent } from 'src/app/shared/daycare/custom-header/custom-header.component';

export const CICLOS_CURSOS_DROPDOWN = [
  {
    label: 'Primer Ciclo - Párvulo I (Lactantes)',
    ciclo: 'Primer Ciclo',
    curso: 'Párvulo I - Lactantes',
    value: 'Primer Ciclo - Párvulo I (Lactantes)',
    rango: '45 días a 5 meses'
  },
  {
    label: 'Primer Ciclo - Párvulo I',
    ciclo: 'Primer Ciclo',
    curso: 'Párvulo I',
    value: 'Primer Ciclo - Párvulo I',
    rango: '6 meses a 11 meses'
  },
  {
    label: 'Primer Ciclo - Párvulo II',
    ciclo: 'Primer Ciclo',
    curso: 'Párvulo II',
    value: 'Primer Ciclo - Párvulo II',
    rango: '1 año a 1 año y 11 meses'
  },
  {
    label: 'Primer Ciclo - Párvulo III',
    ciclo: 'Primer Ciclo',
    curso: 'Párvulo III',
    value: 'Primer Ciclo - Párvulo III',
    rango: '2 años a 2 años y 11 meses'
  },
  {
    label: 'Segundo Ciclo - Prekinder',
    ciclo: 'Segundo Ciclo',
    curso: 'Prekinder',
    value: 'Segundo Ciclo - Prekinder',
    rango: '3 años a 3 años y 11 meses'
  },
  {
    label: 'Segundo Ciclo - Kinder',
    ciclo: 'Segundo Ciclo',
    curso: 'Kinder',
    value: 'Segundo Ciclo - Kinder',
    rango: '4 años a 4 años y 11 meses'
  },
  {
    label: 'Segundo Ciclo - Preprimario',
    ciclo: 'Segundo Ciclo',
    curso: 'Preprimario',
    value: 'Segundo Ciclo - Preprimario',
    rango: '5 años a 5 años y 11 meses'
  }
];

interface CicloResult {
  ciclo: string;
  curso: string;
  fecha: string;
}

@Component({
  selector: 'app-inscription-edit-page',
  templateUrl: './inscription-edit.page.html',
  styleUrls: ['./inscription-edit.page.scss'],
  standalone: true,
  imports: [...StandAloneModules, CustomHeaderComponent],
})
export class InscriptionEditPage implements OnInit {
  supabaseService = inject(SupabaseService);
  alertService = inject(AlertControllerService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  location = inject(Location);

  inscriptionForm!: FormGroup;
  avatarPreview: string = '';
  cicloResult: CicloResult = { ciclo: '', curso: '', fecha: '' };

  ciclosDropdown = CICLOS_CURSOS_DROPDOWN;
  scheduleOptions: any[] = [];

  identificationTypes = ['Cédula', 'Pasaporte'];
  relationshipTypes = [
    'Padre',
    'Madre',
    'Hermano',
    'Hermana',
    'Tío',
    'Tía',
    'Abuelo',
    'Abuela',
    'Otro familiar'
  ];

  showPrintSection: boolean = false;
  loading: boolean = true;

  registrationId: string = '';
  childId: string = '';
  firstGuardianId: string = '';
  secondGuardianId: string = '';
  authorizedPersonId: string = '';
  medicalInfoId: string = '';
  termsConditionId: string = '';

  constructor(private fb: FormBuilder) {
  
  }

  async ngOnInit() {
    this.initForm();
    await this.initSchedules();

    this.route.params.subscribe(async params => {
      if (params['id']) {
        this.registrationId = params['id'];
        await this.loadInscriptionData(this.registrationId);
      } else {
        await this.alertService.openFestivaAlert(
          'warning',
          'Error',
          'No se especificó una inscripción para editar'
        );
        this.goBack();
      }
    });
  }

  onCancel() {
    this.router.navigate(['/daycare/inscription']);
  }

  async ionViewWillEnter() {
    this.showPrintSection = false;
  }

  async initSchedules() {
    const result = await this.supabaseService.getSupabase().from('schedules').select('*');
    if (result.data) {
      this.scheduleOptions = result.data;
    }
  }

  initForm() {
    this.inscriptionForm = this.fb.group({
      childData: this.fb.group({
        avatar_url: [''],
        full_name: ['', [Validators.required, Validators.minLength(3)]],
        birth_date: ['', [Validators.required, this.validBirthDate]],
        gender: ['', Validators.required],
        address: ['', [Validators.required, Validators.minLength(10)]],
        schedule_id: ['', Validators.required],
        ciclo: ['', Validators.required],
        monthly_quotes: [0, [Validators.required, Validators.min(0)]]
      }),
      firstGuardian: this.fb.group({
        full_name: ['', [Validators.required, Validators.minLength(3)]],
        identification_type: ['Cédula', Validators.required],
        identification_number: ['', [Validators.required, this.validateIdentification.bind(this)]],
        phone_number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        workplace: ['', Validators.required]
      }),
      secondGuardian: this.fb.group({
        full_name: [''],
        identification_type: ['Cédula'],
        identification_number: ['', [this.validateIdentification.bind(this)]],
        phone_number: ['', [Validators.pattern(/^[0-9]{10}$/)]],
        workplace: ['']
      }),
      medicalInfo: this.fb.group({
        has_medical_condition: [false],
        medical_condition_details: [''],
        takes_medication: [false],
        medication_details: [''],
        allergies: [''],
        preferred_medical_center: ['', Validators.required]
      }),
      authorizedPerson: this.fb.group({
        full_name: ['', [Validators.required, Validators.minLength(3)]],
        phone_number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        relationship: ['', Validators.required]
      }),
      authorizations: this.fb.group({
        post_pictures_social_network: [true]
      }),
      signature: this.fb.group({
        signature_text: [''],
        signature_date: ['', Validators.required],
        start_date: ['', Validators.required],
        status: ['ACTIVE', Validators.required]
      })
    });

    this.inscriptionForm.get('medicalInfo.has_medical_condition')?.valueChanges.subscribe(value => {
      const detailsControl = this.inscriptionForm.get('medicalInfo.medical_condition_details');
      if (value) {
        detailsControl?.setValidators([Validators.required]);
      } else {
        detailsControl?.clearValidators();
      }
      detailsControl?.updateValueAndValidity();
    });

    this.inscriptionForm.get('medicalInfo.takes_medication')?.valueChanges.subscribe(value => {
      const detailsControl = this.inscriptionForm.get('medicalInfo.medication_details');
      if (value) {
        detailsControl?.setValidators([Validators.required]);
      } else {
        detailsControl?.clearValidators();
      }
      detailsControl?.updateValueAndValidity();
    });

    this.inscriptionForm.get('childData.birth_date')?.valueChanges.subscribe(value => {
      const fechaNacimiento = new Date(value);
      if (isNaN(fechaNacimiento.getTime())) return;
      this.cicloResult = this.obtenerCicloPorFecha(fechaNacimiento);
      this.cicloResult.fecha = this.calculateAge(value);
      this.inscriptionForm.get('childData.ciclo')?.setValue(this.cicloResult.ciclo + ' - ' + this.cicloResult.curso);
    });

     //insribirme al genero para cambiar la imagen del avatar
    this.inscriptionForm.get('childData.gender')?.valueChanges.subscribe(value => { 
      this.avatarPreview = value === 'M'
        ? 'assets/img/masculino.png'
        : value === 'F'
        ? 'assets/img/femenino.png'
        : this.avatarPreview;
    });
  }

  async loadInscriptionData(registrationId: string) {
    this.loading = true;
    const supabase = this.supabaseService.getSupabase();

    try {
      const { data: registration, error: regError } = await supabase
    .from('registration')
  .select(`
    *,
    children (
      *,
      schedule:schedules!id(*)

    )
  `)
  .eq('id', registrationId)
  .single();

  const schedule = await supabase.from('schedules').select('*').eq('id', '087055be-55f1-4c89-8d29-0f1edfdb3785').single();
  console.log('Schedule fetch result:', schedule);
  console.log('Registration fetch result:', registration, regError);

      if (regError || !registration) {
        throw new Error('No se encontró la inscripción');
      }

      this.registrationId = registration.id;
      this.childId = registration.children_id;

      const child = registration.children as any;
      

      this.inscriptionForm.patchValue({
        childData: {
          full_name: child.full_name,
          birth_date: child.birth_date,
          gender: child.gender,
          address: child.address,
          schedule_id: child.schedule?.id,
          ciclo: child.ciclo || '',
          avatar_url: child.avatar_url || ''
        },
        signature: {
          signature_date: registration.created_at?.split('T')[0] || '',
          start_date: registration.start_date,
          status: registration.status
        }
      });

      if (child.avatar_url && child.avatar_url !== 'no_haya_url') {
        this.avatarPreview = child.avatar_url;
      }

      const { data: guardians } = await supabase
        .from('children_legal_parents')
        .select(`
          *,
          legal_parents (*)
        `)
        .eq('children_id', this.childId)
        .order('is_primary', { ascending: false });

      if (guardians && guardians.length > 0) {
        const primaryGuardian = guardians[0].legal_parents as any;
        this.firstGuardianId = guardians[0].legal_parent_id;

        this.inscriptionForm.patchValue({
          firstGuardian: {
            full_name: primaryGuardian.full_name,
            identification_type: primaryGuardian.identification_type,
            identification_number: primaryGuardian.identification_number,
            phone_number: primaryGuardian.phone_number,
            workplace: primaryGuardian.workplace
          }
        });

        if (guardians.length > 1) {
          const secondaryGuardian = guardians[1].legal_parents as any;
          this.secondGuardianId = guardians[1].legal_parent_id;

          this.inscriptionForm.patchValue({
            secondGuardian: {
              full_name: secondaryGuardian.full_name,
              identification_type: secondaryGuardian.identification_type,
              identification_number: secondaryGuardian.identification_number,
              phone_number: secondaryGuardian.phone_number,
              workplace: secondaryGuardian.workplace
            }
          });
        }
      }

      const { data: medicalInfo } = await supabase
        .from('medical_info')
        .select('*')
        .eq('child_id', child.id)
        .maybeSingle();

      if (medicalInfo) {
        this.medicalInfoId = medicalInfo.id;
        console.log('Medical Info:', medicalInfo);
        this.inscriptionForm.patchValue({
          medicalInfo: {
            has_medical_condition: medicalInfo.has_medical_condition,
            medical_condition_details: medicalInfo.medical_condition_details || '',
            takes_medication: medicalInfo.takes_medication,
            medication_details: medicalInfo.medication_details || '',
            allergies: medicalInfo.allergies || '',
            preferred_medical_center: medicalInfo.preferred_medical_center
          }
        });
      }

      const { data: authorizedPerson } = await supabase
        .from('authorized_pickup')
        .select('*')
        .eq('children_id', this.childId)
        .maybeSingle();

      if (authorizedPerson) {
        this.authorizedPersonId = authorizedPerson.id;
        this.inscriptionForm.patchValue({
          authorizedPerson: {
            full_name: authorizedPerson.full_name,
            phone_number: authorizedPerson.phone_number,
            relationship: authorizedPerson.children_relationship
          }
        });
      }

      const { data: terms } = await supabase
        .from('terms_condition')
        .select('*')
        .eq('registration_id', registrationId)
        .maybeSingle();

      if (terms) {
        this.termsConditionId = terms.id;
        this.inscriptionForm.patchValue({
          authorizations: {
            post_pictures_social_network: terms.post_pictures_social_network
          }
        });
      }

      this.inscriptionForm.markAsPristine();
      this.loading = false;
      console.log('Inscription data loaded successfully', this.inscriptionForm.value);

    } catch (error) {
      console.error('Error loading inscription data:', error);
      await this.alertService.openFestivaAlert(
        'danger',
        'Error',
        'No se pudieron cargar los datos de la inscripción'
      );
      this.loading = false;
      this.goBack();
    }
  }

  async onSubmit() {
    if (!this.inscriptionForm.valid) {
      this.markFormGroupTouched(this.inscriptionForm);
      await this.alertService.openFestivaAlert(
        'warning',
        'Formulario inválido',
        'Por favor, completa todos los campos requeridos correctamente.'
      );
      return;
    }

    if (!this.inscriptionForm.dirty) {
      await this.alertService.openFestivaAlert(
        'warning',
        'Sin cambios',
        'No se han realizado cambios en el formulario.'
      );
      return;
    }

    await this.alertService.openModalAlert('Guardando cambios...');

    try {
      const supabase = this.supabaseService.getSupabase();
      const formData = this.inscriptionForm.value;
      formData.childData.avatar_url = this.avatarPreview || formData.childData.avatar_url;
      debugger;
      //ELIMINAR EL OBJETO DE SECONDgUARDIAN SI NO TIENE NOMBRE
        if (!formData?.secondGuardian?.full_name) {
          delete formData?.secondGuardian;
          this.secondGuardianId = '';
        }

      await supabase
        .from('children')
        .update({
          full_name: formData.childData.full_name,
          birth_date: formData.childData.birth_date,
          gender: formData.childData.gender,
          address: formData.childData.address,
          schedule_id: formData.childData.schedule_id,
          ciclo: formData.childData.ciclo,
          avatar_url: formData.childData.avatar_url
        })
        .eq('id', this.childId);

      if (this.firstGuardianId) {
        await supabase
          .from('legal_parents')
          .update({
            full_name: formData.firstGuardian.full_name,
            identification_type: formData.firstGuardian.identification_type,
            identification_number: formData.firstGuardian.identification_number,
            phone_number: formData.firstGuardian.phone_number,
            workplace: formData.firstGuardian.workplace
          })
          .eq('id', this.firstGuardianId);
      }

      if (this.secondGuardianId && formData.secondGuardian.full_name) {
        await supabase
          .from('legal_parents')
          .update({
            full_name: formData.secondGuardian.full_name,
            identification_type: formData.secondGuardian.identification_type,
            identification_number: formData.secondGuardian.identification_number,
            phone_number: formData.secondGuardian.phone_number,
            workplace: formData.secondGuardian.workplace
          })
          .eq('id', this.secondGuardianId);
      }

      if (this.medicalInfoId) {
        await supabase
          .from('medical_info')
          .update({
            has_medical_condition: formData.medicalInfo.has_medical_condition,
            medical_condition_details: formData.medicalInfo.medical_condition_details,
            takes_medication: formData.medicalInfo.takes_medication,
            medication_details: formData.medicalInfo.medication_details,
            allergies: formData.medicalInfo.allergies,
            preferred_medical_center: formData.medicalInfo.preferred_medical_center
          })
          .eq('id', this.medicalInfoId);
      }

      if (this.authorizedPersonId) {
        await supabase
          .from('authorized_pickup')
          .update({
            full_name: formData.authorizedPerson.full_name,
            phone_number: formData.authorizedPerson.phone_number,
            children_relationship: formData.authorizedPerson.relationship
          })
          .eq('id', this.authorizedPersonId);
      }

      if (this.termsConditionId) {
        await supabase
          .from('terms_condition')
          .update({
            post_pictures_social_network: formData.authorizations.post_pictures_social_network
          })
          .eq('id', this.termsConditionId);
      }

      await supabase
        .from('registration')
        .update({
          start_date: formData.signature.start_date,
          status: formData.signature.status
        })
        .eq('id', this.registrationId);

      await this.alertService.dismiss();
      await this.alertService.openFestivaAlert(
        'success',
        'Cambios guardados',
        'Los cambios se han guardado correctamente.'
      );

      this.inscriptionForm.markAsPristine();
      this.router.navigate(['/daycare/inscription']);

    } catch (error) {
      console.error('Error updating inscription:', error);
      await this.alertService.dismiss();
      await this.alertService.openFestivaAlert(
        'danger',
        'Error',
        'No se pudieron guardar los cambios. Inténtalo de nuevo.'
      );
    }
  }

  calculateAge(birthDate: string): string {
    const today = new Date();
    const birth = new Date(birthDate);

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    let weeks = Math.floor(days / 7);
    let remainingDays = days % 7;

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} año${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mes${months > 1 ? 'es' : ''}`);
    if (weeks > 0) parts.push(`${weeks} semana${weeks > 1 ? 's' : ''}`);
    if (remainingDays > 0) parts.push(`${remainingDays} día${remainingDays > 1 ? 's' : ''}`);

    if (parts.length === 0) {
      parts.push('0 días');
    }

    return parts.join(', ');
  }

  validBirthDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (birthDate > today) {
      return { futureDate: true };
    }

    if (age > 18) {
      return { tooOld: true };
    }

    return null;
  }

  validateIdentification(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const parent = control.parent;
    if (!parent) return null;

    const identificationType = parent.get('identification_type')?.value;

    if (identificationType === 'Cédula') {
      return this.validateDominicanCedula(control.value);
    }

    return null;
  }

  validateDominicanCedula(cedula: string): ValidationErrors | null {
    cedula = cedula.replace(/[-\s]/g, '');

    if (cedula.length !== 11 || !/^\d+$/.test(cedula)) {
      return { invalidCedula: true };
    }

    const digits = cedula.split('').map(Number);
    const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];

    let sum = 0;
    for (let i = 0; i < 10; i++) {
      let product = digits[i] * weights[i];
      if (product > 9) {
        product = Math.floor(product / 10) + (product % 10);
      }
      sum += product;
    }

    const verificationDigit = (10 - (sum % 10)) % 10;

    if (verificationDigit !== digits[10]) {
      return { invalidCedula: true };
    }

    return null;
  }

  onAvatarClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.avatarPreview = e.target.result;
          this.inscriptionForm.get('childData.avatar_url')?.setValue(e.target.result);
          this.inscriptionForm.markAsDirty();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(formGroupName: string, controlName: string): string {
    const control = this.inscriptionForm.get(`${formGroupName}.${controlName}`);

    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('pattern')) {
      return 'Formato inválido';
    }
    if (control?.hasError('futureDate')) {
      return 'La fecha no puede ser futura';
    }
    if (control?.hasError('tooOld')) {
      return 'El niño debe tener menos de 18 años';
    }
    if (control?.hasError('invalidCedula')) {
      return 'Cédula inválida';
    }

    return '';
  }

  isFieldInvalid(formGroupName: string, controlName: string): boolean {
    const control = this.inscriptionForm.get(`${formGroupName}.${controlName}`);
    return !!(control?.invalid && control?.touched);
  }

  obtenerCicloPorFecha(fechaNacimiento: Date): CicloResult {
    const hoy = new Date();

    let años = hoy.getFullYear() - fechaNacimiento.getFullYear();
    let meses = hoy.getMonth() - fechaNacimiento.getMonth();

    if (meses < 0) {
      años--;
      meses += 12;
    }

    const edadEnMeses = años * 12 + meses;

    let ciclo = '';
    let curso = '';

    if (edadEnMeses >= 2 && edadEnMeses <= 5) {
      ciclo = 'Primer Ciclo';
      curso = 'Párvulo I - Lactantes';
    } else if (edadEnMeses >= 6 && edadEnMeses <= 11) {
      ciclo = 'Primer Ciclo';
      curso = 'Párvulo I';
    } else if (edadEnMeses >= 12 && edadEnMeses <= 23) {
      ciclo = 'Primer Ciclo';
      curso = 'Párvulo II';
    } else if (edadEnMeses >= 24 && edadEnMeses <= 35) {
      ciclo = 'Primer Ciclo';
      curso = 'Párvulo III';
    } else if (edadEnMeses >= 36 && edadEnMeses <= 47) {
      ciclo = 'Segundo Ciclo';
      curso = 'Prekinder';
    } else if (edadEnMeses >= 48 && edadEnMeses <= 59) {
      ciclo = 'Segundo Ciclo';
      curso = 'Kinder';
    } else if (edadEnMeses >= 60 && edadEnMeses <= 71) {
      ciclo = 'Segundo Ciclo';
      curso = 'Preprimario';
    } else {
      ciclo = 'Fuera de rango';
      curso = 'No aplica';
    }

    return {
      ciclo,
      curso,
      fecha: fechaNacimiento.toISOString().split('T')[0]
    };
  }

  goBack() {
    this.location.back();
  }
}
