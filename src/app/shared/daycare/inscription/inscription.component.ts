import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  IonCol } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, documentOutline, saveOutline, printOutline } from 'ionicons/icons';
import { IonicModule } from '@ionic/angular';
import { SupabaseService } from 'src/app/core/services/supabase.service';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.scss'],
  standalone: true,
  imports: [IonCol, 
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class InscriptionComponent implements OnInit {

  //services
  supabaseService = inject(SupabaseService);

  inscriptionForm!: FormGroup;
  avatarPreview: string = 'https://via.placeholder.com/150';

  documents = {
    birthCertificate: { file: null as File | null, preview: '' },
    idCopies: { file: null as File | null, preview: '' },
    medicalCertificate: { file: null as File | null, preview: '' },
    vaccineCard: { file: null as File | null, preview: '' },
    photo: { file: null as File | null, preview: '' },
    medicalInsurance: { file: null as File | null, preview: '' },
    authorizedPersonId: { file: null as File | null, preview: '' }
  };

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

  constructor(private fb: FormBuilder) {
    addIcons({
      'camera-outline': cameraOutline,
      'document-outline': documentOutline,
      'save-outline': saveOutline,
      'print-outline': printOutline
    });
  }

  async ngOnInit() {
    this.initForm();
    console.log("Loading schedule options...");
    await this.initSchedules();
  }


  async initSchedules(){
    const result = await this.supabaseService.getSupabase().from('schedules').select('*');
    console.log("Schedule Options Result:", result);
    if(result.data){
      this.scheduleOptions = result.data;
    }
  }

  initForm() {
    this.inscriptionForm = this.fb.group({
      childData: this.fb.group({
        avatar_url: ['not_provided'],
        full_name: ['JOSUE ALEXANDER CAYETANO', [Validators.required, Validators.minLength(3)]],
        birth_date: ['2023-01-01', [Validators.required, this.validBirthDate]],
        gender: ['M', Validators.required],
        address: ['NOT PROVIDED FOR THE TUTORS', [Validators.required, Validators.minLength(10)]],
        schedule: ['Matutina', Validators.required]
      }),
      firstGuardian: this.fb.group({
        full_name: ['JUAN SOTO', [Validators.required, Validators.minLength(3)]],
        identification_type: ['Cédula', Validators.required],
        identification_number: ['40209341789', [Validators.required, this.validateIdentification.bind(this)]],
        phone_number: ['8093716874', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        workplace: ['INAPA 2', Validators.required]
      }),
      secondGuardian: this.fb.group({
        full_name: ['MARTA CANDELA'],
        identification_type: ['Cédula'],
        identification_number: ['02300893167', [this.validateIdentification.bind(this)]],
        phone_number: ['8093716874', [Validators.pattern(/^[0-9]{10}$/)]],
        workplace: ['INAPA']
      }),
      medicalInfo: this.fb.group({
        has_medical_condition: [true],
        medical_condition_details: ['muchas'],
        takes_medication: [true],
        medication_details: ['no hay'],
        allergies: ['a la pobreza'],
        preferred_medical_center: ['MUSA', Validators.required]
      }),
      authorizedPerson: this.fb.group({
        full_name: ['Los Proto Proto', [Validators.required, Validators.minLength(3)]],
        phone_number: ['8093716874', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        relationship: ['Padre', Validators.required]
      }),
      authorizations: this.fb.group({
        post_pictures_social_network: [true]
      }),
      signature: this.fb.group({
        signature_text: ['LISSETE MARQUEZ', Validators.required],
        signature_date: [new Date().toISOString().split('T')[0], Validators.required],
        start_date: ['2025-01-01', Validators.required]
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

      try {
      const supabase = this.supabaseService.getSupabase();
      const dataToSupabase = { ...formData };
      // Remove file previews before sending to Supabase
      delete dataToSupabase.documents;
      dataToSupabase.childData.avatar_url = 'no_haya_url';
      console.log('Data to send to Supabase Function:', dataToSupabase);
      const response = await supabase.functions.invoke('save-inscription', {
        body: { ...dataToSupabase },
        
      });

      if (response.error) {
        console.error('Error checking email:', response.error);
        return false;
      }

      return response.data?.exists || false;
    } catch (error) {
      console.error('Error calling edge function:', error);
      return false;
    }



      alert('Formulario guardado exitosamente. Revisa la consola para ver los datos.');
    } else {
      console.log('Formulario inválido');
      this.markFormGroupTouched(this.inscriptionForm);
      alert('Por favor, completa todos los campos requeridos correctamente.');
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

  onPrint() {
    window.print();
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
}
