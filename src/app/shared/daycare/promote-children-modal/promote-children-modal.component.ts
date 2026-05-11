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

interface ChildToPromote {
  id: string;
  full_name: string;
  birth_date: string | Date;
  ciclo: string;
  cicloToValidate: string;
  newCiclo?: string;
}

@Component({
  selector: 'app-promote-children-modal',
  standalone: true,
  imports: [...StandAloneModules, CyclesLegendComponent],
  templateUrl: './promote-children-modal.component.html',
  styleUrls: ['./promote-children-modal.component.scss']
})
export class PromoteChildrenModalComponent implements OnInit {
  @Input() children: ChildToPromote[] = [];
  
  modalCtrl = inject(ModalController);
  supabaseService = inject(SupabaseService);
  alertCtrl = inject(AlertControllerService);

  ciclos: string[] = CICLOS_CURSOS_DROPDOWN.map(c => c.value);
  childrenList: ChildToPromote[] = [];

  constructor() {
    addIcons({ warning, closeOutline });
  }

  ngOnInit() {
    // Initialize the list with the correct cycle pre-selected
    this.childrenList = this.children.map(c => ({
      ...c,
      newCiclo: c.cicloToValidate || c.ciclo
    }));
  }

  close() {
    this.modalCtrl.dismiss();
  }

  calculateAge(birthDate: string | Date): string {
    return calculateAgeToString(birthDate.toString());
  }

  async promoteChildren() {
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
      this.alertCtrl.openModalAlert('Promoviendo niños...');
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
      console.error('Error promoting children', error);
      await this.alertCtrl.dismiss();
      this.alertCtrl.openFestivaAlert('danger', 'Error', 'Ocurrió un error al promover a los niños.');
    }
  }
}
