import { Component, Input } from '@angular/core';
import { StandAloneModules } from '../../stand-alone-module';
import printJS from 'print-js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


interface InscriptionData {
  childData: {
    avatar_url?: string;
    full_name: string;
    birth_date: string;
    gender: string;
    address: string;
    schedule: string;
    monthly_quotes: number;
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

  printing: boolean = false;

  constructor() {}

async onPrint() {
  this.printing = true;
  const element = document.getElementById('form-print');

  if (!element) {
    console.error('Elemento para imprimir no encontrado');
    return;
  }

  // Forzar fondo blanco
  element.style.background = '#ffffff';

  const canvas = await html2canvas(element, {
    scale: 2, // Alta resolución
    useCORS: true,
    backgroundColor: '#ffffff',
    scrollY: -window.scrollY
  });

  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Primera página
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Páginas adicionales si el contenido es largo
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`Formulario_Inscripcion_${new Date().toISOString().split('T')[0]}.pdf`);
  this.printing = false;
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
