import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { IonicModule, ModalController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-festiva-header',
  templateUrl: './festiva-header.component.html',
  styleUrls: ['./festiva-header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FestivaHeaderComponent  implements OnInit {

  isIos: boolean = Capacitor.getPlatform() === 'ios';
  //Services
  private readonly navCtrl = inject(NavController);
  private modalCtrl = inject(ModalController);
  //Inputs
  @Input() title: string = '';
  @Input() bells: boolean = false;
  @Input() isModal: boolean = false;

  constructor() { }

  ngOnInit() {}

  back(){
    this.isModal ? this.modalCtrl.dismiss() : this.navCtrl.back();
  }

}
