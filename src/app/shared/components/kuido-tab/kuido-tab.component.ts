import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-kuido-tab',
  templateUrl: './kuido-tab.component.html',
  styleUrls: ['./kuido-tab.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class KuidoTabComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
