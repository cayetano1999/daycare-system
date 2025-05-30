import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-kuido-tab',
  templateUrl: './kuido-tab.component.html',
  styleUrls: ['./kuido-tab.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class KuidoTabComponent  implements OnInit {

  private readonly navCtrl = inject(NavController);

  constructor() { }

  ngOnInit() {}


  redirect(url: string) {
    this.navCtrl.navigateRoot(url);
  }

}
