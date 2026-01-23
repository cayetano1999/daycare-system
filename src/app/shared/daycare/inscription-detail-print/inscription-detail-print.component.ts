import { Component, Input } from '@angular/core';
import { StandAloneModules } from '../../stand-alone-module';
import printJS from 'print-js';


interface InscriptionData {
  childData: {
    avatar_url?: string;
    full_name: string;
    birth_date: string;
    gender: string;
    address: string;
    schedule: string;
  };
  firstGuardian: {
    full_name: string;
    identification_type: string;
    identification_number: string;
    phone_number: string;
    workplace: string;
  };
  secondGuardian?: {
    full_name?: string;
    identification_type?: string;
    identification_number?: string;
    phone_number?: string;
    workplace?: string;
  };
  medicalInfo: {
    has_medical_condition: boolean;
    medical_condition_details?: string;
    takes_medication: boolean;
    medication_details?: string;
    allergies?: string;
    preferred_medical_center: string;
  };
  authorizedPerson: {
    full_name: string;
    phone_number: string;
    relationship: string;
  };
  authorizations: {
    post_pictures_social_network: boolean;
  };
  signature: {
    signature_text: string;
    signature_date: string;
    start_date: string;
  };
}

@Component({
  selector: 'app-inscription-detail-print',
  templateUrl: './inscription-detail-print.component.html',
  styleUrls: ['./inscription-detail-print.component.scss'],
  standalone: true,
  imports: [...StandAloneModules]
})
export class InscriptionDetailPrintComponent {
  @Input() inscriptionData!: InscriptionData;
  @Input() scheduleDescription: string = '';

  constructor() {}

 onPrint() {
  // printJS({
  //   printable: 'form-print',
  //   type: 'html',
  //   documentTitle: 'Hoja de Incrpción',
  //   targetStyles: ['*'],        // usa solo tus estilos
  //   style: `
  //     @page {
  //       size: A4;
  //     }

  //     body {
  //       margin: 0;
  //       padding: 0;
  //     }

  //     #form-print {
  //       width: 100%;
  //       max-width: none;
  //       margin: 0 auto;
  //       box-shadow: none !important;
  //     }
  //   `
  // });
  printJS({
    printable: 'form-print',
    type: 'html',
    documentTitle: '',
    targetStyles: ['*'],
    style: `
      @page {
        size: A4;
        margin: 15mm;
      }

      body {
        margin: 0;
        padding: 0;
      }

      #form-print {
        width: 400mm;   /* 🔥 ancho REAL de A4 */
        margin: 0 auto;
      }
    `
  });

}

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  getGenderText(gender: string): string {
    return gender === 'M' ? 'Masculino' : 'Femenino';
  }

  getBooleanText(value: boolean): string {
    return value ? 'Sí' : 'No';
  }
}
