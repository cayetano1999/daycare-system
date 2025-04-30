import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-top-up-success',
  templateUrl: './top-up-success.component.html',
  styleUrls: ['./top-up-success.component.scss'],
  imports: [IonicModule, CommonModule]
})
export class TopUpSuccessComponent  implements OnInit {

  //Services
  private readonly modalCtrl = inject(ModalController);

  @Input() recipientName: string = '';
  @Input() recipientPhone: string = '';
  @Input() recipientImage: string = '';

  ngOnInit(): void {
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
