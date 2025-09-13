import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { Profile } from 'src/app/core/interface/profile.interface';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { ModalGroupComponent } from './components/modal-group/modal-group.component';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { Router } from '@angular/router';
import { RoleAccessDirective } from 'src/app/shared/directives/role-access.directive';
import { Capacitor } from '@capacitor/core';

export interface Group {
  id: string;
  name: string;
  color_exa: string;
  created_at: string;
  user_id: string;
  event_id: string;
}

interface GroupFormData {
  name: string;
  color_exa: string;
}

@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
  imports: [...StandAloneModules, RoleAccessDirective]
})
export class GroupsPage implements OnInit {
  groups: Group[] = [];

  showModal = false;
  editingGroup: Group | null = null;
  showDeleteConfirm = false;
  groupToDelete: string | null = null;

  isLoading = false;
  isLoadingData = true;

  formData: GroupFormData = {
    name: '',
    color_exa: '#3B82F6'
  };

  formErrors: Record<string, string> = {};

  // Predefined colors for quick selection
  predefinedColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#A855F7'  // Violet
  ];
  user: Profile | null = null;
  event: FestivaEvent | null = null;
  isIos = Capacitor.getPlatform() === 'ios';

  private readonly router = inject(Router);

  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private supabaseService: SupabaseService,
    private storageHelper: StorageHelper,
    private alertCtrl: AlertControllerService
  ) {

  }

  ngOnInit() {
    // Component initialization
  }

  async ionViewWillEnter() {
    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.event = state.event;

    this.user = await this.storageHelper.getStorageKey<Profile>(StorageKeys.USER_DATA);
    await this.loadGroups();
  }

  async loadGroups() {
    this.isLoadingData = true;

    try {
      const { data, error } = await this.supabaseService.getRecords('groups', ['*'], 'event_id', this.event?.id || '', 'created_at');

      if (error) {
        throw error;
      }

      this.groups = data as any[] || [];
    } catch (error: any) {
      console.error('Error loading groups:', error);

      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudieron cargar los grupos.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.isLoadingData = false;
    }
  }

  // Calculations
  get totalGroups(): number {
    return this.groups.length;
  }

  get mostRecentGroup(): string {
    if (this.groups.length === 0) return 'Ninguno';

    const sorted = [...this.groups].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sorted[0].name;
  }

  get uniqueColors(): string[] {
    return [...new Set(this.groups.map(g => g.color_exa))];
  }

  // Modal management
  async openCreateModal() {
    console.log('Opening create group modal', this.event);
    const modal = await this.modalController.create({
      component: ModalGroupComponent,
      componentProps: {
        editingGroup: null,
        existingGroups: this.groups,
        user: this.user,
        event: this.event
      },
      cssClass: 'groups-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.action === 'create') {
      // Add new group to local state
      this.groups = [...this.groups, data.data];
    }
  }

  async openEditModal(group: Group) {
    const modal = await this.modalController.create({
      component: ModalGroupComponent,
      componentProps: {
        editingGroup: group,
        existingGroups: this.groups
      },
      cssClass: 'groups-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.action === 'update') {
      // Update group in local state
      this.groups = this.groups.map(g =>
        g.id === group.id ? data.data : g
      );
    }
  }

  resetForm() {
    this.formData = { name: '', color_exa: '#3B82F6' };
    this.formErrors = {};
    this.editingGroup = null;
  }

  // Delete management
  async confirmDelete(groupId: string) {
    this.groupToDelete = groupId;
    // this.showDeleteConfirm = true;
    const result = await this.alertCtrl.openFestivaAlert('danger', 'Confirmar eliminación', '¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer.', true, 'Cancelar', 'Eliminar');

    if (result.action === 'confirm') {
      await this.handleDelete();
    }
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.groupToDelete = null;
  }

  async handleDelete() {
    if (!this.groupToDelete) return;

    try {
      const { error } = await this.supabaseService.deleteRecord('groups', this.groupToDelete);

      if (error) {
        throw error;
      }

      this.groups = this.groups.filter(group => group.id !== this.groupToDelete);
      this.showDeleteConfirm = false;
      this.groupToDelete = null;
    } catch (error: any) {
      await this.alertCtrl.openFestivaAlert('danger', 'Error', 'No se pudo eliminar el grupo. Intenta nuevamente.');
    }
  }

  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/events/management'], { state: { event: this.event }, replaceUrl: true });

  }

  // Helper for template
  trackByGroupId(index: number, group: Group): string {
    return group.id;
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Helper for template
  Math = Math;
}