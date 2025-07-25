import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-kuido-header',
  templateUrl: './kuido-header.component.html',
  styleUrls: ['./kuido-header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class KuidoHeaderComponent  implements OnInit {

  isIos: boolean = Capacitor.getPlatform() === 'ios';
  //Services
  private readonly navCtrl = inject(NavController);
  //Inputs
  @Input() title: string = '';
  @Input() bells: boolean = false;

  constructor() { }

  ngOnInit() {}

  back(){
    this.navCtrl.back();
  }

}
