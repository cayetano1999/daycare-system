import { Component, OnInit, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { Profile } from 'src/app/core/interface/profile.interface';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { ExpenseModalComponent } from './components/expense-modal/expense-modal.component';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { RoleAccessDirective } from 'src/app/shared/directives/role-access.directive';
import { Capacitor } from '@capacitor/core';

interface Expense {
  id: string;
  name: string;
  cost: number;
  description: string;
}

interface EventExpenseRecord {
  id: string;
  name: string;
  expenses: Expense[];
  base: number;
  event_id: string;
  user_id: string;
  created_at: string;
}

@Component({
  selector: 'app-event-expenses',
  templateUrl: './event-expenses.page.html',
  styleUrls: ['./event-expenses.page.scss'],
  imports: [...StandAloneModules, RoleAccessDirective]
})
export class EventExpensesPage implements OnInit {
  @Input() eventId: string = '';
  @Input() eventName: string = '';
  @Input() event: FestivaEvent | null = null;
  @Input() user: Profile | null = null;

  expenses: Expense[] = [];
  budget: number = 40000;
  expenseRecord: EventExpenseRecord | null = null;

  showModal = false;
  editingExpense: Expense | null = null;
  showDeleteConfirm = false;
  expenseToDelete: string | null = null;

  isLoading = false;
  isLoadingData = true;
  isIos = Capacitor.getPlatform() === 'ios';

  alertController = inject(AlertControllerService);
  alertControllerIonic = inject(AlertController);

  navController = inject(NavController);
  supabaseService = inject(SupabaseService);
  router = inject(Router);
  storageHelper = inject(StorageHelper);
  modalCtrl = inject(ModalController);


  /**
   *
   */
  constructor() {

  }

  ngOnInit() {
    // Component initialization
  }

  async ionViewWillEnter() {
    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.event = state.event;
    this.user = await this.storageHelper.getStorageKey<Profile>(StorageKeys.USER_DATA);
    await this.loadExpenseData();

  }

  async loadExpenseData() {
    this.isLoadingData = true;

    try {
      // Check if expense record exists for this event and user
      const { data: existingRecord, error: fetchError } = await this.supabaseService.getRecord(
        'event_expenses',
        ['*'],
        'event_id',
        this.event?.id || ''
      ) as any;

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingRecord) {
        console.log('Existing expense record found:', existingRecord);
        this.expenseRecord = existingRecord as any;
        this.budget = existingRecord.base || 40000;
        this.expenses = existingRecord.expenses || [];
      } else {
        // No record exists, create one automatically
        await this.createInitialExpenseRecord();
      }
    } catch (error: any) {
      console.error('Error loading expense data:', error);
      const alert = await this.alertController.openFestivaAlert('danger', 'Error', 'No se pudieron cargar los gastos del evento.', true, 'Aceptar')
      await alert.present();
    } finally {
      this.isLoadingData = false;
    }
  }

  async createInitialExpenseRecord() {
    try {
      const newRecord = {
        name: 'Gastos de mi evento',
        expenses: [],
        base: 40000,
        event_id: this.event?.id || null,
        user_id: this.user?.id || null
      };

      const { data, error } = await this.supabaseService.createRecord('event_expenses', newRecord);
      console.log('Created initial expense record:', data);
      if (error) {
        throw error;
      }

      this.expenseRecord = data;
      this.budget = 40000;
      this.expenses = [];
    } catch (error) {
      console.error('Error creating initial expense record:', error);
      throw error;
    }
  }

  async updateExpenseRecord() {
    if (!this.expenseRecord) return;

    try {
      const updateData = {
        expenses: this.expenses,
        base: this.budget
      };

      const { data, error } = await this.supabaseService.updateRecord(
        'event_expenses',
        this.expenseRecord.id,
        updateData
      );

      if (error) {
        throw error;
      }

      this.expenseRecord = { ...this.expenseRecord, ...updateData };

    } catch (error) {
      console.error('Error updating expense record:', error);
      throw error;
    }
  }

  // Calculations
  get totalExpenses(): number {
    return this.expenses.reduce((sum, expense) => sum + expense.cost, 0);
  }

  get remainingBudget(): number {
    return this.budget - this.totalExpenses;
  }

  get budgetPercentage(): number {
    return this.budget > 0 ? (this.totalExpenses / this.budget) * 100 : 0;
  }

  // Currency formatting
  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  // Modal management
  async openCreateModal() {
    this.editingExpense = null;
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: {
        isOpen: true,
        editingExpense: this.editingExpense
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.handleExpenseSave(data);
    }
  }

  async openEditModal(expense: Expense) {
    this.editingExpense = expense;

    // this.showModal = true;
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: {
        isOpen: true,
        editingExpense: this.editingExpense
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.handleExpenseSave(data);
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingExpense = null;
  }

  async handleExpenseSave(expenseData: { name: string; cost: number; description: string }) {
    this.isLoading = true;

    try {
      if (this.editingExpense) {
        // Update existing expense
        const updatedExpense: Expense = {
          ...this.editingExpense,
          name: expenseData.name,
          cost: expenseData.cost,
          description: expenseData.description
        };

        this.expenses = this.expenses.map(exp =>
          exp.id === this.editingExpense!.id ? updatedExpense : exp
        );
         this.sendNotificationForOwner(`${this.user?.full_name || 'Alguien'} actualizó el gasto: ${updatedExpense?.name || ''}`);

      } else {
        // Create new expense
        const newExpense: Expense = {
          id: Date.now().toString(),
          name: expenseData.name,
          cost: expenseData.cost,
          description: expenseData.description
        };

        this.expenses = [...this.expenses, newExpense];
         this.sendNotificationForOwner(`${this.user?.full_name || 'Alguien'} registró el gasto: ${newExpense?.name || ''}`);

      }

      // Update record in Supabase
      await this.updateExpenseRecord();

      this.closeModal();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      await this.alertController.openFestivaAlert('danger', 'Error', 'No se pudo guardar el gasto. Intenta nuevamente.', true, 'OK');
    } finally {
      this.isLoading = false;
    }
  }

  // Budget editing
  async editBudget() {
    const alert = await this.alertControllerIonic.create({
      header: 'Editar Presupuesto',
      message: 'Ingresa el nuevo presupuesto para tu evento:',
      inputs: [
        {
          name: 'budget',
          type: 'number',
          placeholder: 'Presupuesto',
          value: this.budget.toString(),
          min: 0
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            const newBudget = Number(data.budget);
            if (newBudget && newBudget > 0) {
              this.budget = newBudget;
              try {
                await this.updateExpenseRecord();
              } catch (error) {
                console.error('Error updating budget:', error);
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Delete management
  async confirmDelete(expenseId: string) {
    this.expenseToDelete = expenseId;
    // this.showDeleteConfirm = true;
    const result = await this.alertController.openFestivaAlert('danger', 'Confirmar eliminación', '¿Estás seguro de que deseas eliminar este gasto?', true, 'Cancelar', 'Eliminar');
    if (result.action === 'confirm') {
      await this.handleDelete();
    }
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.expenseToDelete = null;
  }

  async handleDelete() {
    if (!this.expenseToDelete) return;

    try {
      this.sendNotificationForOwner(`${this.user?.full_name || 'Alguien'} eliminó el gasto: ${this.expenses.find(exp => exp.id === this.expenseToDelete)?.name || ''}`);
      this.expenses = this.expenses.filter(exp => exp.id !== this.expenseToDelete);
      await this.updateExpenseRecord();

      this.showDeleteConfirm = false;
      this.expenseToDelete = null;
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      await this.alertController.openFestivaAlert('danger', 'Error', 'No se pudo eliminar el gasto. Intenta nuevamente.', true, 'OK');
    }
  }

  // Navigation
  goBack() {
    // this.navController.back();
    this.router.navigate(['/events/management'], { state: { event: this.event }, replaceUrl: true });
  }

  // Helper for template
  trackByExpenseId(index: number, expense: Expense): string {
    return expense.id;
  }

  // Helper for template
  Math = Math;

  async sendNotificationForOwner(message: string) {
    console.log('Sending notification to owner:', this.event);
    if (this.event?.user?.id === this.user?.id) return; // No need to notify if user is the owner

    if (!this.event?.user?.push_token) return;

    const { data, error } = await this.supabaseService.sendPushNotification(
      this.event.user.push_token,
      this.event.name || 'Tu evento',
      message,
      '',
      { screen: 'invite-details', inviteId: 'abc-123' }
    );
  }
}