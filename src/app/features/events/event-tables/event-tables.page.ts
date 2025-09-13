import { Component, inject, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { AddTableModalComponent } from './components/add-table-modal/add-table-modal.component';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { Router } from '@angular/router';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { Profile } from 'src/app/core/interface/profile.interface';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { ToastControllerService } from 'src/app/core/services/ionic/toast-controller.service';
import { RoleAccessDirective } from 'src/app/shared/directives/role-access.directive';
import { Capacitor } from '@capacitor/core';

interface EventTable {
  id: string;
  created_at: string;
  event_id: string;
  name: string;
  capacity: number;
  available: number;
}

@Component({
  selector: 'app-event-tables',
  templateUrl: './event-tables.page.html',
  styleUrls: ['./event-tables.page.scss'],
  imports: [...StandAloneModules, RoleAccessDirective]
})
export class EventTablesPage implements OnInit {
  tables: EventTable[] = [];
  eventId: string = 'event-1'; // TODO: Get from route params
  eventName: string = 'de María y José'; // TODO: Get from event data
  isLoading: boolean = true;

  // Delete confirmation
  showDeleteConfirm: boolean = false;
  tableToDelete: string | null = null;
  event: FestivaEvent | null = null;
  user: Profile | null = null;
  isIos = Capacitor.getPlatform() === 'ios';

  private readonly router = inject(Router);
  private readonly storageHelper = inject(StorageHelper);
  private readonly navCtrl = inject(NavController);
  private readonly toastCtrl = inject(ToastControllerService);

  constructor(
    private supabaseService: SupabaseService,
    private modalController: ModalController
  ) {


  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
       const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.event = state.event;

    if (this.event) {
      this.eventId = this.event.id || '';
    }
    await this.loadTables();
  }

  async loadTables() {
    this.isLoading = true;

    try {
      const { data, error }: any = await this.supabaseService.getRecords<EventTable>(
        'event_tables',
        ['*'],
        'event_id',
        this.eventId,
        'created_at'
      );

      if (error) {
        console.error('Error loading tables:', error);
        this.showToast('Error al cargar las mesas', 'error');
        return;
      }

      this.tables = data || [];

    } catch (error) {
      console.error('Error loading tables:', error);
      this.showToast('Error al cargar las mesas', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async openAddTableModal() {
    const modal = await this.modalController.create({
      component: AddTableModalComponent,
      componentProps: {
        mode: 'create',
        eventId: this.eventId
      },
      animated: true
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.success) {
        this.loadTables(); // Reload tables list
        this.showToast('Mesa agregada exitosamente', 'success');
      }
    });

    return await modal.present();
  }

  async openEditTableModal(table: EventTable) {
    const modal = await this.modalController.create({
      component: AddTableModalComponent,
      componentProps: {
        mode: 'edit',
        eventId: this.eventId,
        table: table,
        user: this.user
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.success) {
        this.loadTables(); // Reload tables list
        this.showToast('Mesa actualizada exitosamente', 'success');
      }
    });

    return await modal.present();
  }

  confirmDelete(tableId: string) {
    this.tableToDelete = tableId;
    this.showDeleteConfirm = true;
  }

  async handleDelete() {
    if (!this.tableToDelete) return;

    try {
      const { error } = await this.supabaseService.deleteTableSafely(this.tableToDelete);

      if (error) {
        console.error('Error deleting table:', error);
        this.showToast('Error al eliminar la mesa', 'error');
        return;
      }

      this.showToast('Mesa eliminada exitosamente', 'success');
      await this.loadTables(); // Reload tables list

    } catch (error) {
      console.error('Error deleting table:', error);
      this.showToast('Error al eliminar la mesa', 'error');
    } finally {
      this.showDeleteConfirm = false;
      this.tableToDelete = null;
    }
  }

  getTotalCapacity(): number {
    return this.tables.reduce((total, table) => total + Number(table.capacity), 0);
  }

  getAverageCapacity(): number {
    if (this.tables.length === 0) return 0;
    return Math.round(this.getTotalCapacity() / this.tables.length);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  goBack() {
    // TODO: Implement navigation back
    this.router.navigate(['/events/management'], { state: { event: this.event }, replaceUrl: true });

  }

  async showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    await this.toastCtrl.showMessageToast(message);
  }
}