import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-top-up-confirmation',
  templateUrl: './top-up-confirmation.component.html',
  styleUrls: ['./top-up-confirmation.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class TopUpConfirmationComponent  implements OnInit {

  @Input() amount: number = 0;
  private readonly modalCtrl = inject(ModalController);

  topUpData = {
    amount: this.amount,
    title: 'Top Up to send',
    description: 'Send this top up to continue sharing and connecting with that special someone'
  };

  constructor() { }

  ngOnInit() { 
    this.topUpData.amount = this.amount;
  }

  onConfirm() {
    console.log('Confirmed top-up');
    this.modalCtrl.dismiss({success: true})
  }

  onCancel() {
    console.log('Cancelled top-up');
    this.modalCtrl.dismiss({success: false})

  }

}
