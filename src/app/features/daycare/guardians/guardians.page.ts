import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  personOutline,
  callOutline,
  briefcaseOutline,
  cardOutline,
  eyeOutline,
  createOutline,
  trashOutline,
  peopleOutline,
  filterOutline,
  closeCircle,
  checkmarkCircle,
  alertCircleOutline,
  chevronDown,
  chevronUp
} from 'ionicons/icons';
import { GuardianDetailsModalComponent } from 'src/app/shared/daycare/guardian-details-modal/guardian-details-modal.component';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { ActionSheetController } from '@ionic/angular/standalone';

interface Guardian {
  id: string;
  full_name: string;
  identification_type: string;
  identification_number: string;
  phone_number: string | null;
  workplace: string | null;
  created_at: string;
  children_count?: number;
}

@Component({
  selector: 'app-guardians-page',
  templateUrl: './guardians.page.html',
  styleUrls: ['./guardians.page.scss'],
  standalone: true,
  imports: [...StandAloneModules, GuardianDetailsModalComponent],
  providers: [ModalController]
})
export class GuardiansPage implements OnDestroy {
  supabaseService = inject(SupabaseService);
  alertService = inject(AlertControllerService);
  router = inject(Router);
  actionSheetCtrl = inject(ActionSheetController);
  modalCtrl = inject(ModalController);

  allGuardians: Guardian[] = [];
  filteredGuardians: Guardian[] = [];

  searchTerm: string = '';
  searchType: 'all' | 'name' | 'identification' | 'phone' | 'workplace' = 'all';
  showFilterDropdown: boolean = false;
  loading: boolean = false;

  selectedGuardian: Guardian | null = null;
  showDetailsModal: boolean = false;

  sortField: 'name' | 'children' | 'created' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const filterContainer = document.querySelector('.filter-container');

    if (filterContainer && !filterContainer.contains(target)) {
      this.showFilterDropdown = false;
    }
  }

  constructor() {
  
  }

  async ionViewWillEnter() {
    await this.loadGuardians();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

    async openActions(guardian: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Acciones',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Ver Detalles',
          icon: 'eye',
          cssClass: 'option-sheet-button',
          handler: () => {
            this.viewDetails(guardian);
          }
        },
       
        {
          text: 'Editar Tutor',
          icon: 'create',
          cssClass: 'option-sheet-button',
          handler: () => {
            this.editGuardian(guardian);
          }
        },
        {
          text: 'Eliminar Tutor',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'option-sheet-button',
          handler: () => {
            this.deleteGuardian(guardian);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            // Acción de cancelar
          }
        }
      ]
    });

    await actionSheet.present();
  }

  async loadGuardians() {
    this.loading = true;
    try {
      const supabase = this.supabaseService.getSupabase();

      const { data, error } = await supabase
        .from('legal_parents')
        .select(`
          *,
          children_legal_parents(count)
        `)
        .order('full_name');

      if (error) throw error;

      this.allGuardians = (data || []).map((guardian: any) => ({
        ...guardian,
        children_count: guardian.children_legal_parents?.[0]?.count || 0
      }));

      this.filteredGuardians = [...this.allGuardians];
      this.applySort();
    } catch (error) {
      console.error('Error loading guardians:', error);
      await this.alertService.openFestivaAlert(
        'danger',
        'Error',
        'No se pudieron cargar los tutores'
      );
    } finally {
      this.loading = false;
    }
  }

  filterGuardians() {
    if (!this.searchTerm.trim()) {
      this.filteredGuardians = [...this.allGuardians];
      this.applySort();
      return;
    }

    const term = this.searchTerm.toLowerCase();

    this.filteredGuardians = this.allGuardians.filter(guardian => {
      switch (this.searchType) {
        case 'name':
          return guardian.full_name.toLowerCase().includes(term);
        case 'identification':
          return guardian.identification_number.toLowerCase().includes(term);
        case 'phone':
          return guardian.phone_number?.toLowerCase().includes(term) || false;
        case 'workplace':
          return guardian.workplace?.toLowerCase().includes(term) || false;
        case 'all':
        default:
          return (
            guardian.full_name.toLowerCase().includes(term) ||
            guardian.identification_number.toLowerCase().includes(term) ||
            guardian.phone_number?.toLowerCase().includes(term) ||
            guardian.workplace?.toLowerCase().includes(term)
          );
      }
    });

    this.applySort();
  }

  setSearchType(type: 'all' | 'name' | 'identification' | 'phone' | 'workplace') {
    this.searchType = type;
    this.showFilterDropdown = false;
    this.filterGuardians();
  }

  getSearchTypeLabel(): string {
    const labels = {
      all: 'Todos los campos',
      name: 'Nombre',
      identification: 'Identificación',
      phone: 'Teléfono',
      workplace: 'Lugar de trabajo'
    };
    return labels[this.searchType];
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchType = 'all';
    this.filteredGuardians = [...this.allGuardians];
    this.applySort();
  }

  setSortField(field: 'name' | 'children' | 'created') {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  applySort() {
    this.filteredGuardians.sort((a, b) => {
      let comparison = 0;

      switch (this.sortField) {
        case 'name':
          comparison = a.full_name.localeCompare(b.full_name);
          break;
        case 'children':
          comparison = (a.children_count || 0) - (b.children_count || 0);
          break;
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  async viewDetails(guardian: Guardian) {
    this.selectedGuardian = guardian;
    this.showDetailsModal = true;

    const modal = await this.modalCtrl.create({
      component: GuardianDetailsModalComponent,
      cssClass: 'full-modal',
      componentProps: {
        guardian: guardian,
        isOpen: true
      }
    });

    await modal.present();

    const result = await modal.onDidDismiss();
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedGuardian = null;
  }

  editGuardian(guardian: Guardian) {
    this.router.navigate(['/daycare/guardian-edit', guardian.id]);
  }

  async deleteGuardian(guardian: Guardian) {
  
     await this.alertService.confirmation(async ()=> {
       try {
        const supabase = this.supabaseService.getSupabase();

        const { error } = await supabase
          .from('legal_parents')
          .delete()
          .eq('id', guardian.id);

        if (error) throw error;

        await this.alertService.openFestivaAlert(
          'success',
          'Éxito',
          'El tutor ha sido eliminado correctamente'
        );

        await this.loadGuardians();
      } catch (error) {
        console.error('Error deleting guardian:', error);
        await this.alertService.openFestivaAlert(
          'danger',
          'Error',
          'No se pudo eliminar el tutor. Puede estar asociado a inscripciones activas.'
        );
      }
    }, `¿Estás seguro de que deseas eliminar al tutor ${guardian.full_name}?`, 'Confirmar eliminación', 'Eliminar', ()=> {}, 'Cancelar');

  }

  getChildrenCountText(count: number): string {
    if (count === 0) return 'Sin hijos';
    if (count === 1) return '1 hijo';
    return `${count} hijos`;
  }
}
