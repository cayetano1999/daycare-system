import { Component, inject, Input, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-kuido-header',
  templateUrl: './kuido-header.component.html',
  styleUrls: ['./kuido-header.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class KuidoHeaderComponent  implements OnInit {

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
