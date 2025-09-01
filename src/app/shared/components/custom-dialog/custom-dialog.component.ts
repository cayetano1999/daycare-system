import { Component, inject, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StandAloneModules } from '../../stand-alone-module';

@Component({
  selector: 'app-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.scss'],
  imports: [...StandAloneModules]
})
export class CustomDialogComponent  implements OnInit {

  // Dialog type: 'success', 'warning', 'question', 'danger'
  @Input() type: 'success' | 'warning' | 'question' | 'danger' = 'success';
  // Dialog title
  @Input() title: string = '';
  // Dialog message
  @Input() message: string = '';
  // Show cancel button
  @Input() showCancel: boolean = false;
  // Cancel button text
  @Input() cancelText?: string;
  // Confirm button text
  @Input() confirmText?: string;

  private modalController = inject(ModalController);

  constructor() { }

  ngOnInit() {}

  async cancel() {
    await this.modalController.dismiss({ action: 'cancel' });
  }

  async confirm() {
    await this.modalController.dismiss({ action: 'confirm' });
  }

}
