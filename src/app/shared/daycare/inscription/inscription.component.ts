import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonTextarea,
  IonIcon,
  IonLabel,
  IonItem, IonCol } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, documentOutline, saveOutline, printOutline } from 'ionicons/icons';
import { IonicModule, IonRow } from '@ionic/angular';

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

  scheduleOptions = [
    'Matutina',
    'Vespertina',
    'Nocturna',
    'Todo el día'
  ];

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

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.inscriptionForm = this.fb.group({
      childData: this.fb.group({
        avatarUrl: [''],
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        birthDate: ['', [Validators.required, this.validBirthDate]],
        gender: ['', Validators.required],
        address: ['NOT PROVIDED', [Validators.required, Validators.minLength(10)]],
        schedule: ['', Validators.required]
      }),
      firstGuardian: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        identificationType: ['Cédula', Validators.required],
        identificationNumber: ['', [Validators.required, this.validateIdentification.bind(this)]],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        workplace: ['', Validators.required]
      }),
      secondGuardian: this.fb.group({
        fullName: [''],
        identificationType: ['Cédula'],
        identificationNumber: ['', [this.validateIdentification.bind(this)]],
        phoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
        workplace: ['']
      }),
      medicalInfo: this.fb.group({
        hasMedicalCondition: [false],
        medicalConditionDetails: [''],
        takesMedication: [false],
        medicationDetails: [''],
        allergies: [''],
        preferredMedicalCenter: ['', Validators.required]
      }),
      authorizedPerson: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        relationship: ['', Validators.required]
      }),
      authorizations: this.fb.group({
        allowSocialMedia: [false]
      }),
      signature: this.fb.group({
        signatureText: ['', Validators.required],
        signatureDate: [new Date().toISOString().split('T')[0], Validators.required],
        startDate: [null, Validators.required]
      })
    });

    // Watch for medical condition changes
    this.inscriptionForm.get('medicalInfo.hasMedicalCondition')?.valueChanges.subscribe(value => {
      const detailsControl = this.inscriptionForm.get('medicalInfo.medicalConditionDetails');
      if (value) {
        detailsControl?.setValidators([Validators.required]);
      } else {
        detailsControl?.clearValidators();
      }
      detailsControl?.updateValueAndValidity();
    });

    // Watch for medication changes
    this.inscriptionForm.get('medicalInfo.takesMedication')?.valueChanges.subscribe(value => {
      const detailsControl = this.inscriptionForm.get('medicalInfo.medicationDetails');
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
          this.inscriptionForm.get('childData.avatarUrl')?.setValue(e.target.result);
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

  onSubmit() {
    if (this.inscriptionForm.valid) {
      const formData = {
        ...this.inscriptionForm.value,
        documents: this.documents
      };

      console.log('=== DATOS DE INSCRIPCIÓN ===');
      console.log(JSON.stringify(formData, null, 2));

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
