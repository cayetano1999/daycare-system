import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

interface GiftItem {
  article_code?: string;
  article_name: string;
  bought: boolean;
}

interface GiftItemFormData {
  article_code: string;
  article_name: string;
  bought: boolean;
}

@Component({
  selector: 'app-gift-item-modal',
  templateUrl: './gift-item-modal.component.html',
  styleUrls: ['./gift-item-modal.component.scss'],
  imports:[...StandAloneModules]
})
export class GiftItemModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() editingItem: GiftItem | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ article_code: string; article_name: string; bought: boolean }>();

  formData: GiftItemFormData = {
    article_code: '',
    article_name: '',
    bought: false
  };

  isLoading = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['editingItem'] && this.editingItem) {
      // Populate form with editing data
      this.formData = {
        article_code: this.editingItem.article_code || '',
        article_name: this.editingItem.article_name,
        bought: this.editingItem.bought
      };
    } else if (changes['isOpen'] && this.isOpen && !this.editingItem) {
      // Reset form for new item
      this.resetForm();
    }
  }

  resetForm() {
    this.formData = {
      article_code: '',
      article_name: '',
      bought: false
    };
  }

  closeModal() {
    this.close.emit();
    this.resetForm();
  }

  handleSubmit() {
    if (!this.formData.article_name.trim()) {
      return;
    }

    this.isLoading = true;

    // Simulate loading delay
    setTimeout(() => {
      this.save.emit({
        article_code: this.formData.article_code.trim(),
        article_name: this.formData.article_name.trim(),
        bought: this.formData.bought
      });
      
      this.isLoading = false;
      this.resetForm();
    }, 500);
  }
}