import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

interface Expense {
  id: string;
  name: string;
  cost: number;
  description: string;
}

interface ExpenseFormData {
  name: string;
  cost: number | null;
  description: string;
}

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  styleUrls: ['./expense-modal.component.scss'],
  imports: [...StandAloneModules]
})
export class ExpenseModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() editingExpense: Expense | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ name: string; cost: number; description: string }>();

  formData: ExpenseFormData = {
    name: '',
    cost: null,
    description: ''
  };

  isLoading = false;

  private modalCtrl = inject(ModalController);

  ngOnInit() {
    if (this.editingExpense) {
      // Populate form with editing data
      this.formData = {
        name: this.editingExpense.name,
        cost: this.editingExpense.cost,
        description: this.editingExpense.description
      };
    } else if (this.isOpen && !this.editingExpense) {
      // Reset form for new expense
      this.resetForm();
    }
  }

  resetForm() {
    this.formData = {
      name: '',
      cost: null,
      description: ''
    };
  }

  closeModal() {
    this.modalCtrl.dismiss();
    this.resetForm();
  }

  handleSubmit() {
    if (!this.formData.name.trim() || !this.formData.cost || !this.formData.description.trim()) {
      return;
    }

    if (this.formData.cost <= 0) {
      return;
    }

    this.isLoading = true;

    // Simulate loading delay
    this.modalCtrl.dismiss({
      name: this.formData.name.trim(),
      cost: this.formData.cost!,
      description: this.formData.description.trim()
    });

    this.isLoading = false;
    this.resetForm();
  }
}