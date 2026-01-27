import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseStorageService } from 'src/app/core/services/supabase-storage.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { CustomHeaderComponent } from 'src/app/shared/daycare/custom-header/custom-header.component';
import { InscriptionDetailPrintComponent } from 'src/app/shared/daycare/inscription-detail-print/inscription-detail-print.component';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
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

export interface CicloResult {
  ciclo: string;
  curso: string;
  fecha: string;
}

@Component({
  selector: 'app-inscription-page',
  templateUrl: './inscription.page.html',
  styleUrls: ['./inscription.page.scss'],
  standalone: true,
  imports: [InscriptionDetailPrintComponent, CustomHeaderComponent, ...StandAloneModules],
})
export class InscriptionPage implements OnInit {

  //services
  supabaseService = inject(SupabaseService);
  alertService = inject(AlertControllerService);
  supabaseStorage = inject(SupabaseStorageService);
  router = inject(Router);

  //Childs
  @ViewChild('printSection') printSection!: InscriptionDetailPrintComponent;

  inscriptionForm!: FormGroup;
  avatarPreview: string = '';
  cicloResult: CicloResult = { ciclo: '', curso: '', fecha: '' };
  documents = {
    birthCertificate: { file: null as File | null, preview: '', label: 'Acta de Nacimiento', folderName: 'birth_certificates' },
    idCopies: { file: null as File | null, preview: '', label: 'Cédulas de los Padres', folderName: 'id_copies' },
    medicalCertificate: { file: null as File | null, preview: '', label: 'Certificado Médico', folderName: 'medical_certificates' },
    vaccineCard: { file: null as File | null, preview: '', label: 'Tarjeta de Vacunas', folderName: 'vaccine_cards' },
    photo: { file: null as File | null, preview: '', label: 'Foto', folderName: 'photos' },
    medicalInsurance: { file: null as File | null, preview: '', label: 'Seguro Médico', folderName: 'medical_insurances' },
    authorizedPersonId: { file: null as File | null, preview: '', label: 'Identificación de Persona Autorizada', folderName: 'authorized_person_ids' }
  };
  ciclosDropdown = CICLOS_CURSOS_DROPDOWN;

  scheduleOptions: any[] = [];

  identificationTypes = [
    'Cédula',
    'Pasaporte'
  ];

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

  constructor(private fb: FormBuilder) {
  }

  async ngOnInit() {
    this.initForm();

  }

  async ionViewWillEnter() {
    this.showPrintSection = false;
    await this.initSchedules();
  }

  onCancel() {
    this.router.navigate(['/daycare/inscription']);
  }

  async initSchedules() {
    const result = await this.supabaseService.getSupabase().from('schedules').select('*');
    console.log("Schedule Options Result:", result);
    if (result.data) {
      this.scheduleOptions = result.data;
    }
  }

  initForm() {
    this.inscriptionForm = this.fb.group({
      childData: this.fb.group({
        avatar_url: ['not_provided'],
        full_name: ['', [Validators.required, Validators.minLength(3)]],
        birth_date: [null, [Validators.required, this.validBirthDate]],
        gender: ['', Validators.required],
        address: ['NOT PROVIDED FOR THE TUTORS', [Validators.required, Validators.minLength(10)]],
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
        signature_text: ['', Validators.required],
        signature_date: [new Date().toISOString().split('T')[0], Validators.required],
        start_date: ['', Validators.required],
        status: ['ACTIVE']
      })
    });

    // Watch for medical condition changes
    this.inscriptionForm.get('medicalInfo.has_medical_condition')?.valueChanges.subscribe(value => {
      const detailsControl = this.inscriptionForm.get('medicalInfo.medical_condition_details');
      if (value) {
        detailsControl?.setValidators([Validators.required]);
      } else {
        detailsControl?.clearValidators();
      }
      detailsControl?.updateValueAndValidity();
    });

    // Watch for medication changes
    this.inscriptionForm.get('medicalInfo.takes_medication')?.valueChanges.subscribe(value => {
      const detailsControl = this.inscriptionForm.get('medicalInfo.medication_details');
      if (value) {
        detailsControl?.setValidators([Validators.required]);
      } else {
        detailsControl?.clearValidators();
      }
      detailsControl?.updateValueAndValidity();
    });

    //debo suscribirme a la fecha de nacimiento para calcular el ciclo
    this.inscriptionForm.get('childData.birth_date')?.valueChanges.subscribe(value => {
      const fechaNacimiento = new Date(value);
      if (isNaN(fechaNacimiento.getTime())) return;
       this.cicloResult = this.obtenerCicloPorFecha(fechaNacimiento);
       this.cicloResult.fecha = this.calculateAge(value); 
       this.inscriptionForm.get('childData.ciclo')?.setValue(this.cicloResult.ciclo + ' - ' + this.cicloResult.curso);
      console.log('Ciclo y curso calculado:', this.cicloResult);
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



  calculateAge(birthDate: string): string {
    const today = new Date();
    const birth = new Date(birthDate);

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      // Get days in previous month
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate weeks and remaining days
    let weeks = Math.floor(days / 7);
    let remainingDays = days % 7;

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} año${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mes${months > 1 ? 'es' : ''}`);
    if (weeks > 0) parts.push(`${weeks} semana${weeks > 1 ? 's' : ''}`);
    if (remainingDays > 0) parts.push(`${remainingDays} día${remainingDays > 1 ? 's' : ''}`);

    // If all are zero (newborn), show "0 días"
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

    const identificationType = parent.get('identificationType')?.value;

    if (identificationType === 'Cédula') {
      return this.validateDominicanCedula(control.value);
    }

    return null;
  }

  validateDominicanCedula(cedula: string): ValidationErrors | null {
    // Remove any dashes or spaces
    cedula = cedula.replace(/[-\s]/g, '');

    // Must be 11 digits
    if (cedula.length !== 11 || !/^\d+$/.test(cedula)) {
      return { invalidCedula: true };
    }

    // Calculate verification digit
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
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  onDocumentSelect(event: any, documentType: keyof typeof this.documents) {
    const file = event.target.files[0];
    if (file) {
      this.documents[documentType].file = file;

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.documents[documentType].preview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        this.documents[documentType].preview = 'pdf';
      }
    }
  }

  triggerFileInput(documentType: string) {
    const input = document.getElementById(`file-${documentType}`) as HTMLInputElement;
    input?.click();
  }

  removeDocument(documentType: keyof typeof this.documents) {
    this.documents[documentType].file = null;
    this.documents[documentType].preview = '';
  }

  async onSubmit() {
    if (this.inscriptionForm.valid) {
      const formData = {
        ...this.inscriptionForm.value,
        documents: this.documents
      };

      console.log('=== DATOS DE INSCRIPCIÓN ===');

      await this.alertService.openModalAlert('Guardando formulario...');

      try {
        const supabase = this.supabaseService.getSupabase();
        const dataToSupabase = { ...formData };
        // Remove file previews before sending to Supabase
        delete dataToSupabase.documents;
        dataToSupabase.childData.avatar_url = this.avatarPreview || 'not_provided';

        //ELIMINAR EL OBJETO DE SECONDgUARDIAN SI NO TIENE NOMBRE
        if (!dataToSupabase.secondGuardian.full_name) {
          delete dataToSupabase.secondGuardian;
        }

        if(this.cicloResult?.ciclo == '' && this.cicloResult?.ciclo?.toLowerCase().includes('fuera de rango')){ 
          await this.alertService.dismiss();
          await this.alertService.openFestivaAlert('warning', 'Ciclo inválido', 'La edad del niño no corresponde a ningún ciclo disponible. Por favor verifica la fecha de nacimiento.');
          return;
        }

        console.log('Data to send to Supabase Function:', dataToSupabase);
        const response = await supabase.functions.invoke('save-inscription', {
          body: { ...dataToSupabase },

        });

        console.log('Response from Supabase Function:', response);

        if (response.error) {
          await this.alertService.dismiss();
          await this.alertService.openFestivaAlert('danger', 'Error', 'No se pudo guardar el formulario. Inténtalo de nuevo más tarde.');
          return;
        }

        await this.uploadAllDocuments(response.data?.registration_id, response.data.child?.id, response.data.child?.full_name.replace(/\s+/g, '_'));
        await this.alertService.openFestivaAlert('success', 'Datos guardados', 'El formulario de inscripción ha sido guardado exitosamente.');
        this.showPrintSection = true;

      } catch (error) {
        console.error('Error calling edge function:', error);
        await this.alertService.openFestivaAlert('danger', 'Error', 'No se pudo guardar el formulario. Inténtalo de nuevo más tarde.');
        return;
      }

      await this.alertService.dismiss();

    } else {
      console.log('Formulario inválido');
      this.markFormGroupTouched(this.inscriptionForm);
      await this.alertService.openFestivaAlert('warning', 'Formulario inválido', 'Por favor, completa todos los campos requeridos correctamente.');
    }
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

  async onPrint() {

    if (this.inscriptionForm.valid) {
      this.printSection.inscriptionData = this.inscriptionForm.value;
      this.printSection.onPrint();
    }
    else {
      await this.alertService.openFestivaAlert('warning', 'Formulario inválido', 'Por favor, completa todos los campos requeridos correctamente antes de imprimir.');
    }

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

    // Primer Ciclo
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
    }

    // Segundo Ciclo
    else if (edadEnMeses >= 36 && edadEnMeses <= 47) {
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

  async uploadAllDocuments(
  registrationId: string,
  childId: string,
  childName: string
): Promise<Record<string, string>> {

  const uploadedPaths: Record<string, string> = {};

  for (const [key, doc] of Object.entries(this.documents)) {
    if (!doc.file) continue;
    await this.alertService.dismiss();
    this.alertService.openFestivaAlert('loading', `Subiendo ${doc.label}...`, 'Por favor espera mientras se sube el documento.');
    const isImage = doc.file.type.startsWith('image/');

    const result = isImage
      ? await this.supabaseStorage.uploadImage(doc.file, {
          bucket: 'babyhouse',
          folder: `inscriptions/${childId}/${doc.folderName}`,
          userId: childName,
          toWebp: key === 'photo',
          maxSizeMB: 0.8
        })
      : await this.supabaseStorage.uploadDocument(doc.file, {
          bucket: 'babyhouse',
          folder: `inscriptions/${childId}/${doc.folderName}`,
          userId: childName
        });

    uploadedPaths[key] = result.path;
  }
    await this.alertService.dismiss();
  console.log('Uploaded document paths:', uploadedPaths);

  const resultAddDocuments = await this.supabaseService.createRecord('documents', {
    registration_id: registrationId,
    birth_certificate: uploadedPaths['birthCertificate'] || null,
    legal_parents_identification: uploadedPaths['idCopies'] || null,
    medical_certificate: uploadedPaths['medicalCertificate'] || null,
    vaccination_card: uploadedPaths['vaccineCard'] || null,
    picture_2x2: uploadedPaths['photo'] || null,
    health_insurance: uploadedPaths['medicalInsurance'] || null,
    pickuper_identification: uploadedPaths['authorizedPersonId'] || null
  });
  console.log('Result adding document records to Supabase:', resultAddDocuments);
  return uploadedPaths;



}


}
