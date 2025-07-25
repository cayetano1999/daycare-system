import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

export type AlertMessageType = 'alert' | 'question';

@Component({
  selector: 'app-alert-message',
  templateUrl: './alert-message.component.html',
  styleUrls: ['./alert-message.component.scss'],
  imports: [IonicModule, CommonModule]

})
export class AlertMessageComponent  implements OnInit {

  //Inputs
  @Input() message: string = '';
  @Input() title: string = '';
  @Input() img: string = '';
  @Input() type: AlertMessageType = 'alert';
  @Input() textConfirm: string = 'OK';


  //Properties
  modalCtrl = inject(ModalController);

  constructor() { }

  ngOnInit() {}

  dismiss(){
    this.modalCtrl.dismiss();
  }

  dismissConfirm(result: boolean) {
    this.modalCtrl.dismiss({success: result});
  }

}
