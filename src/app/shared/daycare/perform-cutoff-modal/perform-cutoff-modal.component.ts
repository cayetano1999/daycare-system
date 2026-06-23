import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StandAloneModules } from '../../stand-alone-module';
import { ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { warning, closeOutline } from 'ionicons/icons';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { CICLOS_CURSOS_DROPDOWN } from 'src/app/features/daycare/inscription/inscription.page';
import { CyclesLegendComponent } from '../cycles-legend/cycles-legend.component';
import { calculateAgeToString } from 'src/app/core/constants/constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ChildToPromote {
  id: string;
  full_name: string;
  birth_date: string | Date;
  ciclo: string;
  newCiclo?: string;
}

@Component({
  selector: 'app-perform-cutoff-modal',
  standalone: true,
  imports: [...StandAloneModules, CyclesLegendComponent],
  templateUrl: './perform-cutoff-modal.component.html',
  styleUrls: ['./perform-cutoff-modal.component.scss']
})
export class PerformCutoffModalComponent implements OnInit {
  @Input() children: ChildToPromote[] = [];
  
  modalCtrl = inject(ModalController);
  supabaseService = inject(SupabaseService);
  alertCtrl = inject(AlertControllerService);

  ciclos: string[] = CICLOS_CURSOS_DROPDOWN.map(c => c.value);
  childrenList: ChildToPromote[] = [];
  filteredChildrenList: ChildToPromote[] = [];
  searchTerm: string = '';
  isPrinting = false;
  currentDate = new Date();

  constructor() {
    addIcons({ warning, closeOutline });
  }

  ngOnInit() {
    // Pre-calculate the next cycle in the list for each child
    this.childrenList = this.children.map(c => {
      const nextCiclo = this.getNextCiclo(c.ciclo);
      return {
        ...c,
        newCiclo: nextCiclo
      };
    });
    this.applyFilter();
  }

  getNextCiclo(currentCiclo: string): string {
    if (!currentCiclo) {
      return this.ciclos[0] || '';
    }
    const currentIndex = this.ciclos.indexOf(currentCiclo);
    if (currentIndex === -1) {
      return currentCiclo;
    }
    if (currentIndex === this.ciclos.length - 1) {
      // Already in the last cycle, keep it
      return currentCiclo;
    }
    return this.ciclos[currentIndex + 1];
  }

  close() {
    this.modalCtrl.dismiss();
  }

  calculateAge(birthDate: string | Date): string {
    return calculateAgeToString(birthDate.toString());
  }

  async performCutoff() {
    if (this.childrenList.length === 0) {
      return;
    }

    // validate that all children have a newCiclo
    const allHaveCiclo = this.childrenList.every(c => c.newCiclo);
    if (!allHaveCiclo) {
      this.alertCtrl.openFestivaAlert('warning', 'Validación', 'Todos los niños deben tener un ciclo seleccionado.');
      return;
    }

    try {
      this.alertCtrl.openModalAlert('Realizando corte de ciclos...');
      const supabase = this.supabaseService.getSupabase();
      
      const promises = this.childrenList.map(child => {
        return supabase
          .from('children')
          .update({ ciclo: child.newCiclo })
          .eq('id', child.id);
      });

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        throw new Error('Hubo errores al actualizar algunos niños');
      }

      await this.alertCtrl.dismiss();
      this.modalCtrl.dismiss({ success: true });
    } catch (error) {
      console.error('Error performing cutoff', error);
      await this.alertCtrl.dismiss();
      this.alertCtrl.openFestivaAlert('danger', 'Error', 'Ocurrió un error al realizar el corte de ciclos.');
    }
  }

  applyFilter() {
    if (!this.searchTerm.trim()) {
      this.filteredChildrenList = this.childrenList;
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredChildrenList = this.childrenList.filter(c =>
        c.full_name.toLowerCase().includes(term)
      );
    }
  }

  get childrenGroupedByNewCiclo() {
    const groups: { [key: string]: ChildToPromote[] } = {};
    // Use childrenList (or filteredChildrenList depending on preference; using childrenList to export all children processed in the cutoff grouped by their new cycle)
    this.childrenList.forEach(child => {
      const cycle = child.newCiclo || 'No asignado';
      if (!groups[cycle]) {
        groups[cycle] = [];
      }
      groups[cycle].push(child);
    });
    return Object.entries(groups).map(([cycle, list]) => ({
      cycle,
      list
    }));
  }

  async exportPDF() {
    this.isPrinting = true;
    this.currentDate = new Date();

    // Wait for Angular to update the DOM (showing the print layout)
    setTimeout(async () => {
      const element = document.getElementById('cutoff-pdf-container');
      if (!element) {
        this.isPrinting = false;
        return;
      }

      try {
        this.alertCtrl.openFestivaAlert('loading', 'Generando PDF...', 'Por favor espere');
        
        // Allow time for the loading alert to present
        await new Promise(resolve => setTimeout(resolve, 300));

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pageHeight = pdf.internal.pageSize.getHeight();

        const footerMargin = 20; // 20mm margin at the bottom
        const topMargin = 15;    // 15mm top margin for subsequent pages
        const usableHeightFirstPage = pageHeight - footerMargin;
        const usableHeightNextPages = pageHeight - footerMargin - topMargin;

        let position = 0;
        let heightLeft = pdfHeight;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        
        // Hide the bottom part to create a footer margin
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, usableHeightFirstPage, pdfWidth, footerMargin, 'F');
        heightLeft -= usableHeightFirstPage;

        while (heightLeft > 0) {
          position = topMargin - (pdfHeight - heightLeft);
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);

          // Hide margins on subsequent pages
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pdfWidth, topMargin, 'F'); // Top margin
          pdf.rect(0, pageHeight - footerMargin, pdfWidth, footerMargin, 'F'); // Footer margin

          heightLeft -= usableHeightNextPages;
        }

        pdf.save(`corte_ciclos_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        this.alertCtrl.openFestivaAlert('danger', 'Error', 'Ocurrió un error al generar el PDF.');
      } finally {
        this.alertCtrl.dismiss();
        this.isPrinting = false;
      }
    }, 150);
  }
}
