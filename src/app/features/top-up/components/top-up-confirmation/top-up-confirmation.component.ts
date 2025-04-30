import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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

  private readonly modalCtrl = inject(ModalController);

  topUpData = {
    amount: '$4.99',
    title: 'Top Up to send',
    description: 'Send this top up to continue sharing and connecting with that special someone'
  };

  constructor() { }

  ngOnInit() { }

  onConfirm() {
    console.log('Confirmed top-up');
    this.modalCtrl.dismiss({success: true})
  }

  onCancel() {
    console.log('Cancelled top-up');
    this.modalCtrl.dismiss({success: true})

  }

}
